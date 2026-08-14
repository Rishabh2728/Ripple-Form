"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { ArrowLeft, Command } from "lucide-react";

export default function ShortcutsPage() {
  const shortcuts = [
    { key: "Cmd / Ctrl + K", description: "Open Command Palette in Form Builder" },
    { key: "Cmd / Ctrl + Z", description: "Undo last builder modification" },
    { key: "Cmd / Ctrl + Shift + Z", description: "Redo last builder modification" },
    { key: "Enter ↵", description: "Advance to next question in Respondent mode" },
    { key: "Shift + Enter", description: "Go back to previous question in Respondent mode" },
    { key: "1 – 9", description: "Select multiple choice option or rating score" },
    { key: "Y / N", description: "Select Yes / No choice instantly" },
    { key: "Escape", description: "Close active modal dialog" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF8]">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full">
        <Link href="/dashboard" className="text-xs font-semibold text-[#6E1F2A] hover:underline flex items-center gap-1 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>

        <div className="bg-white border border-[#E7E2DE] rounded-2xl p-8 shadow-card space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#E7E2DE]">
            <Command className="w-6 h-6 text-[#6E1F2A]" />
            <div>
              <h1 className="text-xl font-extrabold text-[#191716]">Keyboard Shortcuts Guide</h1>
              <p className="text-xs text-[#6F6A67]">Ripple is engineered keyboard-first for ultimate speed.</p>
            </div>
          </div>

          <div className="space-y-3">
            {shortcuts.map((sc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-[#FCFBF8] border border-[#E7E2DE] rounded-xl">
                <span className="text-xs font-semibold text-[#191716]">{sc.description}</span>
                <kbd className="px-2.5 py-1 text-xs font-mono font-bold text-[#6E1F2A] bg-white border border-[#E7E2DE] rounded-md shadow-subtle">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
