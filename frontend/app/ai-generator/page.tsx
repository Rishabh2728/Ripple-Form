"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { useAuthStore } from "../../stores/auth-store";
import { api } from "../../lib/api-client";
import { useToast } from "../../components/ui/toast";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";

export default function AIGeneratorPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { success, error: toastError } = useToast();

  // Opening Theme-Aligned Animation State
  const [openingDone, setOpeningDone] = useState(false);

  // Form Generator State
  const [prompt, setPrompt] = useState("Create a customer satisfaction survey with 5 questions focusing on product quality, shipping speed, and overall feedback.");
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  // Theme-aligned opening transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpeningDone(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Clean Emoji-Free Prompt Presets
  const promptPresets = [
    {
      label: "SaaS Customer Survey",
      prompt: "Create a 5-question SaaS customer feedback survey asking about UI usability, feature requests, likelihood to recommend, and main blockers."
    },
    {
      label: "Employee Pulse Check",
      prompt: "Create an anonymous employee pulse check survey with 4 questions regarding work-life balance, team support, and overall satisfaction."
    },
    {
      label: "Event Registration & RSVP",
      prompt: "Create an event registration form asking for attendee name, dietary preferences, workshop choices, and contact email."
    },
    {
      label: "Course Evaluation",
      prompt: "Create a 5-question course feedback evaluation assessing instructor clarity, course materials usefulness, and open comments."
    }
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setResultMsg(null);

    try {
      const res = await api.generateAIForm(prompt);

      if (res.message) {
        setResultMsg(res.message);
      }

      if (res.form) {
        const newForm = await api.createForm({
          title: res.form.title,
          description: res.form.description,
          questions: res.form.questions,
        });

        success(`Form "${res.form.title}" generated!`);
        router.push(`/builder/${newForm.id}`);
      }
    } catch (err) {
      toastError("AI Generation failed. You can create the form manually.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-crayon-paper text-[#1C1917]">
      <Navbar />

      {/* 1. BRAND-ALIGNED WARM OPENING SCENE */}
      <AnimatePresence>
        {!openingDone && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[9999] bg-[#FCFBF7] flex flex-col items-center justify-center text-[#1C1917] px-4 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-2xl bg-[#6E1F2A] text-white flex items-center justify-center mb-4 shadow-md border-2 border-[#541720]"
            >
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </motion.div>
            <h2 className="text-xl font-extrabold text-[#1C1917] tracking-tight">
              Ripple AI Form Generator
            </h2>
            <p className="text-xs font-semibold text-[#78716C] mt-1">
              Initializing AI form studio...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MINIMALIST PAGE CONTENT */}
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-10 w-full space-y-6">
        <Link
          href="/dashboard"
          className="text-xs font-bold text-[#6E1F2A] hover:underline flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Workspace
        </Link>

        {/* Clean Header */}
        <div className="space-y-1 text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight">
            AI Form Generator
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] font-medium">
            Describe the form you want to build and AI will generate the questions and structure.
          </p>
        </div>

        {/* Clean Generator Card */}
        <div className="crayon-card bg-white p-6 sm:p-8 space-y-6">
          {resultMsg && (
            <div className="p-3.5 bg-[#FEF3C7] border border-[#FBBF24] rounded-xl text-xs text-[#D97706] font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{resultMsg}</span>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-[#1C1917] block">
                Prompt Instructions
              </label>
              <Textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your form (e.g. Create a 5-question customer feedback survey)..."
                required
                className="bg-white border-2 border-[#E6DFD5] text-xs font-medium focus:border-[#6E1F2A] rounded-2xl"
              />
            </div>

            {/* Clean Prompt Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider block">
                Sample Prompts:
              </span>
              <div className="flex flex-wrap gap-2">
                {promptPresets.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(item.prompt)}
                    className="px-3 py-1.5 rounded-xl bg-[#F6F3ED] hover:bg-[#F9EFEF] border border-[#E6DFD5] text-xs font-bold text-[#1C1917] hover:text-[#6E1F2A] transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Submit Button */}
            <Button
              type="submit"
              size="lg"
              isLoading={loading}
              className="crayon-button w-full bg-[#6E1F2A] hover:bg-[#541720] text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-sm"
              rightIcon={<Sparkles className="w-4 h-4" />}
            >
              {loading ? "Generating Form Schema..." : "Generate Form with AI"}
            </Button>
          </form>
        </div>

        {/* Minimalist Theme-Aligned Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="crayon-card bg-white p-6 text-center space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F9EFEF] text-[#6E1F2A] flex items-center justify-center mx-auto border border-[#F0C9CD]">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <p className="text-xs font-extrabold text-[#1C1917]">
              Structuring your form questions...
            </p>
            <p className="text-[11px] text-[#78716C] font-medium">
              You will be redirected to the editor as soon as generation completes.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
