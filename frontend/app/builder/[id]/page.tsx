"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "../../../stores/auth-store";
import { useBuilderStore } from "../../../stores/builder-store";
import { api, ApiError } from "../../../lib/api-client";
import { Question, FormTheme } from "../../../types";
import { useToast } from "../../../components/ui/toast";
import { HeaderNav } from "../../../components/builder/HeaderNav";
import { QuestionList } from "../../../components/builder/QuestionList";
import { CanvasEditor } from "../../../components/builder/CanvasEditor";
import { QuestionSettings } from "../../../components/builder/QuestionSettings";
import { CommandPaletteModal } from "../../../components/CommandPaletteModal";
import { FormHealthModal } from "../../../components/FormHealthModal";
import { ShareCenterModal } from "../../../components/ShareCenterModal";
import { Button } from "../../../components/ui/button";
import { Palette, Check, ArrowRight } from "lucide-react";

const AVAILABLE_THEMES: FormTheme[] = [
  { id: "burgundy", name: "Deep Burgundy", background: "#FCFBF8", surface: "#F5F2EF", accent: "#6E1F2A", text: "#191716", border: "#E7E2DE" },
  { id: "midnight", name: "Midnight Sky", background: "#0F172A", surface: "#1E293B", accent: "#38BDF8", text: "#F8FAFC", border: "#334155" },
  { id: "forest", name: "Emerald Forest", background: "#F4F7F4", surface: "#E6EFEA", accent: "#2F7D5B", text: "#1C2E24", border: "#D2E2D8" },
  { id: "ocean", name: "Deep Ocean", background: "#F0F6FA", surface: "#E1EEF6", accent: "#41658A", text: "#0F2942", border: "#CBE0F1" },
  { id: "minimal", name: "Monochrome Minimal", background: "#FFFFFF", surface: "#F5F5F5", accent: "#111111", text: "#111111", border: "#E5E5E5" },
];

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const { user, fetchUser, isLoading: authLoading } = useAuthStore();
  const {
    form,
    setForm,
    activeQuestionId,
    setActiveQuestionId,
    saveStatus,
    setSaveStatus,
    updateFormLocal,
    toggleShareModal,
  } = useBuilderStore();

  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"builder" | "preview" | "theme" | "share" | "responses" | "analytics">("builder");

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Initial Form Fetch
  useEffect(() => {
    if (user && formId) {
      setLoading(true);
      api
        .getForm(formId)
        .then((data) => {
          setForm(data);
          setSaveStatus("saved");
        })
        .catch((err) => {
          toastError("Failed to load form details.");
          router.push("/dashboard");
        })
        .finally(() => setLoading(false));
    }
  }, [user, formId]);

  // Debounced Autosave Logic
  const triggerAutosave = useCallback(
    (currentForm: typeof form) => {
      if (!currentForm) return;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setSaveStatus("saving");

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await api.updateForm(currentForm.id, {
            title: currentForm.title,
            description: currentForm.description,
            theme_id: currentForm.theme_id,
            thank_you_title: currentForm.thank_you_title,
            thank_you_message: currentForm.thank_you_message,
          });
          setSaveStatus("saved");
        } catch (err) {
          setSaveStatus("error");
        }
      }, 1000);
    },
    [setSaveStatus]
  );

  // Question Mutating Actions
  const handleAddQuestion = async () => {
    if (!form) return;
    try {
      const newQ = await api.addQuestion(form.id, {
        type: "short_text",
        title: "Untitled Question",
        required: false,
        position: form.questions.length,
      });

      updateFormLocal((prev) => ({
        ...prev,
        questions: [...prev.questions, newQ],
      }));
      setActiveQuestionId(newQ.id);
      success("Question added.");
    } catch (err) {
      toastError("Failed to add question.");
    }
  };

  const handleUpdateQuestion = async (updated: Partial<Question>) => {
    if (!form || !activeQuestionId) return;

    // Local optimistic update
    updateFormLocal((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === activeQuestionId ? { ...q, ...updated } : q)),
    }));

    setSaveStatus("saving");
    try {
      await api.updateQuestion(activeQuestionId, updated);
      setSaveStatus("saved");
    } catch (err) {
      setSaveStatus("error");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!form) return;
    try {
      await api.deleteQuestion(id);
      const filtered = form.questions.filter((q) => q.id !== id);
      updateFormLocal((prev) => ({
        ...prev,
        questions: filtered,
      }));
      if (activeQuestionId === id) {
        setActiveQuestionId(filtered.length > 0 ? filtered[0].id : null);
      }
      success("Question deleted.");
    } catch (err) {
      toastError("Failed to delete question.");
    }
  };

  const handleDuplicateQuestion = async (q: Question) => {
    if (!form) return;
    try {
      const dup = await api.addQuestion(form.id, {
        type: q.type,
        title: `${q.title} (Copy)`,
        description: q.description,
        required: q.required,
        position: form.questions.length,
        settings_json: q.settings_json,
        options: q.options,
      });
      updateFormLocal((prev) => ({
        ...prev,
        questions: [...prev.questions, dup],
      }));
      setActiveQuestionId(dup.id);
      success("Question duplicated.");
    } catch (err) {
      toastError("Failed to duplicate question.");
    }
  };

  const handleReorderQuestions = async (newQuestions: Question[]) => {
    if (!form) return;
    updateFormLocal((prev) => ({
      ...prev,
      questions: newQuestions,
    }));
    try {
      await api.reorderQuestions(form.id, {
        questions: newQuestions.map((q, idx) => ({ id: q.id, position: idx })),
      });
      setSaveStatus("saved");
    } catch (err) {
      setSaveStatus("error");
    }
  };

  const handlePublish = async () => {
    if (!form) return;
    try {
      const res = await api.publishForm(form.id);
      setForm({ ...form, status: "published", published_at: res.published_at });
      success(`✓ Form Published! Public version ${res.version_number} live.`);
      toggleShareModal(true);
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : "Cannot publish form.";
      toastError(msg);
    }
  };

  const handleUnpublish = async () => {
    if (!form) return;
    try {
      await api.unpublishForm(form.id);
      setForm({ ...form, status: "draft" });
      success("Form reverted to draft.");
    } catch (err) {
      toastError("Failed to unpublish.");
    }
  };

  if (loading || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF8]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#6E1F2A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#6F6A67]">Loading Ripple 3-Panel Editor...</p>
        </div>
      </div>
    );
  }

  const activeQuestion = form.questions.find((q) => q.id === activeQuestionId) || null;
  const activeIndex = form.questions.findIndex((q) => q.id === activeQuestionId);

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Header Bar */}
      <HeaderNav
        form={form}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === "responses") router.push(`/responses/${form.id}`);
          else if (tab === "analytics") router.push(`/analytics/${form.id}`);
          else setActiveTab(tab);
        }}
        saveStatus={saveStatus}
        onTitleChange={(newTitle) => {
          updateFormLocal((prev) => ({ ...prev, title: newTitle }));
          triggerAutosave({ ...form, title: newTitle });
        }}
        onRetrySave={() => triggerAutosave(form)}
        onPublishClick={handlePublish}
        onUnpublishClick={handleUnpublish}
      />

      {/* Main Body */}
      {activeTab === "builder" && (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Panel 1: Questions List */}
          <QuestionList
            questions={form.questions}
            activeId={activeQuestionId}
            onSelect={(id) => setActiveQuestionId(id)}
            onReorder={handleReorderQuestions}
            onAdd={handleAddQuestion}
            onDuplicate={handleDuplicateQuestion}
            onDelete={handleDeleteQuestion}
          />

          {/* Panel 2: Live Canvas Editor */}
          <CanvasEditor
            question={activeQuestion}
            questionIndex={activeIndex >= 0 ? activeIndex : 0}
            totalQuestions={form.questions.length}
            onUpdateQuestion={handleUpdateQuestion}
          />

          {/* Panel 3: Question Settings */}
          <QuestionSettings question={activeQuestion} onUpdateQuestion={handleUpdateQuestion} />
        </div>
      )}

      {/* Theme Editor Tab */}
      {activeTab === "theme" && (
        <div className="flex-1 p-8 max-w-4xl mx-auto w-full overflow-y-auto">
          <h2 className="text-xl font-bold text-[#191716] mb-2 flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#6E1F2A]" /> Form Theme & Styling
          </h2>
          <p className="text-xs text-[#6F6A67] mb-8">
            Choose a visual palette for your conversational respondent experience.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {AVAILABLE_THEMES.map((theme) => (
              <div
                key={theme.id}
                onClick={async () => {
                  updateFormLocal((prev) => ({ ...prev, theme_id: theme.id }));
                  await api.updateForm(form.id, { theme_id: theme.id });
                  success(`Applied "${theme.name}" theme.`);
                }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  form.theme_id === theme.id ? "border-[#6E1F2A] shadow-card" : "border-[#E7E2DE] hover:border-[#6F6A67]"
                }`}
                style={{ backgroundColor: theme.background, color: theme.text }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold">{theme.name}</span>
                  {form.theme_id === theme.id && (
                    <span className="w-5 h-5 rounded-full bg-[#6E1F2A] text-white flex items-center justify-center text-xs">
                      ✓
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl space-y-2" style={{ backgroundColor: theme.surface }}>
                  <div className="h-2.5 rounded-full w-3/4" style={{ backgroundColor: theme.accent }} />
                  <div className="h-2 rounded-full w-1/2 opacity-50" style={{ backgroundColor: theme.text }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Preview Mode Tab */}
      {activeTab === "preview" && (
        <div className="flex-1 bg-[#191716]/90 p-4 sm:p-8 flex flex-col items-center justify-center overflow-hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-full flex flex-col overflow-hidden">
            <div className="bg-[#F5F2EF] px-4 py-2 border-b border-[#E7E2DE] flex items-center justify-between text-xs text-[#6F6A67]">
              <span>Preview Mode — Simulated Respondent View</span>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("builder")}>
                Exit Preview
              </Button>
            </div>
            <iframe src={`/f/${form.slug}`} className="w-full flex-1 border-none" />
          </div>
        </div>
      )}

      {/* Command Palette Modal */}
      <CommandPaletteModal
        onAddQuestion={handleAddQuestion}
        onDuplicateQuestion={() => activeQuestion && handleDuplicateQuestion(activeQuestion)}
        onDeleteQuestion={() => activeQuestionId && handleDeleteQuestion(activeQuestionId)}
        onTogglePreview={() => setActiveTab(activeTab === "preview" ? "builder" : "preview")}
        onOpenShare={() => toggleShareModal(true)}
        onPublish={handlePublish}
        onOpenTheme={() => setActiveTab("theme")}
      />

      {/* Form Health Modal */}
      <FormHealthModal
        onSelectIssueQuestion={(id) => {
          setActiveQuestionId(id);
          setActiveTab("builder");
        }}
        onPublishClick={handlePublish}
      />

      {/* Share Center Modal */}
      <ShareCenterModal />
    </div>
  );
}
