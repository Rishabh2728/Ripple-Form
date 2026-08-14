"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { useAuthStore } from "../../stores/auth-store";
import { api } from "../../lib/api-client";
import { useToast } from "../../components/ui/toast";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/input";
import { ArrowLeft, Sparkles, AlertTriangle, ArrowRight } from "lucide-react";

export default function AIGeneratorPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { success, error: toastError } = useToast();

  const [prompt, setPrompt] = useState("Create a SaaS customer satisfaction survey with 5 questions.");
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

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
        // Create the form in creator workspace using AI structured response
        const newForm = await api.createForm({
          title: res.form.title,
          description: res.form.description,
          questions: res.form.questions,
        });

        success(`✓ Form "${res.form.title}" generated!`);
        router.push(`/builder/${newForm.id}`);
      }
    } catch (err) {
      toastError("AI Generation failed. You can create the form manually.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF8]">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full">
        <Link href="/dashboard" className="text-xs font-semibold text-[#6E1F2A] hover:underline flex items-center gap-1 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>

        <div className="bg-white border border-[#E7E2DE] rounded-2xl p-8 shadow-card space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F7EEF0] text-[#6E1F2A] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#191716] tracking-tight">AI Form Generator</h1>
              <p className="text-xs text-[#6F6A67] mt-0.5">Describe your target form in plain text.</p>
            </div>
          </div>

          {resultMsg && (
            <div className="p-3.5 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl text-xs text-[#B7791F] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{resultMsg}</span>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4">
            <Textarea
              label="Prompt / Instructions"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Create a 5-question event registration form for a developer summit with meal preferences and ticket categories."
              required
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full shadow-sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Generate Form Structure
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
