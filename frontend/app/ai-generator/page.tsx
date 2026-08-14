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
import {
  ArrowLeft, Sparkles, AlertTriangle, ArrowRight, Bot, Cpu, Zap, Check, Flame, RefreshCw, Wand2, ShieldCheck, Layers, Eye
} from "lucide-react";

export default function AIGeneratorPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { success, error: toastError } = useToast();

  // Opening AI Animation State
  const [openingDone, setOpeningDone] = useState(false);
  const [aiScanStep, setAiScanStep] = useState(0);

  // Form Generator State
  const [prompt, setPrompt] = useState("Create a SaaS customer satisfaction survey with 5 questions focusing on design, speed, and overall NPS score.");
  const [tone, setTone] = useState<"professional" | "friendly" | "concise">("professional");
  const [theme, setTheme] = useState<"burgundy" | "midnight" | "forest" | "ocean">("burgundy");

  // Generation Loading State & Synthesizer Steps
  const [loading, setLoading] = useState(false);
  const [synthStep, setSynthStep] = useState(0);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  // Opening animation timeline trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpeningDone(true);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  // Presets
  const promptPresets = [
    {
      label: "🚀 SaaS Customer Survey",
      prompt: "Create a 5-question SaaS customer feedback survey asking about UI usability, feature requests, likelihood to recommend (NPS), and main blockers."
    },
    {
      label: "💼 Employee Pulse Check",
      prompt: "Create an anonymous employee pulse check survey with 4 questions regarding work-life balance, manager support, team tooling, and feedback."
    },
    {
      label: "🎉 Event RSVP & Dietary",
      prompt: "Create a developer conference RSVP registration form asking for attendee name, dietary preferences, workshop choices, and t-shirt size."
    },
    {
      label: "🎓 Student Course Evaluation",
      prompt: "Create a 5-question course feedback evaluation assessing instructor clarity, course materials usefulness, workload rating, and open comments."
    },
    {
      label: "🛒 E-Commerce Feedback",
      prompt: "Create a post-purchase feedback form for an e-commerce store assessing shipping speed, product quality satisfaction, and return preferences."
    }
  ];

  // Synthesizer simulation text
  const synthStepsText = [
    "🧠 Analyzing prompt intent & domain entity mapping...",
    "⚡ Synthesizing question types & conversational choices...",
    "🛡️ Validating pre-publish diagnostic auditor rules...",
    "✨ Instantiating form schema & loading 3-panel builder..."
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
    setSynthStep(0);

    // Simulate multi-stage AI neural synthesis progress steps
    const stepInterval = setInterval(() => {
      setSynthStep((prev) => {
        if (prev >= 3) {
          clearInterval(stepInterval);
          return 3;
        }
        return prev + 1;
      });
    }, 600);

    try {
      const fullPrompt = `${prompt} Tone: ${tone}. Theme: ${theme}.`;
      const res = await api.generateAIForm(fullPrompt);

      if (res.message) {
        setResultMsg(res.message);
      }

      if (res.form) {
        const newForm = await api.createForm({
          title: res.form.title,
          description: res.form.description,
          questions: res.form.questions,
        });

        setTimeout(() => {
          success(`✓ Form "${res.form.title}" generated!`);
          router.push(`/builder/${newForm.id}`);
        }, 1200);
      }
    } catch (err) {
      toastError("AI Generation failed. You can create the form manually.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-crayon-paper text-[#1C1917] overflow-x-hidden">
      <Navbar />

      {/* 1. FUTURISTIC AI OPENING ANIMATION OVERLAY */}
      <AnimatePresence>
        {!openingDone && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9999] bg-[#1C1917] flex flex-col items-center justify-center text-white px-4 text-center"
          >
            {/* Expanding Neural AI Orb */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#6E1F2A] via-[#38BDF8] to-[#34D399] p-1 shadow-[0_0_50px_rgba(110,31,42,0.6)] flex items-center justify-center mb-6"
            >
              <div className="w-full h-full bg-[#1C1917] rounded-full flex items-center justify-center">
                <Bot className="w-10 h-10 text-[#38BDF8] animate-bounce" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-extrabold tracking-tight"
            >
              NEURAL AI FORM SYNTHESIZER 2.0
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.5 }}
              className="text-xs font-mono text-[#38BDF8] mt-2 uppercase tracking-widest"
            >
              INITIALIZING CREATIVE SCHEMA MATRIX...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        {/* Top Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xs font-bold text-[#6E1F2A] hover:underline flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Workspace
          </Link>
          <span className="text-xs font-mono font-bold text-[#78716C] flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-[#6E1F2A]" /> AI Model: Ripple-Schema-v2
          </span>
        </div>

        {/* 2. CREATIVE AI HERO HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="crayon-card bg-white p-6 sm:p-8 relative overflow-hidden space-y-4"
        >
          {/* Subtle Neural Halo Gradient Background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#F9EFEF] via-[#FEF3C7]/40 to-transparent rounded-full blur-2xl opacity-70 pointer-events-none" />

          <div className="flex items-center gap-3 relative">
            <div className="w-12 h-12 rounded-2xl bg-[#6E1F2A] text-white flex items-center justify-center font-bold shadow-md border border-[#541720]">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#F9EFEF] border border-[#F0C9CD] text-[11px] font-extrabold text-[#6E1F2A] mb-1">
                <Wand2 className="w-3 h-3" />
                <span>AI Prompt Architect</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight">
                AI Form Generator Studio
              </h1>
            </div>
          </div>

          <p className="text-sm text-[#78716C] font-medium leading-relaxed max-w-2xl relative">
            Describe your target form in natural language. Our AI will automatically structure questions, conversational choices, required rules, and pre-publish health checks.
          </p>

          {/* Quick Prompt Presets Chips */}
          <div className="pt-2 space-y-2 relative">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#1C1917] block">
              💡 One-Click Prompt Inspirations:
            </span>
            <div className="flex flex-wrap gap-2">
              {promptPresets.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(item.prompt)}
                  className="px-3 py-1.5 rounded-xl bg-[#F6F3ED] hover:bg-[#F9EFEF] border border-[#E6DFD5] hover:border-[#F0C9CD] text-xs font-bold text-[#1C1917] hover:text-[#6E1F2A] transition-all text-left"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 3. GENERATION FORM & STYLING CONTROLS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="crayon-card crayon-card-brand p-6 sm:p-8 space-y-6"
        >
          {resultMsg && (
            <div className="p-4 bg-[#FEF3C7] border-2 border-[#FBBF24] rounded-2xl text-xs text-[#D97706] font-bold flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{resultMsg}</span>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#1C1917] block">
                Prompt Instructions:
              </label>
              <Textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Create a 5-question event registration form for a developer summit with meal preferences and ticket categories."
                required
                className="bg-white border-2 border-[#E6DFD5] text-sm font-medium focus:border-[#6E1F2A] rounded-2xl"
              />
            </div>

            {/* Tone & Theme Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tone Selection */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#1C1917] block">
                  Question Tone:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["professional", "friendly", "concise"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`py-2 rounded-xl text-xs font-extrabold capitalize border transition-all ${
                        tone === t
                          ? "bg-[#6E1F2A] text-white border-[#6E1F2A] shadow-xs"
                          : "bg-white text-[#78716C] border-[#E6DFD5] hover:bg-[#F6F3ED]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Selection */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#1C1917] block">
                  Form Theme:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["burgundy", "midnight", "forest", "ocean"] as const).map((th) => (
                    <button
                      key={th}
                      type="button"
                      onClick={() => setTheme(th)}
                      className={`py-2 rounded-xl text-xs font-extrabold capitalize border transition-all ${
                        theme === th
                          ? "bg-[#6E1F2A] text-white border-[#6E1F2A] shadow-xs"
                          : "bg-white text-[#78716C] border-[#E6DFD5] hover:bg-[#F6F3ED]"
                      }`}
                    >
                      {th}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Submit Button */}
            <Button
              type="submit"
              size="lg"
              isLoading={loading}
              className="crayon-button w-full bg-[#6E1F2A] hover:bg-[#541720] text-white font-extrabold text-sm py-4 rounded-2xl shadow-md"
              rightIcon={<Sparkles className="w-4 h-4" />}
            >
              {loading ? "Synthesizing AI Form Schema..." : "Generate Form Schema with AI ✨"}
            </Button>
          </form>
        </motion.div>

        {/* 4. LIVE AI SYNTHESIZER DISPLAY STAGE (WHEN LOADING) */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1C1917] text-white rounded-3xl p-8 border-4 border-[#1C1917] shadow-2xl space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-red-400 animate-ping" />
                  <span className="text-xs font-mono font-extrabold text-[#38BDF8] uppercase tracking-wider">
                    AI NEURAL SYNTHESIZER RUNNING
                  </span>
                </div>
                <span className="text-xs font-mono text-white/50">Stage {synthStep + 1} of 4</span>
              </div>

              {/* Progress Scrubber Bar */}
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#6E1F2A] via-[#38BDF8] to-[#34D399]"
                  initial={{ width: "10%" }}
                  animate={{ width: `${(synthStep + 1) * 25}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              {/* Active Step Text */}
              <div className="space-y-3 font-mono text-xs">
                {synthStepsText.map((text, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl flex items-center justify-between border transition-all ${
                      idx === synthStep
                        ? "bg-white/10 border-[#38BDF8] text-white font-bold"
                        : idx < synthStep
                        ? "bg-white/5 border-white/5 text-[#34D399]"
                        : "opacity-30 border-transparent"
                    }`}
                  >
                    <span>{text}</span>
                    {idx < synthStep ? (
                      <Check className="w-4 h-4 text-[#34D399]" />
                    ) : idx === synthStep ? (
                      <RefreshCw className="w-4 h-4 text-[#38BDF8] animate-spin" />
                    ) : null}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5. SAMPLE AI SCHEMA PREVIEW SANDBOX */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="crayon-card bg-white p-6 sm:p-8 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#6E1F2A] flex items-center gap-2">
                <Eye className="w-4 h-4" /> Real-time Schema Preview Simulation
              </span>
              <span className="text-xs font-mono text-[#78716C] font-bold">5 Questions Output</span>
            </div>

            <div className="p-4 bg-[#F6F3ED] rounded-2xl border-2 border-[#E6DFD5] space-y-3">
              <div className="p-3 bg-white rounded-xl border border-[#E6DFD5] space-y-1">
                <span className="text-[10px] font-bold text-[#6E1F2A] uppercase">Q1 • Rating Question</span>
                <p className="font-semibold text-xs text-[#1C1917]">
                  "Overall, how satisfied are you with our product performance?"
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E6DFD5] space-y-1">
                <span className="text-[10px] font-bold text-[#6E1F2A] uppercase">Q2 • Multiple Choice</span>
                <p className="font-semibold text-xs text-[#1C1917]">
                  "Which features do you rely on most frequently during daily work?"
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
