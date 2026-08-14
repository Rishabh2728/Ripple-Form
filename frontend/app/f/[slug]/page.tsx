"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { api, ApiError } from "../../../lib/api-client";
import { Question, QuestionOption } from "../../../types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, ArrowRight, ArrowLeft, AlertCircle, Star
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
  }, [currentIndex, formData, answers, showDraftPrompt, submitting, submitted]);

  // Local draft saving
  const saveDraftLocally = (newAnswers: Record<string, any>, index: number) => {
    localStorage.setItem(
      `formflow_draft_${slug}`,
      JSON.stringify({ answers: newAnswers, currentIndex: index })
    );
  };

  const handleAnswer = (questionId: string, val: any) => {
    const nextAnswers = { ...answers, [questionId]: val };
    setAnswers(nextAnswers);
    setValidationError(null);
    saveDraftLocally(nextAnswers, currentIndex);
  };

  // Client-side Question Validation
  const validateCurrent = (): boolean => {
    if (!formData || !formData.questions[currentIndex]) return true;

    const q = formData.questions[currentIndex];
    const val = answers[q.id];
    const settings = q.settings_json || {};

    if (q.required) {
      if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
        setValidationError("This question is required.");
        return false;
      }
    }

    if (val !== undefined && val !== null && val !== "") {
      if (q.type === "email") {
        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailRegex.test(String(val).trim())) {
          setValidationError("Please enter a valid email address.");
          return false;
        }
      }

      if (q.type === "short_text" || q.type === "long_text") {
        const strVal = String(val);
        if (settings.min_length && strVal.length < settings.min_length) {
          setValidationError(`Please enter at least ${settings.min_length} characters.`);
          return false;
        }
        if (settings.max_length && strVal.length > settings.max_length) {
          setValidationError(`Please enter no more than ${settings.max_length} characters.`);
          return false;
        }
      }

      if (q.type === "number") {
        const num = Number(val);
        if (isNaN(num)) {
          setValidationError("Please enter a valid number.");
          return false;
        }
        if (settings.min !== undefined && num < settings.min) {
          setValidationError(`Please enter a value greater than or equal to ${settings.min}.`);
          return false;
        }
        if (settings.max !== undefined && num > settings.max) {
          setValidationError(`Please enter a value less than or equal to ${settings.max}.`);
          return false;
        }
      }
    }

    setValidationError(null);
    return true;
  };

  const handleNext = () => {
    if (!validateCurrent()) return;

    if (currentIndex < formData.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmitResponse();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setValidationError(null);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitResponse = async () => {
    if (!validateCurrent()) return;

    setSubmitting(true);
    setErrorMsg(null);

    const answersList = Object.entries(answers).map(([question_id, value]) => ({
      question_id,
      value,
    }));

    const completionTime = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    let token = localStorage.getItem("formflow_respondent_token");
    if (!token) {
      token = "resp_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("formflow_respondent_token", token);
    }

    try {
      await api.submitPublicResponse(slug, {
        respondent_token: token,
        answers: answersList,
        completion_time_seconds: completionTime,
      });

      localStorage.removeItem(`formflow_draft_${slug}`);
      setSubmitted(true);
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : "Submission failed. Please check your answers.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF8]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#6E1F2A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#6F6A67]">Loading form...</p>
        </div>
      </div>
    );
  }

  if (errorMsg && !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF8] p-4">
        <div className="w-full max-w-md bg-white border border-[#E7E2DE] rounded-2xl p-8 text-center shadow-card">
          <AlertCircle className="w-10 h-10 text-[#B54747] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#191716]">Form Unavailable</h2>
          <p className="text-xs text-[#6F6A67] mt-1">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF8] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-white border border-[#E7E2DE] rounded-2xl p-8 text-center shadow-card"
        >
          <div className="w-16 h-16 rounded-full bg-[#E6F4ED] text-[#2F7D5B] flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#191716] tracking-tight">
            {formData.thank_you_title || "Thank You!"}
          </h2>
          <p className="text-sm text-[#6F6A67] mt-2 leading-relaxed">
            {formData.thank_you_message || "Your response has been successfully submitted."}
          </p>
        </motion.div>
      </div>
    );
  }

  const currentQ = formData.questions[currentIndex];
  const activeThemeId = urlTheme || formData.theme_id || "burgundy";
  const themeClass = `theme-${activeThemeId}`;
  const totalQ = formData.questions.length;
  const progressPct = ((currentIndex + 1) / totalQ) * 100;

  return (
    <div className={`min-h-screen flex flex-col justify-between p-4 sm:p-8 transition-colors ${themeClass}`}>
      {/* Progress Bar Header */}
      <header className="w-full max-w-2xl mx-auto flex items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs">Ripple</span>
          <span className="text-xs opacity-60">• {formData.title}</span>
        </div>

        {formData.show_progress && (
          <div className="flex items-center gap-3">
            <div className="w-24 sm:w-36 h-1.5 bg-black/10 rounded-full overflow-hidden">
              <div className="h-full bg-current transition-all duration-300" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-xs font-mono opacity-70">
              {currentIndex + 1} / {totalQ}
            </span>
          </div>
        )}
      </header>

      {/* Progress Recovery Drawer */}
      {showDraftPrompt && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#191716] text-white px-5 py-3 rounded-2xl shadow-modal flex items-center gap-4 text-xs">
          <span>Welcome back! We saved your previous progress.</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const savedKey = `formflow_draft_${slug}`;
                const localDraft = localStorage.getItem(savedKey);
                if (localDraft) {
                  const parsed = JSON.parse(localDraft);
                  setAnswers(parsed.answers || {});
                  setCurrentIndex(parsed.currentIndex || 0);
                }
                setShowDraftPrompt(false);
              }}
              className="px-3 py-1 bg-[#6E1F2A] hover:bg-[#581821] text-white font-semibold rounded-lg"
            >
              Continue
            </button>
            <button
              onClick={() => {
                localStorage.removeItem(`formflow_draft_${slug}`);
                setAnswers({});
                setCurrentIndex(0);
                setShowDraftPrompt(false);
              }}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg"
            >
              Start Fresh
            </button>
          </div>
        </div>
      )}

      {/* Question Canvas Container */}
      <main className="flex-1 flex items-center justify-center py-12 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="w-full space-y-6"
          >
            {/* Question title */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold opacity-70">
                <span>{String(currentIndex + 1).padStart(2, "0")} →</span>
                {currentQ.required && <span className="text-[#B54747] font-semibold">* Required</span>}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                {currentQ.title}
              </h1>

              {currentQ.description && (
                <p className="text-sm sm:text-base opacity-75 font-normal leading-relaxed">
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
                  placeholder="Type your answer..."
                  className="w-full text-lg sm:text-xl py-3 border-b-2 border-current bg-transparent focus:outline-none placeholder:opacity-40"
                />
              )}

              {currentQ.type === "long_text" && (
                <textarea
                  ref={inputRef as any}
                  rows={4}
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                  placeholder="Type your detailed answer here..."
                  className="w-full text-base p-4 border border-current/30 rounded-xl bg-transparent focus:outline-none placeholder:opacity-40 resize-y"
                />
              )}

              {currentQ.type === "email" && (
                <input
                  ref={inputRef as any}
                  type="email"
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-lg sm:text-xl py-3 border-b-2 border-current bg-transparent focus:outline-none placeholder:opacity-40"
                />
              )}

              {currentQ.type === "number" && (
                <input
                  ref={inputRef as any}
                  type="number"
                  value={answers[currentQ.id] ?? ""}
                  onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                  placeholder="Type a number..."
                  className="w-full text-lg sm:text-xl py-3 border-b-2 border-current bg-transparent focus:outline-none placeholder:opacity-40"
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
                        className={`w-full p-4 rounded-xl border text-left font-semibold text-sm transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-current text-white border-current shadow-md"
                            : "border-current/30 hover:border-current bg-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-black/10 font-mono text-xs flex items-center justify-center">
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
                        className={`flex-1 py-4 px-6 rounded-xl border font-bold text-base transition-all flex items-center justify-center gap-2 ${
                          isSelected
                            ? "bg-current text-white border-current shadow-md"
                            : "border-current/30 hover:border-current bg-transparent"
                        }`}
                      >
                        <span>{choice === "Yes" ? "Y" : "N"}</span> — <span>{choice}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQ.type === "rating" && (
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((score) => {
                    const isSelected = answers[currentQ.id] === score;
                    return (
                      <button
                        key={score}
                        onClick={() => handleAnswer(currentQ.id, score)}
                        className={`w-12 sm:w-16 h-12 sm:h-16 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? "bg-current text-white border-current shadow-md scale-105"
                            : "border-current/30 hover:border-current bg-transparent"
                        }`}
                      >
                        <Star className={`w-5 h-5 ${isSelected ? "text-yellow-300 fill-yellow-300" : ""}`} />
                        <span className="text-xs font-bold mt-1">{score}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQ.type === "nps" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                    {Array.from({ length: 11 }, (_, i) => i).map((score) => {
                      const isSelected = answers[currentQ.id] === score;
                      return (
                        <button
                          key={score}
                          onClick={() => handleAnswer(currentQ.id, score)}
                          className={`w-9 sm:w-11 h-12 rounded-xl border text-sm font-bold flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? "bg-current text-white border-current shadow-md scale-105"
                              : "border-current/30 hover:border-current bg-transparent"
                          }`}
                        >
                          {score}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs opacity-60 font-medium">
                    <span>0 = Not likely at all</span>
                    <span>10 = Extremely likely</span>
                  </div>
                </div>
              )}
            </div>

            {/* Validation Error Banner */}
            {validationError && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-[#B54747] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </motion.div>
            )}

            {/* Navigation buttons */}
            <div className="pt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentIndex > 0 && formData.allow_back_navigation && (
                  <button
                    onClick={handlePrev}
                    className="p-3 rounded-xl border border-current/30 hover:bg-current/10 transition-colors"
                    title="Previous Question (Shift+Enter)"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Next / Submit Button with Tooltip on Hover */}
              <div className="relative group">
                <button
                  onClick={handleNext}
                  disabled={submitting}
                  className="px-6 py-3 text-sm font-bold rounded-xl flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 transition-all opacity-95 hover:opacity-100"
                  style={{ backgroundColor: "var(--accent)", color: "var(--theme-btn-text, #ffffff)" }}
                >
                  {submitting ? (
                    <span>Submitting...</span>
                  ) : currentIndex === totalQ - 1 ? (
                    <span>Submit Response ✓</span>
                  ) : (
                    <>
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Shortcut Key Tooltip on Hover */}
                <div className="absolute right-0 -top-9 hidden group-hover:flex items-center gap-1 bg-[#191716] text-white text-[11px] font-mono px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap z-50">
                  <span>Shortcut: {currentQ.type === "long_text" ? "Ctrl + Enter ↵" : "Enter ↵"}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer copyright */}
      <footer className="w-full max-w-2xl mx-auto flex items-center justify-between text-[11px] opacity-60 py-2 border-t border-current/10">
        <span>Powered by Ripple</span>
        <div className="hidden sm:flex items-center gap-3 font-mono">
          <span>Enter ↵ for next</span>
          <span>Shift+Enter for prev</span>
        </div>
      </footer>
    </div>
  );
}
