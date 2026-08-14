"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/auth-store";
import { Navbar } from "../components/Navbar";
import { RippleLogo } from "../components/RippleLogo";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Sparkles, Shield, Zap, Command, Star,
  Play, Pause, RefreshCw, BarChart3, Palette, ArrowUpRight, Lock, Check
} from "lucide-react";
import { Button } from "../components/ui/button";

export default function LandingPage() {
  const router = useRouter();
  const { user, fetchUser } = useAuthStore();

  // Video-like Showcase Player State
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoStep, setVideoStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // Bottom Interactive Feature Card State
  const [activeCardPreview, setActiveCardPreview] = useState<number | null>(null);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Video showcase auto-advancing timer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setVideoStep((step) => (step + 1) % 4);
          return 0;
        }
        return prev + 2.5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const videoSteps = [
    {
      id: 0,
      title: "01. AI Schema Generation",
      tagline: "Prompt to Complete Form Schema in Seconds",
      badge: "AI AUTOMATION",
      content: {
        prompt: "Create a customer feedback survey for our SaaS product launch.",
        outputQuestions: [
          "How satisfied are you with our interface design? (Rating)",
          "Which subscription plan are you on? (Multiple Choice)",
          "What is the single biggest improvement you'd like to see? (Long Text)"
        ]
      }
    },
    {
      id: 1,
      title: "02. 3-Panel Fast Builder",
      tagline: "Drag & Drop, Health Auditor & Autosave",
      badge: "CREATOR STUDIO",
      content: {
        healthScore: "100% Health Pass",
        auditItems: [
          { check: "All questions have descriptive titles", pass: true },
          { check: "Multiple choice option list complete", pass: true },
          { check: "Required validations configured", pass: true }
        ]
      }
    },
    {
      id: 2,
      title: "03. Conversational Flow",
      tagline: "One Question at a Time with Hotkeys",
      badge: "RESPONDENT UX",
      content: {
        activeQ: "Which plan fits your team size best?",
        hotkeyTip: "Press 1 for Starter, 2 for Pro Team, 3 for Enterprise",
        choices: ["1. Starter (1-5 members)", "2. Pro Team (6-25 members)", "3. Enterprise Unlimited"]
      }
    },
    {
      id: 3,
      title: "04. Real-time Funnel Analytics",
      tagline: "Completion Funnels & Instant CSV Export",
      badge: "ANALYTICS ENGINE",
      content: {
        views: "1,420 Views",
        submissions: "1,180 Responses",
        completionRate: "83.1% Conversion",
        avgTime: "1m 12s Avg Duration"
      }
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-crayon-paper text-[#1C1917] overflow-x-hidden">
      <Navbar />

      {/* 1. COMPACT & BALANCED HERO SECTION */}
      <section className="relative pt-8 pb-10 md:pt-12 md:pb-16 px-4 sm:px-6 max-w-6xl mx-auto w-full flex flex-col items-center text-center">
        {/* Soft pastel halo glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-gradient-to-tr from-[#F9EFEF] via-[#FEF3C7] to-[#E0F2FE] rounded-full blur-3xl opacity-50 pointer-events-none -z-10" />

        {/* Compact Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1C1917] tracking-tight leading-[1.12] max-w-4xl"
        >
          Conversational Forms that Feel Like <br />
          <span className="text-[#6E1F2A] relative inline-block">
            Natural Human Dialog.
            <svg className="absolute -bottom-1.5 left-0 w-full h-2.5 text-[#F0C9CD]" viewBox="0 0 200 8" preserveAspectRatio="none">
              <path d="M0,5 Q50,0 100,5 T200,5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
        </motion.h1>

        {/* Compact Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-5 text-base sm:text-lg text-[#78716C] max-w-2xl font-medium leading-relaxed"
        >
          Capture up to 3.4x more responses with one-question-at-a-time focus, keyboard hotkeys, instant AI prompts, and real-time funnel analytics.
        </motion.p>

        {/* Hero Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-4"
        >
          <Link href={user ? "/dashboard" : "/register"}>
            <Button size="lg" className="crayon-button bg-[#6E1F2A] hover:bg-[#541720] text-white text-sm font-extrabold px-7 py-3.5 rounded-2xl shadow-md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              {user ? "Open Dashboard" : "Start Building Free"}
            </Button>
          </Link>
          <Link href="/f/saas-customer-feedback">
            <Button variant="outline" size="lg" className="crayon-button bg-white text-[#1C1917] hover:bg-[#F6F3ED] text-sm font-bold px-6 py-3.5 rounded-2xl" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
              Explore Live Demo Form
            </Button>
          </Link>
        </motion.div>

        {/* ANIMATED HIGH-NOTICED INSTANT DEMO CREATOR CREDENTIALS CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 p-5 bg-white border-2 border-[#6E1F2A] rounded-3xl text-sm text-[#1C1917] max-w-md w-full text-left animate-demo-card"
        >
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-extrabold text-[#6E1F2A] flex items-center gap-2 text-xs uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6E1F2A] animate-ping" />
              <Lock className="w-4 h-4" /> Instant Demo Creator Credentials
            </span>
            <Link href="/login" className="text-xs font-extrabold text-[#6E1F2A] hover:underline bg-[#F9EFEF] px-2.5 py-1 rounded-lg border border-[#F0C9CD]">
              Sign In →
            </Link>
          </div>
          <div className="flex justify-between items-center bg-[#F6F3ED] p-3 rounded-2xl font-mono text-xs font-semibold border border-[#E6DFD5]">
            <span>Email: <strong className="text-[#6E1F2A]">demo@ripple.com</strong></span>
            <span>Password: <strong className="text-[#6E1F2A]">password123</strong></span>
          </div>
          <p className="text-xs text-[#78716C] mt-2.5 font-medium">
            ⚡ Pre-loaded with 5 forms, version snapshots, and 25+ realistic submission entries.
          </p>
        </motion.div>
      </section>

      {/* 2. VIDEO-LIKE INTERACTIVE SHOWCASE COMPONENT */}
      <section className="py-12 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9EFEF] border border-[#F0C9CD] text-xs font-extrabold text-[#6E1F2A]">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>INTERACTIVE VIDEO DEMO SHOWCASE</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1C1917]">
            Watch Ripple in Action
          </h2>
          <p className="text-sm text-[#78716C] max-w-lg mx-auto font-medium">
            Experience the complete flow from AI schema generation to conversational responses and real-time analytics.
          </p>
        </div>

        {/* Video Player Frame */}
        <div className="bg-[#1C1917] rounded-3xl border-4 border-[#1C1917] shadow-2xl overflow-hidden text-white text-left">
          {/* Video Header Controls */}
          <div className="bg-[#292524] px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-xs font-extrabold bg-[#6E1F2A] px-3 py-1 rounded-full text-white tracking-wide">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                LIVE DEMO
              </span>
              <span className="text-xs font-mono text-white/80">
                {videoSteps[videoStep].title} — {videoSteps[videoStep].tagline}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                title={isPlaying ? "Pause Demo" : "Play Demo"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
              <button
                onClick={() => { setVideoStep(0); setProgress(0); }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                title="Restart Showcase"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Video Progress Scrubber Bar */}
          <div className="w-full bg-white/10 h-1.5">
            <motion.div
              className="h-full bg-[#6E1F2A]"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>

          {/* Video Player Display Screen */}
          <div className="p-6 sm:p-10 min-h-[340px] flex flex-col justify-between bg-gradient-to-br from-[#1C1917] via-[#292524] to-[#1C1917]">
            <AnimatePresence mode="wait">
              <motion.div
                key={videoStep}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {/* Step Badge */}
                <span className="inline-block px-3 py-1 rounded-lg bg-white/10 text-xs font-mono font-bold text-[#F0C9CD]">
                  {videoSteps[videoStep].badge}
                </span>

                {/* Step 0: AI Generator Content */}
                {videoStep === 0 && (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 font-mono text-xs sm:text-sm">
                      <span className="text-[#F0C9CD] font-bold">Prompt: </span>
                      <span>"{videoSteps[0].content.prompt}"</span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/50">Generated Schema Questions:</span>
                      {(videoSteps[0].content as any).outputQuestions?.map((q: string, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.15 }}
                          className="p-3 rounded-xl bg-white/10 text-xs font-semibold flex items-center gap-3 border border-white/5"
                        >
                          <Check className="w-4 h-4 text-[#34D399]" />
                          <span>{q}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 1: 3-Panel Builder Content */}
                {videoStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#34D399]/10 border border-[#34D399]/30">
                      <span className="text-xs sm:text-sm font-bold text-[#34D399]">Health Auditor Diagnosis:</span>
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#34D399] text-[#1C1917]">
                        {(videoSteps[1].content as any).healthScore}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {(videoSteps[1].content as any).auditItems?.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-white/5 text-xs font-semibold flex items-center justify-between border border-white/5">
                          <span>{item.check}</span>
                          <span className="text-[#34D399] font-bold text-[11px] uppercase">PASSED</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Conversational Flow Content */}
                {videoStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg sm:text-xl font-extrabold text-white">
                      {(videoSteps[2].content as any).activeQ}
                    </h3>
                    <p className="text-xs font-mono text-[#F0C9CD]">
                      ⚡ {(videoSteps[2].content as any).hotkeyTip}
                    </p>
                    <div className="space-y-2">
                      {(videoSteps[2].content as any).choices?.map((choice: string, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-white/10 hover:bg-[#6E1F2A] text-xs font-bold transition-all cursor-pointer border border-white/10 flex items-center justify-between">
                          <span>{choice}</span>
                          <span className="text-xs font-mono opacity-60">Key [{idx + 1}]</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Analytics Content */}
                {videoStep === 3 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                      <span className="text-xs text-white/60 font-semibold block uppercase">Total Views</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-white mt-1 block">{videoSteps[3].content.views}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                      <span className="text-xs text-white/60 font-semibold block uppercase">Submissions</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-[#F0C9CD] mt-1 block">{videoSteps[3].content.submissions}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                      <span className="text-xs text-white/60 font-semibold block uppercase">Completion</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-[#34D399] mt-1 block">{videoSteps[3].content.completionRate}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                      <span className="text-xs text-white/60 font-semibold block uppercase">Avg Time</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-[#38BDF8] mt-1 block">{videoSteps[3].content.avgTime}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Video Step Switcher Tabs */}
            <div className="pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {videoSteps.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => { setVideoStep(idx); setProgress(0); setIsPlaying(false); }}
                  className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                    videoStep === idx
                      ? "bg-[#6E1F2A] text-white shadow-md"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="block text-[10px] font-mono opacity-70">STEP 0{idx + 1}</span>
                  <span className="truncate block mt-0.5">{step.title.split(". ")[1]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. REFINED & INTERACTIVE FEATURE SHOWCASE CARDS (BRAND COLOR PALETTE) */}
      <section className="py-20 bg-white border-t border-b border-[#E6DFD5] px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight">
              Designed for Higher Conversions
            </h2>
            <p className="text-base text-[#78716C] font-medium leading-relaxed">
              Every detail is engineered to eliminate form fatigue, speed up respondent entry, and preserve data integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Card 1 */}
            <div className="crayon-card crayon-card-brand p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-[#6E1F2A] text-white flex items-center justify-center font-bold shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-[#1C1917]">Conversational One-Q Flow</h3>
                <p className="text-xs text-[#78716C] font-medium leading-relaxed">
                  Presents one question at a time with smooth Framer Motion slide transitions and progress tracking so respondents stay focused.
                </p>
              </div>

              {/* Interactive Video-like Mini Demo */}
              <div className="p-3 bg-white border border-[#E6DFD5] rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#6E1F2A] font-bold">
                  <span>Question 1 of 3</span>
                  <Play className="w-3 h-3 fill-current" />
                </div>
                <div className="p-2 bg-[#F6F3ED] rounded-lg font-semibold text-[11px]">
                  "How would you rate our platform?"
                </div>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="crayon-card crayon-card-brand p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-[#6E1F2A] text-white flex items-center justify-center font-bold shadow-sm">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-[#1C1917]">AI Schema Generator</h3>
                <p className="text-xs text-[#78716C] font-medium leading-relaxed">
                  Describe your desired form in plain English prompts and let AI structure questions, choices, and validation settings instantly.
                </p>
              </div>

              {/* Interactive Video-like Mini Demo */}
              <div className="p-3 bg-white border border-[#E6DFD5] rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#6E1F2A] font-bold">
                  <span>AI Prompt Simulator</span>
                  <Zap className="w-3 h-3" />
                </div>
                <div className="p-2 bg-[#F6F3ED] rounded-lg font-mono text-[10px] text-[#6E1F2A] font-bold truncate">
                  "Create customer survey..."
                </div>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="crayon-card crayon-card-brand p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-[#6E1F2A] text-white flex items-center justify-center font-bold shadow-sm">
                  <Command className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-[#1C1917]">Keyboard Hotkeys & Shortcuts</h3>
                <p className="text-xs text-[#78716C] font-medium leading-relaxed">
                  Respondents navigate using <kbd className="px-1.5 py-0.5 text-[10px] bg-white border rounded font-mono font-bold">Enter ↵</kbd>, <kbd className="px-1.5 py-0.5 text-[10px] bg-white border rounded font-mono font-bold">Shift+Enter</kbd>, and numerical choice keys.
                </p>
              </div>

              {/* Interactive Video-like Mini Demo */}
              <div className="p-3 bg-white border border-[#E6DFD5] rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#6E1F2A] font-bold">
                  <span>Shortcut Simulator</span>
                  <Command className="w-3 h-3" />
                </div>
                <div className="flex justify-between items-center bg-[#F6F3ED] p-2 rounded-lg font-mono text-[10px]">
                  <span>Submit: <strong className="text-[#6E1F2A]">Enter ↵</strong></span>
                  <span>Palette: <strong className="text-[#6E1F2A]">⌘K</strong></span>
                </div>
              </div>
            </div>

            {/* Feature Card 4 */}
            <div className="crayon-card crayon-card-brand p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-[#6E1F2A] text-white flex items-center justify-center font-bold shadow-sm">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-[#1C1917]">Form Health Audit</h3>
                <p className="text-xs text-[#78716C] font-medium leading-relaxed">
                  Built-in diagnostic auditor analyzes questions, missing choices, and required rules before publishing so you never launch broken forms.
                </p>
              </div>

              {/* Interactive Video-like Mini Demo */}
              <div className="p-3 bg-white border border-[#E6DFD5] rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#6E1F2A] font-bold">
                  <span>Health Auditor</span>
                  <Check className="w-3.5 h-3.5 text-[#34D399]" />
                </div>
                <div className="p-2 bg-[#E6F4EA] text-[#059669] rounded-lg font-semibold text-[10px] flex items-center justify-between">
                  <span>100% Pre-publish Pass</span>
                  <span className="font-bold">PASSED</span>
                </div>
              </div>
            </div>

            {/* Feature Card 5 */}
            <div className="crayon-card crayon-card-brand p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-[#6E1F2A] text-white flex items-center justify-center font-bold shadow-sm">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-[#1C1917]">Funnel Analytics & Export</h3>
                <p className="text-xs text-[#78716C] font-medium leading-relaxed">
                  Track views, completion rates, average duration times, and question dropoff metrics with instant CSV export capabilities.
                </p>
              </div>

              {/* Interactive Video-like Mini Demo */}
              <div className="p-3 bg-white border border-[#E6DFD5] rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#6E1F2A] font-bold">
                  <span>Real-time Funnel</span>
                  <BarChart3 className="w-3 h-3" />
                </div>
                <div className="flex justify-between items-center bg-[#F6F3ED] p-2 rounded-lg font-mono text-[10px]">
                  <span>Conversion: <strong className="text-[#6E1F2A]">83.1%</strong></span>
                  <span>Export: <strong className="text-[#6E1F2A]">CSV</strong></span>
                </div>
              </div>
            </div>

            {/* Feature Card 6 */}
            <div className="crayon-card crayon-card-brand p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-[#6E1F2A] text-white flex items-center justify-center font-bold shadow-sm">
                  <Palette className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-[#1C1917]">5 Curated Brand Themes</h3>
                <p className="text-xs text-[#78716C] font-medium leading-relaxed">
                  Select from Deep Burgundy, Midnight Sky, Emerald Forest, Deep Ocean, or Monochrome Minimal for 100% theme consistency.
                </p>
              </div>

              {/* Interactive Video-like Mini Demo */}
              <div className="p-3 bg-white border border-[#E6DFD5] rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#6E1F2A] font-bold">
                  <span>Theme Palette</span>
                  <Palette className="w-3 h-3" />
                </div>
                <div className="flex items-center justify-between p-1.5 bg-[#F6F3ED] rounded-lg">
                  <span className="w-4 h-4 rounded-full bg-[#6E1F2A]" title="Burgundy" />
                  <span className="w-4 h-4 rounded-full bg-[#0F172A]" title="Midnight" />
                  <span className="w-4 h-4 rounded-full bg-[#2F7D5B]" title="Forest" />
                  <span className="w-4 h-4 rounded-full bg-[#41658A]" title="Ocean" />
                  <span className="w-4 h-4 rounded-full bg-[#111111]" title="Minimal" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. REFINED MULTI-COLUMN FOOTER */}
      <footer className="py-16 bg-crayon-paper border-t-2 border-[#E6DFD5] text-xs text-[#78716C]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-left">
            {/* Column 1: Brand & Operational Status */}
            <div className="space-y-4 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-xl bg-[#6E1F2A] flex items-center justify-center text-white font-bold shadow-sm">
                  <RippleLogo className="w-5 h-5 text-white" />
                </div>
                <span className="font-extrabold text-xl text-[#1C1917] group-hover:text-[#6E1F2A] transition-colors">
                  Ripple
                </span>
              </Link>
              <p className="text-xs text-[#78716C] font-medium leading-relaxed">
                Next-generation conversational form builder designed for maximum respondent engagement and real-time conversion insights.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4EA] border border-[#34D399] text-[11px] font-bold text-[#059669]">
                <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                <span>Systems 100% Operational</span>
              </div>
            </div>

            {/* Column 2: Core Platform Features */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-[#1C1917] text-xs uppercase tracking-wider">Product Platform</h4>
              <ul className="space-y-2 font-semibold">
                <li><Link href="/templates" className="hover:text-[#6E1F2A] transition-colors">Form Templates</Link></li>
                <li><Link href="/ai-generator" className="hover:text-[#6E1F2A] transition-colors">AI Form Generator</Link></li>
                <li><Link href="/f/saas-customer-feedback" className="hover:text-[#6E1F2A] transition-colors">Conversational Flow</Link></li>
                <li><Link href="/shortcuts" className="hover:text-[#6E1F2A] transition-colors">Keyboard Hotkeys (⌘K)</Link></li>
              </ul>
            </div>

            {/* Column 3: Resources & Docs */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-[#1C1917] text-xs uppercase tracking-wider">Resources & Guide</h4>
              <ul className="space-y-2 font-semibold">
                <li><Link href="/shortcuts" className="hover:text-[#6E1F2A] transition-colors">Command Palette</Link></li>
                <li><Link href="/order" className="hover:text-[#6E1F2A] transition-colors">Pricing & Plans</Link></li>
                <li><Link href="/login" className="hover:text-[#6E1F2A] transition-colors">Demo Creator Login</Link></li>
              </ul>
            </div>

            {/* Column 4: Account & Workspace */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-[#1C1917] text-xs uppercase tracking-wider">Account & Workspace</h4>
              <ul className="space-y-2 font-semibold">
                <li><Link href="/login" className="hover:text-[#6E1F2A] transition-colors">Sign In to Dashboard</Link></li>
                <li><Link href="/register" className="hover:text-[#6E1F2A] transition-colors">Create Free Account</Link></li>
                <li><Link href="/settings" className="hover:text-[#6E1F2A] transition-colors">Profile Settings</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#E6DFD5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold">
            <p>© 2026 Ripple Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/templates" className="hover:text-[#6E1F2A]">Privacy Policy</Link>
              <Link href="/templates" className="hover:text-[#6E1F2A]">Terms of Service</Link>
              <Link href="/templates" className="hover:text-[#6E1F2A]">Security Snapshot</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
