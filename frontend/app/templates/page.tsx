"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { useAuthStore } from "../../stores/auth-store";
import { api } from "../../lib/api-client";
import { Template } from "../../types";
import { useToast } from "../../components/ui/toast";
import { Button } from "../../components/ui/button";
import { Dialog } from "../../components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Sparkles, FileText, Plus, Eye, Check, Layers, ArrowRight, HelpCircle
} from "lucide-react";

export default function TemplatesPage() {
  const router = useRouter();
  const { user, fetchUser } = useAuthStore();
  const { success, error: toastError } = useToast();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    api
      .getTemplates()
      .then((data) => setTemplates(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUseTemplate = async (tmplId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      setCreatingId(tmplId);
      const newForm = await api.useTemplate(tmplId);
      success("Form created from template!");
      router.push(`/builder/${newForm.id}`);
    } catch (err) {
      toastError("Failed to use template.");
    } finally {
      setCreatingId(null);
    }
  };

  const categories = ["all", "Customer Feedback", "Events & RSVP", "HR & Pulse", "Product Screening"];

  const filteredTemplates = templates.filter((t) => {
    if (activeCategory === "all") return true;
    return (t.category || "").toLowerCase().includes(activeCategory.toLowerCase().split(" ")[0]);
  });

  return (
    <div className="min-h-screen flex flex-col bg-crayon-paper text-[#1C1917]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        {/* 1. HEADER BANNER */}
        <div className="crayon-card bg-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Link
              href="/dashboard"
              className="text-xs font-bold text-[#6E1F2A] hover:underline flex items-center gap-1.5 mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Workspace
            </Link>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9EFEF] border border-[#F0C9CD] text-xs font-extrabold text-[#6E1F2A]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pre-Built Form Schemas</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight">
              Form Templates Library
            </h1>
            <p className="text-sm text-[#78716C] font-medium max-w-xl">
              Launch conversational forms in seconds with expert-curated questions, themes, and logic.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/ai-generator">
              <Button
                size="lg"
                className="crayon-button bg-[#6E1F2A] hover:bg-[#541720] text-white text-xs font-extrabold px-6 py-3 rounded-2xl shadow-sm"
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Generate with AI Instead
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. CATEGORY FILTER TABS */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border-2 border-[#E6DFD5] shadow-xs overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold capitalize transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-[#6E1F2A] text-white shadow-sm"
                    : "text-[#78716C] hover:text-[#1C1917] hover:bg-[#F6F3ED]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 3. TEMPLATE CARDS GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-56 bg-[#F6F3ED] rounded-3xl border-2 border-[#E6DFD5] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="crayon-card crayon-card-brand p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-extrabold text-[#6E1F2A] uppercase tracking-wider bg-[#F9EFEF] px-3 py-1 rounded-full border border-[#F0C9CD]">
                      {tmpl.category || "General"}
                    </span>
                    <span className="text-xs text-[#78716C] font-bold">
                      {tmpl.questions?.length || 0} Questions
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-[#1C1917]">{tmpl.title}</h3>
                  <p className="text-xs text-[#78716C] mt-1.5 line-clamp-2 font-medium leading-relaxed">
                    {tmpl.description}
                  </p>

                  {/* Question preview snippets */}
                  <div className="mt-4 p-3 bg-white border border-[#E6DFD5] rounded-xl text-xs space-y-1.5">
                    <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider block">Sample Question:</span>
                    <p className="font-semibold text-[#1C1917] line-clamp-1">
                      "{tmpl.questions?.[0]?.title || "What is your main feedback?"}"
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E6DFD5] flex items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white text-xs font-bold border-[#E6DFD5] rounded-xl"
                    onClick={() => setPreviewTemplate(tmpl)}
                    leftIcon={<Eye className="w-3.5 h-3.5 text-[#6E1F2A]" />}
                  >
                    Preview
                  </Button>

                  <Button
                    size="sm"
                    className="crayon-button bg-[#6E1F2A] hover:bg-[#541720] text-white text-xs font-extrabold px-4 py-2 rounded-xl"
                    isLoading={creatingId === tmpl.id}
                    onClick={() => handleUseTemplate(tmpl.id)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* TEMPLATE PREVIEW MODAL */}
      {previewTemplate && (
        <Dialog
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          title={`Preview: ${previewTemplate.title}`}
        >
          <div className="space-y-4 pt-2 text-xs text-[#1C1917]">
            <p className="text-xs text-[#78716C] font-medium">{previewTemplate.description}</p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <span className="font-extrabold uppercase tracking-wider text-[10px] text-[#6E1F2A] block">
                Template Questions ({previewTemplate.questions?.length || 0})
              </span>
              {previewTemplate.questions?.map((q, idx) => (
                <div key={idx} className="p-3 bg-[#F6F3ED] rounded-xl border border-[#E6DFD5] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{idx + 1}. {q.title}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white font-bold text-[#6E1F2A]">
                      {q.type}
                    </span>
                  </div>
                  {q.description && <p className="text-[11px] text-[#78716C]">{q.description}</p>}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E6DFD5]">
              <Button variant="outline" size="sm" onClick={() => setPreviewTemplate(null)}>
                Close Preview
              </Button>
              <Button
                size="sm"
                className="bg-[#6E1F2A] text-white font-bold"
                isLoading={creatingId === previewTemplate.id}
                onClick={() => {
                  const id = previewTemplate.id;
                  setPreviewTemplate(null);
                  handleUseTemplate(id);
                }}
              >
                Use This Template
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
