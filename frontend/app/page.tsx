"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/auth-store";
import { Navbar } from "../components/Navbar";
import { RippleLogo } from "../components/RippleLogo";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Sparkles, Shield, Zap, CheckCircle2, Command, Star,
  MessageSquare, BarChart3, Layers, Palette, Eye, ArrowUpRight, Lock, Check
} from "lucide-react";
import { Button } from "../components/ui/button";

export default function LandingPage() {
  const router = useRouter();
  const { user, fetchUser } = useAuthStore();

  const [activeDemoQ, setActiveDemoQ] = useState(0);
  const [demoAnswered, setDemoAnswered] = useState<Record<number, any>>({});

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const demoQuestions = [
    {
      type: "rating",
      title: "How would you rate your team's form response rates?",
      subtitle: "1 star = Very Low, 5 stars = High Conversion",
      options: [1, 2, 3, 4, 5]
    },
    {
      type: "choice",
      title: "What is your primary goal for form creation?",
      subtitle: "Select your main business objective",
      options: ["Lead Generation", "Customer Feedback", "Event Registration", "Employee Surveys"]
    },
    {
      type: "yesno",
      title: "Do you want AI to generate form structures automatically?",
      subtitle: "Instant AI generation from plain text prompts",
      options: ["Yes, absolutely", "I prefer manual control"]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF8] text-[#191716] overflow-x-hidden">
      <Navbar />

      {/* 1. Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#6E1F2A]/5 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F7EEF0] border border-[#F0C9CD] text-xs font-bold text-[#6E1F2A] mb-6 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Ripple 2.0 — Next-Gen Conversational Form Platform</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#191716] tracking-tight leading-[1.1] max-w-4xl"
        >
          Conversational Forms that <br />
          <span className="text-[#6E1F2A] underline decoration-[#6E1F2A]/30 underline-offset-8">
            Feel Like Human Dialog.
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-xl text-[#6F6A67] max-w-2xl font-normal leading-relaxed"
        >
          Capture up to 3.4x more responses with one-question-at-a-time flow, keyboard shortcuts, AI generation, and instant real-time analytics.
        </motion.p>

        {/* Hero Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Link href={user ? "/dashboard" : "/register"}>
            <Button size="lg" className="shadow-md text-sm font-bold px-8 py-3 bg-[#6E1F2A] hover:bg-[#581821] text-white" rightIcon={<ArrowRight className="w-4 h-4" />}>
              {user ? "Go to Dashboard" : "Start Building Free"}
            </Button>
          </Link>
          <Link href="/f/saas-customer-feedback">
            <Button variant="outline" size="lg" className="text-sm font-semibold border-[#E7E2DE] hover:bg-[#F5F2EF]" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
              Experience Live Demo Form
            </Button>
          </Link>
        </motion.div>

        {/* Demo Account Quick Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 p-4 bg-[#FCFBF8] border border-[#E7E2DE] rounded-2xl text-xs text-[#191716] max-w-md w-full text-left shadow-card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[#6E1F2A] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Instant Demo Account Access
            </span>
            <Link href="/login" className="text-[11px] font-bold text-[#6E1F2A] hover:underline">
              Sign In →
            </Link>
          </div>
          <div className="flex justify-between items-center bg-[#F5F2EF] p-2.5 rounded-xl font-mono text-[11px]">
            <span>Email: <strong className="text-[#191716]">demo@ripple.com</strong></span>
            <span>Pass: <strong className="text-[#191716]">password123</strong></span>
          </div>
          <p className="text-[11px] text-[#6F6A67] mt-2">
            Pre-loaded with 5 forms, version snapshots, and 25+ realistic submission entries.
          </p>
        </motion.div>

        {/* 2. Interactive Animated Product Canvas Sandbox */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 w-full max-w-4xl bg-white border border-[#E7E2DE] rounded-3xl shadow-modal overflow-hidden text-left"
        >
          {/* Mock Browser Header Bar */}
          <div className="bg-[#F5F2EF] px-5 py-3 border-b border-[#E7E2DE] flex items-center justify-between text-xs text-[#6F6A67]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#B54747]" />
              <span className="w-3 h-3 rounded-full bg-[#FEF3C7]" />
              <span className="w-3 h-3 rounded-full bg-[#2F7D5B]" />
              <span className="font-mono text-[11px] ml-2 text-[#191716]">https://ripple.app/f/customer-survey</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] bg-white px-2.5 py-1 rounded-lg border border-[#E7E2DE]">
              <span>Interactive Sandbox</span>
            </div>
          </div>

          {/* Interactive Question Card */}
          <div className="p-8 sm:p-12 bg-[#FCFBF8] min-h-[320px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDemoQ}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6E1F2A] uppercase tracking-wider">
                    Question 0{activeDemoQ + 1} of 03
                  </span>
                  <span className="text-xs font-mono text-[#6F6A67]">Press Enter ↵</span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#191716]">
                    {demoQuestions[activeDemoQ].title}
                  </h3>
                  <p className="text-xs text-[#6F6A67] mt-1">
                    {demoQuestions[activeDemoQ].subtitle}
                  </p>
                </div>

                {/* Question Type Mock Options */}
                <div className="pt-2">
                  {demoQuestions[activeDemoQ].type === "rating" && (
                    <div className="flex gap-3">
                      {demoQuestions[activeDemoQ].options.map((num) => {
                        const isSelected = demoAnswered[activeDemoQ] === num;
                        return (
                          <button
                            key={num}
                            onClick={() => setDemoAnswered({ ...demoAnswered, [activeDemoQ]: num })}
                            className={`w-12 h-12 rounded-2xl border text-sm font-bold flex flex-col items-center justify-center transition-all ${
                              isSelected
                                ? "bg-[#6E1F2A] text-white border-[#6E1F2A] shadow-md scale-105"
                                : "bg-white border-[#E7E2DE] hover:border-[#6E1F2A] text-[#191716]"
                            }`}
                          >
                            <Star className={`w-4 h-4 ${isSelected ? "fill-white" : "text-[#B7791F]"}`} />
                            <span className="text-[10px] mt-0.5">{num}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {demoQuestions[activeDemoQ].type === "choice" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {demoQuestions[activeDemoQ].options.map((opt, idx) => {
                        const isSelected = demoAnswered[activeDemoQ] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => setDemoAnswered({ ...demoAnswered, [activeDemoQ]: opt })}
                            className={`p-3.5 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all ${
                              isSelected
                                ? "bg-[#6E1F2A] text-white border-[#6E1F2A] shadow-md"
                                : "bg-white border-[#E7E2DE] hover:border-[#6E1F2A] text-[#191716]"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono ${
                                isSelected ? "bg-white/20 text-white" : "bg-[#F5F2EF] text-[#6E1F2A]"
                              }`}>
                                {idx + 1}
                              </span>
                              <span>{opt}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {demoQuestions[activeDemoQ].type === "yesno" && (
                    <div className="flex gap-4">
                      {demoQuestions[activeDemoQ].options.map((opt) => {
                        const isSelected = demoAnswered[activeDemoQ] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => setDemoAnswered({ ...demoAnswered, [activeDemoQ]: opt })}
                            className={`flex-1 py-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                              isSelected
                                ? "bg-[#6E1F2A] text-white border-[#6E1F2A] shadow-md"
                                : "bg-white border-[#E7E2DE] hover:border-[#6E1F2A] text-[#191716]"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Sandbox Step Navigation */}
            <div className="pt-6 border-t border-[#E7E2DE] flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeDemoQ > 0 && (
                  <button
                    onClick={() => setActiveDemoQ(activeDemoQ - 1)}
                    className="px-3 py-1.5 rounded-lg border border-[#E7E2DE] text-xs font-semibold text-[#6F6A67] hover:text-[#191716]"
                  >
                    ← Previous
                  </button>
                )}
              </div>

              <button
                onClick={() => setActiveDemoQ((activeDemoQ + 1) % demoQuestions.length)}
                className="px-5 py-2 bg-[#6E1F2A] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm hover:bg-[#581821] transition-colors"
              >
                <span>{activeDemoQ === demoQuestions.length - 1 ? "Restart Demo ↺" : "Next Question →"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. Comprehensive Feature Grid Section */}
      <section className="py-20 bg-white border-t border-b border-[#E7E2DE] px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191716] tracking-tight">
              Engineered for Highest Completion Rates
            </h2>
            <p className="text-sm text-[#6F6A67] leading-relaxed">
              Every detail is meticulously crafted to eliminate form fatigue, speed up respondent entry, and preserve data integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="p-6 bg-[#FCFBF8] border border-[#E7E2DE] rounded-2xl space-y-3 shadow-subtle hover:border-[#6E1F2A]/40"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F7EEF0] text-[#6E1F2A] flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#191716]">Typeform-Style Conversational UX</h3>
              <p className="text-xs text-[#6F6A67] leading-relaxed">
                Presents one question at a time with smooth Framer Motion slide transitions and progress tracking so respondents never feel overwhelmed.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="p-6 bg-[#FCFBF8] border border-[#E7E2DE] rounded-2xl space-y-3 shadow-subtle hover:border-[#6E1F2A]/40"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F7EEF0] text-[#6E1F2A] flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#191716]">AI Form Generator</h3>
              <p className="text-xs text-[#6F6A67] leading-relaxed">
                Describe your desired form in plain English prompts and let AI structure questions, choices, and validation settings instantly.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="p-6 bg-[#FCFBF8] border border-[#E7E2DE] rounded-2xl space-y-3 shadow-subtle hover:border-[#6E1F2A]/40"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F7EEF0] text-[#6E1F2A] flex items-center justify-center font-bold">
                <Command className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#191716]">Keyboard-First Hotkeys & Shortcuts</h3>
              <p className="text-xs text-[#6F6A67] leading-relaxed">
                Respondents can navigate using <kbd className="px-1.5 py-0.5 text-[10px] bg-white border rounded">Enter ↵</kbd>, <kbd className="px-1.5 py-0.5 text-[10px] bg-white border rounded">Shift+Enter</kbd>, and numerical option keys. Creators use <kbd className="px-1.5 py-0.5 text-[10px] bg-white border rounded">⌘K</kbd> for instant actions.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="p-6 bg-[#FCFBF8] border border-[#E7E2DE] rounded-2xl space-y-3 shadow-subtle hover:border-[#6E1F2A]/40"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F7EEF0] text-[#6E1F2A] flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#191716]">Form Health Diagnostic Audit</h3>
              <p className="text-xs text-[#6F6A67] leading-relaxed">
                Built-in diagnostic auditor analyzes questions, missing choices, and required rules before publishing so you never launch a broken form.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="p-6 bg-[#FCFBF8] border border-[#E7E2DE] rounded-2xl space-y-3 shadow-subtle hover:border-[#6E1F2A]/40"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F7EEF0] text-[#6E1F2A] flex items-center justify-center font-bold">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#191716]">Real-Time Funnel Analytics</h3>
              <p className="text-xs text-[#6F6A67] leading-relaxed">
                Track total views, completion rates, average completion times, and question dropoff metrics with instant CSV export capabilities.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="p-6 bg-[#FCFBF8] border border-[#E7E2DE] rounded-2xl space-y-3 shadow-subtle hover:border-[#6E1F2A]/40"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F7EEF0] text-[#6E1F2A] flex items-center justify-center font-bold">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#191716]">5 Curated Brand Themes</h3>
              <p className="text-xs text-[#6F6A67] leading-relaxed">
                Select from Deep Burgundy, Midnight Sky, Emerald Forest, Deep Ocean, or Monochrome Minimal for 100% theme consistency across all controls.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="py-12 bg-[#FCFBF8] border-t border-[#E7E2DE] text-xs text-[#6F6A67]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <RippleLogo className="w-6 h-6 text-[#6E1F2A]" />
            <span className="font-bold text-base text-[#191716] group-hover:text-[#6E1F2A] transition-colors">
              Ripple
            </span>
          </Link>

          <div className="flex items-center gap-6 font-semibold">
            <Link href="/templates" className="hover:text-[#191716] transition-colors">
              Templates
            </Link>
            <Link href="/ai-generator" className="hover:text-[#191716] transition-colors">
              AI Generator
            </Link>
            <Link href="/order" className="hover:text-[#191716] transition-colors">
              Pricing & Orders
            </Link>
            <Link href="/login" className="hover:text-[#191716] transition-colors">
              Sign In
            </Link>
          </div>

          <p>© 2026 Ripple Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
