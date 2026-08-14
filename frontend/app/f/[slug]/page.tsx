"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { api, ApiError } from "../../../lib/api-client";
import { Question, QuestionOption } from "../../../types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, ArrowRight, ArrowLeft, AlertCircle, Star, Eye
} from "lucide-react";

export default function PublicRespondentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const urlTheme = searchParams.get("theme");

  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Respondent state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Progress recovery drawer
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Cross-frame ESC listener for iframe previews
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        window.parent.postMessage({ type: "CLOSE_PREVIEW" }, "*");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load Form Definition
  useEffect(() => {
    if (slug) {
      setLoading(true);
      api
        .getPublicForm(slug)
        .then((data) => {
          setFormData(data);
          const savedKey = `formflow_draft_${slug}`;
          const localDraft = localStorage.getItem(savedKey);
          if (localDraft) {
            try {
              const parsed = JSON.parse(localDraft);
              if (parsed.answers && Object.keys(parsed.answers).length > 0) {
                setHasSavedDraft(true);
                setShowDraftPrompt(true);
              }
            } catch (e) {}
          }
        })
        .catch((err: any) => {
          const msg = err instanceof ApiError ? err.message : "Form unavailable or not published.";
          setErrorMsg(msg);
        })
        .finally(() => setLoading(false));
    }
  }, [slug]);

  // Focus current input on slide transition
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, showDraftPrompt]);

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showDraftPrompt || submitting || submitted || !formData) return;

      const currentQ = formData.questions[currentIndex];
      if (!currentQ) return;

      if (e.key === "Enter" && !e.shiftKey) {
        if (currentQ.type === "long_text" && !e.ctrlKey) return;
        e.preventDefault();
        handleNext();
      } else if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        handlePrev();
      } else if (currentQ.type === "yes_no") {
        if (e.key.toLowerCase() === "y") {
          e.preventDefault();
          handleAnswer(currentQ.id, "Yes");
        } else if (e.key.toLowerCase() === "n") {
          e.preventDefault();
          handleAnswer(currentQ.id, "No");
        }
      } else if ((currentQ.type === "multiple_choice" || currentQ.type === "dropdown") && currentQ.options) {
        const numKey = parseInt(e.key);
        if (!isNaN(numKey) && numKey >= 1 && numKey <= currentQ.options.length) {
          e.preventDefault();
          const selectedOpt = currentQ.options[numKey - 1];
          handleAnswer(currentQ.id, selectedOpt.value);
        }
      } else if (currentQ.type === "rating") {
        const numKey = parseInt(e.key);
        if (!isNaN(numKey) && numKey >= 1 && numKey <= 5) {
          e.preventDefault();
          handleAnswer(currentQ.id, numKey);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, answers, showDraftPrompt, submitting, submitted, formData]);

  // Auto-save draft responses
  useEffect(() => {
    if (slug && Object.keys(answers).length > 0 && !submitted) {
      const savedKey = `formflow_draft_${slug}`;
      localStorage.setItem(savedKey, JSON.stringify({ answers, currentIndex }));
    }
  }, [answers, currentIndex, slug, submitted]);

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setValidationError(null);
  };

  const validateCurrent = (): boolean => {
    if (!formData) return false;
    const currentQ = formData.questions[currentIndex];
    if (!currentQ) return false;

    const val = answers[currentQ.id];

    if (currentQ.required) {
      if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
        setValidationError("This question requires an answer before proceeding.");
        return false;
      }
    }

    if (currentQ.type === "email" && val) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        setValidationError("Please enter a valid email address.");
        return false;
      }
    }

    setValidationError(null);
    return true;
  };

  const handleNext = () => {
    if (!validateCurrent()) return;

    if (currentIndex < (formData?.questions?.length || 0) - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0 && formData?.allow_back_navigation) {
      setValidationError(null);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrent()) return;

    try {
      setSubmitting(true);
      const completionTime = Math.round((Date.now() - startTimeRef.current) / 1000);

      const responsePayload = {
        answers: Object.entries(answers).map(([qId, val]) => ({
          question_id: qId,
          value: typeof val === "object" ? JSON.stringify(val) : String(val),
        })),
        completion_time_seconds: completionTime,
      };

      await api.submitPublicFormResponse(slug, responsePayload);

      localStorage.removeItem(`formflow_draft_${slug}`);
      setSubmitted(true);
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : "Submission failed. Please try again.";
      setValidationError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const restoreDraft = () => {
    const savedKey = `formflow_draft_${slug}`;
    const localDraft = localStorage.getItem(savedKey);
    if (localDraft) {
      try {
        const parsed = JSON.parse(localDraft);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.currentIndex !== undefined) setCurrentIndex(parsed.currentIndex);
      } catch (e) {}
    }
    setShowDraftPrompt(false);
  };

  const discardDraft = () => {
    localStorage.removeItem(`formflow_draft_${slug}`);
    setAnswers({});
    setCurrentIndex(0);
    setShowDraftPrompt(false);
  };

  // Determine active theme class
  const activeThemeId = urlTheme || formData?.theme_id || "burgundy";
  const themeClass = `theme-${activeThemeId}`;

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${themeClass} bg-crayon-paper`}>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md animate-pulse mb-3"
          style={{ backgroundColor: "var(--theme-accent, #6E1F2A)", color: "var(--theme-btn-text, #FFFFFF)" }}
        >
          <Eye className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-xs font-extrabold" style={{ color: "var(--theme-text, #1C1917)" }}>
          Loading Form Preview...
        </p>
      </div>
    );
  }

  if (errorMsg || !formData) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${themeClass} bg-crayon-paper`}>
        <div
          className="crayon-card p-8 max-w-md w-full text-center space-y-4 border-2"
          style={{ backgroundColor: "var(--theme-surface)", borderColor: "var(--theme-border)", color: "var(--theme-text)" }}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#F9EFEF] text-[#6E1F2A] flex items-center justify-center mx-auto border border-[#F0C9CD]">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold">Form Unavailable</h2>
          <p className="text-xs font-medium leading-relaxed" style={{ color: "var(--theme-subtext)" }}>
            {errorMsg || "The requested form does not exist or has been archived."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="crayon-button w-full py-3 text-xs font-extrabold rounded-2xl"
            style={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-btn-text)" }}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const questions: Question[] = formData.questions || [];
  const totalQ = questions.length;
  const currentQ = questions[currentIndex];
  const progressPercent = totalQ > 0 ? Math.round(((currentIndex + 1) / totalQ) * 100) : 0;

  if (submitted) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${themeClass} bg-crayon-paper`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="crayon-card p-8 sm:p-12 max-w-md w-full text-center space-y-5 border-2"
          style={{ backgroundColor: "var(--theme-surface)", borderColor: "var(--theme-border)", color: "var(--theme-text)" }}
        >
          <div className="w-16 h-16 rounded-full bg-[#E6F4EA] text-[#059669] flex items-center justify-center mx-auto border-2 border-[#34D399] shadow-sm">
            <Check className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            {formData.thank_you_message || "Response Submitted!"}
          </h1>
          <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: "var(--theme-subtext)" }}>
            Thank you for completing <strong>"{formData.title}"</strong>. Your submission has been recorded.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setAnswers({});
              setCurrentIndex(0);
              startTimeRef.current = Date.now();
            }}
            className="crayon-button w-full py-3 text-xs font-extrabold rounded-2xl"
            style={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-btn-text)" }}
          >
            Submit Another Response
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col justify-between p-4 sm:p-8 ${themeClass} bg-crayon-paper`}
      style={{ backgroundColor: "var(--theme-bg)", color: "var(--theme-text)" }}
    >
      {/* Top Preview Header & Progress Bar */}
      <header className="w-full max-w-3xl mx-auto space-y-3">
        {/* Top Iframe Preview Mode Ribbon Banner */}
        <div
          className="flex items-center justify-between px-4 py-2 rounded-2xl border-2 shadow-xs text-xs font-bold"
          style={{ backgroundColor: "var(--theme-surface)", borderColor: "var(--theme-border)", color: "var(--theme-text)" }}
        >
          <div className="flex items-center gap-2" style={{ color: "var(--theme-accent)" }}>
            <Eye className="w-4 h-4 animate-pulse" />
            <span>LIVE PREVIEW MODE</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-mono text-[11px]" style={{ color: "var(--theme-subtext)" }}>Press ESC to Exit</span>
            <button
              onClick={() => window.parent.postMessage({ type: "CLOSE_PREVIEW" }, "*")}
              className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold border transition-colors"
              style={{ backgroundColor: "var(--theme-bg)", borderColor: "var(--theme-border)", color: "var(--theme-text)" }}
            >
              Exit Preview ✕
            </button>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-extrabold">
            <span className="truncate max-w-[200px]">{formData.title}</span>
            <span className="font-mono" style={{ color: "var(--theme-accent)" }}>{progressPercent}% Completed</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--theme-border)" }}>
            <motion.div
              className="h-full"
              style={{ backgroundColor: "var(--theme-accent)" }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </header>

      {/* Progress Recovery Banner */}
      {showDraftPrompt && (
        <div className="w-full max-w-2xl mx-auto my-4 border-2 border-[#FBBF24] p-4 rounded-2xl shadow-md flex items-center justify-between gap-4 text-xs" style={{ backgroundColor: "var(--theme-surface)" }}>
          <div className="space-y-0.5">
            <p className="font-extrabold text-[#D97706]">Resume Previous Session?</p>
            <p className="font-medium" style={{ color: "var(--theme-subtext)" }}>We found your unfinished draft answers for this form.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={restoreDraft}
              className="px-3 py-1.5 bg-[#D97706] text-white font-extrabold rounded-xl hover:bg-[#B45309]"
            >
              Resume Draft
            </button>
            <button
              onClick={discardDraft}
              className="px-3 py-1.5 font-bold rounded-xl"
              style={{ backgroundColor: "var(--theme-bg)", color: "var(--theme-text)" }}
            >
              Start Fresh
            </button>
          </div>
        </div>
      )}

      {/* Question Canvas Card */}
      <main className="flex-1 flex items-center justify-center py-8 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="crayon-card p-8 sm:p-10 border-2 w-full space-y-6 shadow-md"
            style={{ backgroundColor: "var(--theme-surface)", borderColor: "var(--theme-border)", color: "var(--theme-text)" }}
          >
            {/* Question title & header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold" style={{ color: "var(--theme-accent)" }}>
                <span>Question {String(currentIndex + 1).padStart(2, "0")} of {totalQ}</span>
                {currentQ.required && <span className="text-[#B54747] font-bold">* Required</span>}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                {currentQ.title}
              </h1>

              {currentQ.description && (
                <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: "var(--theme-subtext)" }}>
                  {currentQ.description}
                </p>
              )}
            </div>

            {/* Input renderer per type */}
            <div className="pt-2">
              {currentQ.type === "short_text" && (
                <input
                  ref={inputRef as any}
                  type="text"
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full text-base sm:text-lg py-3 px-4 rounded-2xl border-2 focus:outline-none font-semibold transition-colors"
                  style={{ backgroundColor: "var(--theme-bg)", borderColor: "var(--theme-border)", color: "var(--theme-text)" }}
                />
              )}

              {currentQ.type === "long_text" && (
                <textarea
                  ref={inputRef as any}
                  rows={4}
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                  placeholder="Type your detailed response..."
                  className="w-full text-sm p-4 rounded-2xl border-2 focus:outline-none font-semibold resize-y transition-colors"
                  style={{ backgroundColor: "var(--theme-bg)", borderColor: "var(--theme-border)", color: "var(--theme-text)" }}
                />
              )}

              {currentQ.type === "email" && (
                <input
                  ref={inputRef as any}
                  type="email"
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                  placeholder="name@company.com"
                  className="w-full text-base sm:text-lg py-3 px-4 rounded-2xl border-2 focus:outline-none font-semibold transition-colors"
                  style={{ backgroundColor: "var(--theme-bg)", borderColor: "var(--theme-border)", color: "var(--theme-text)" }}
                />
              )}

              {currentQ.type === "number" && (
                <input
                  ref={inputRef as any}
                  type="number"
                  value={answers[currentQ.id] ?? ""}
                  onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                  placeholder="Type a number..."
                  className="w-full text-base sm:text-lg py-3 px-4 rounded-2xl border-2 focus:outline-none font-semibold transition-colors"
                  style={{ backgroundColor: "var(--theme-bg)", borderColor: "var(--theme-border)", color: "var(--theme-text)" }}
                />
              )}

              {(currentQ.type === "multiple_choice" || currentQ.type === "dropdown") && (
                <div className="space-y-3">
                  {(currentQ.options || []).map((opt: QuestionOption, idx: number) => {
                    const isSelected = answers[currentQ.id] === opt.value;
                    return (
                      <button
                        key={opt.id || idx}
                        onClick={() => handleAnswer(currentQ.id, opt.value)}
                        className="w-full p-4 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm transition-all flex items-center justify-between"
                        style={
                          isSelected
                            ? { backgroundColor: "var(--theme-accent)", color: "var(--theme-btn-text)", borderColor: "var(--theme-accent)" }
                            : { backgroundColor: "var(--theme-surface)", color: "var(--theme-text)", borderColor: "var(--theme-border)" }
                        }
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center border"
                            style={{
                              backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : "var(--theme-bg)",
                              borderColor: isSelected ? "rgba(255,255,255,0.3)" : "var(--theme-border)",
                              color: isSelected ? "var(--theme-btn-text)" : "var(--theme-text)"
                            }}
                          >
                            {idx + 1}
                          </span>
                          <span>{opt.label}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQ.type === "yes_no" && (
                <div className="flex flex-col sm:flex-row gap-4">
                  {["Yes", "No"].map((choice) => {
                    const isSelected = answers[currentQ.id] === choice;
                    return (
                      <button
                        key={choice}
                        onClick={() => handleAnswer(currentQ.id, choice)}
                        className="flex-1 py-4 px-6 rounded-2xl border-2 font-extrabold text-sm transition-all flex items-center justify-center gap-2"
                        style={
                          isSelected
                            ? { backgroundColor: "var(--theme-accent)", color: "var(--theme-btn-text)", borderColor: "var(--theme-accent)" }
                            : { backgroundColor: "var(--theme-surface)", color: "var(--theme-text)", borderColor: "var(--theme-border)" }
                        }
                      >
                        <span className="font-mono text-xs opacity-70">Key [{choice === "Yes" ? "Y" : "N"}]</span>
                        <span>— {choice}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQ.type === "rating" && (
                <div className="flex items-center justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((score) => {
                    const isSelected = answers[currentQ.id] === score;
                    return (
                      <button
                        key={score}
                        onClick={() => handleAnswer(currentQ.id, score)}
                        className="w-12 sm:w-16 h-14 sm:h-16 rounded-2xl border-2 flex flex-col items-center justify-center transition-all"
                        style={
                          isSelected
                            ? { backgroundColor: "var(--theme-accent)", color: "var(--theme-btn-text)", borderColor: "var(--theme-accent)" }
                            : { backgroundColor: "var(--theme-surface)", color: "var(--theme-text)", borderColor: "var(--theme-border)" }
                        }
                      >
                        <Star className={`w-5 h-5 ${isSelected ? "text-yellow-300 fill-yellow-300" : ""}`} />
                        <span className="text-xs font-extrabold mt-1">{score}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Validation Error Banner */}
            {validationError && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-[#F9EFEF] border border-[#F0C9CD] text-[#B54747] text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </motion.div>
            )}

            {/* Navigation buttons */}
            <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--theme-border)" }}>
              <div className="flex items-center gap-2">
                {currentIndex > 0 && formData.allow_back_navigation && (
                  <button
                    onClick={handlePrev}
                    className="p-3 rounded-2xl border-2 transition-all"
                    style={{ backgroundColor: "var(--theme-surface)", borderColor: "var(--theme-border)", color: "var(--theme-text)" }}
                    title="Previous Question (Shift+Enter)"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Next / Submit Button */}
              <div className="relative group">
                <button
                  onClick={handleNext}
                  disabled={submitting}
                  className="crayon-button px-7 py-3 text-xs font-extrabold rounded-2xl flex items-center gap-2 shadow-sm"
                  style={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-btn-text)" }}
                >
                  {submitting ? (
                    <span>Submitting...</span>
                  ) : currentIndex === totalQ - 1 ? (
                    <span>Submit Response ✓</span>
                  ) : (
                    <>
                      <span>Next Question</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Shortcut Key Tooltip */}
                <div className="absolute right-0 -top-9 hidden group-hover:flex items-center gap-1 bg-[#1C1917] text-white text-[11px] font-mono px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap z-50">
                  <span>Shortcut: {currentQ.type === "long_text" ? "Ctrl + Enter ↵" : "Enter ↵"}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer copyright */}
      <footer className="w-full max-w-2xl mx-auto flex items-center justify-between text-xs font-semibold py-2" style={{ color: "var(--theme-subtext)" }}>
        <span>Powered by Ripple</span>
        <div className="hidden sm:flex items-center gap-3 font-mono text-[11px]">
          <span>Enter ↵ for next</span>
          <span>Shift+Enter for prev</span>
        </div>
      </footer>
    </div>
  );
}
