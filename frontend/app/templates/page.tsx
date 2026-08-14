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
import { ArrowLeft, Sparkles, FileText, Plus, Check } from "lucide-react";

export default function TemplatesPage() {
  const router = useRouter();
  const { user, fetchUser } = useAuthStore();
  const { success, error: toastError } = useToast();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingId, setCreatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    api
      .getTemplates()
      .then(setTemplates)
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF8]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="text-xs font-semibold text-[#6E1F2A] hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-[#191716] tracking-tight">Form Templates Library</h1>
            <p className="text-xs text-[#6F6A67] mt-1">
              Select a pre-built template with expert-designed questions to launch your form in seconds.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-48 bg-[#F5F2EF] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-white border border-[#E7E2DE] hover:border-[#6E1F2A]/40 rounded-2xl p-6 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-[#6E1F2A] uppercase tracking-wider bg-[#F7EEF0] px-2.5 py-1 rounded-full">
                      {tmpl.category}
                    </span>
                    <span className="text-xs text-[#6F6A67] font-semibold">{tmpl.questions?.length || 0} Questions</span>
                  </div>

                  <h3 className="text-base font-bold text-[#191716]">{tmpl.title}</h3>
                  <p className="text-xs text-[#6F6A67] mt-1 line-clamp-2">{tmpl.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E7E2DE] flex items-center justify-between">
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={creatingId === tmpl.id}
                    onClick={() => handleUseTemplate(tmpl.id)}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
