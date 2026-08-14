"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/auth-store";
import { Navbar } from "../components/Navbar";
import { RippleLogo } from "../components/RippleLogo";
import { ArrowRight, Sparkles, Shield, Zap, CheckCircle2, Command } from "lucide-react";
import { Button } from "../components/ui/button";

export default function LandingPage() {
  const router = useRouter();
  const { user, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF8]">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7EEF0] border border-[#E7E2DE] text-xs font-semibold text-[#6E1F2A] mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Conversational Form Builder</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#191716] tracking-tight leading-[1.1] max-w-4xl">
          Create forms people <br />
          <span className="text-[#6E1F2A]">actually enjoy</span> completing.
        </h1>

        <p className="mt-6 text-base sm:text-xl text-[#6F6A67] max-w-2xl font-normal leading-relaxed">
          Ripple combines Typeform-inspired conversational respondent flows with a powerful 3-panel editor, real-time autosave, immutable versioning, and deep analytics.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href={user ? "/dashboard" : "/register"}>
            <Button size="lg" className="shadow-md text-sm font-semibold" rightIcon={<ArrowRight className="w-4 h-4" />}>
              {user ? "Go to Dashboard" : "Start Building for Free"}
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="text-sm font-semibold">
              Sign In (Demo Account)
            </Button>
          </Link>
        </div>

        {/* Demo Credentials Box */}
        <div className="mt-8 p-4 bg-[#F5F2EF] border border-[#E7E2DE] rounded-xl text-xs text-[#191716] max-w-md text-left shadow-subtle">
          <p className="font-bold text-[#6E1F2A] mb-1">⚡ Quick Demo Evaluation Login:</p>
          <p><span className="font-semibold">Email:</span> demo@ripple.com</p>
          <p><span className="font-semibold">Password:</span> password123</p>
          <p className="text-[11px] text-[#6F6A67] mt-1">Pre-loaded with 5 forms, version snapshots, and 25+ realistic responses.</p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full">
          <div className="p-6 bg-white border border-[#E7E2DE] rounded-2xl shadow-subtle hover:border-[#6E1F2A]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#F7EEF0] flex items-center justify-center text-[#6E1F2A] mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#191716]">3-Panel Fast Builder</h3>
            <p className="mt-2 text-xs text-[#6F6A67] leading-relaxed">
              Drag-and-drop reordering, debounced autosave, undo/redo history, command palette (Cmd+K), and form health auditing.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E7E2DE] rounded-2xl shadow-subtle hover:border-[#6E1F2A]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#F7EEF0] flex items-center justify-center text-[#6E1F2A] mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#191716]">Conversational Flow</h3>
            <p className="mt-2 text-xs text-[#6F6A67] leading-relaxed">
              One-question-at-a-time respondent experience with Framer Motion slide transitions, full keyboard shortcuts, and local draft recovery.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E7E2DE] rounded-2xl shadow-subtle hover:border-[#6E1F2A]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#F7EEF0] flex items-center justify-center text-[#6E1F2A] mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#191716]">Immutable Versioning</h3>
            <p className="mt-2 text-xs text-[#6F6A67] leading-relaxed">
              Publishing creates immutable version snapshots so post-publish draft edits never corrupt historical submission data.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-[#E7E2DE] bg-white text-center text-xs text-[#6F6A67]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <RippleLogo className="w-5 h-5 text-[#6E1F2A]" />
            <span className="font-bold text-[#191716]">Ripple</span>
            <span>— SaaS Form Builder Platform</span>
          </div>
          <p>© 2026 Ripple Inc.</p>
        </div>
      </footer>
    </div>
  );
}
