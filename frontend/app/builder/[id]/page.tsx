"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "../../../stores/auth-store";
import { useBuilderStore } from "../../../stores/builder-store";
import { api, ApiError } from "../../../lib/api-client";
import { Question, FormTheme, ResponseListItem } from "../../../types";
import { useToast } from "../../../components/ui/toast";
import { HeaderNav } from "../../../components/builder/HeaderNav";
import { QuestionList } from "../../../components/builder/QuestionList";
import { CanvasEditor } from "../../../components/builder/CanvasEditor";
import { QuestionSettings } from "../../../components/builder/QuestionSettings";
import { CommandPaletteModal } from "../../../components/CommandPaletteModal";
import { FormHealthModal } from "../../../components/FormHealthModal";
import { ShareCenterModal } from "../../../components/ShareCenterModal";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Palette, Download, Search, MessageSquare, Clock, CheckCircle2,
  ChevronLeft, ChevronRight, Eye, BarChart3, TrendingUp, Users
} from "lucide-react";

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
  const previousTabRef = useRef<"builder" | "theme" | "responses" | "analytics">("builder");

  // Embedded Responses state
  const [responses, setResponses] = useState<ResponseListItem[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [respPage, setRespPage] = useState(1);
  const [respSearch, setRespSearch] = useState("");
  const [respLoading, setRespLoading] = useState(false);

  // Embedded Analytics state
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

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
        .catch(() => {
          toastError("Failed to load form details.");
          router.push("/dashboard");
        })
        .finally(() => setLoading(false));
    }
  }, [user, formId]);

  // Load responses when switching to responses tab
  useEffect(() => {
    if (activeTab === "responses" && formId) {
      setRespLoading(true);
      api
        .getResponses(formId, respPage, 15, respSearch)
        .then((res) => {
          setResponses(res.responses);
          setTotalResponses(res.total);
        })
        .catch(() => toastError("Failed to load responses."))
        .finally(() => setRespLoading(false));
    }
  }, [activeTab, formId, respPage, respSearch]);

  // Load analytics when switching to analytics tab
  useEffect(() => {
    if (activeTab === "analytics" && formId) {
      setAnalyticsLoading(true);
      api
        .getAnalytics(formId)
        .then(setAnalytics)
        .catch(() => toastError("Failed to load analytics."))
        .finally(() => setAnalyticsLoading(false));
    }
  }, [activeTab, formId]);

  // Tab change handler preserving return tab for Preview mode
  const handleTabChange = (tab: "builder" | "preview" | "theme" | "share" | "responses" | "analytics") => {
    if (tab === "preview") {
      if (activeTab !== "preview") {
        previousTabRef.current = activeTab as any;
      }
    }
    setActiveTab(tab);
  };

  const handleExitPreview = () => {
    setActiveTab(previousTabRef.current || "builder");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeTab === "preview") {
        e.preventDefault();
        handleExitPreview();
      }
    };

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "CLOSE_PREVIEW") {
        handleExitPreview();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("message", handleMessage);
    };
  }, [activeTab]);

  // Debounced Autosave Logic
  const triggerAutosave = useCallback(
    (currentForm: typeof form) => {
      if (!currentForm) return;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
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
    setSaveStatus("saving");
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
      setSaveStatus("saved");
      success("Question added.");
    } catch (err) {
      setSaveStatus("error");
      toastError("Failed to add question.");
    }
  };

  const handleUpdateQuestion = async (updated: Partial<Question>) => {
    if (!form || !activeQuestionId) return;

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
    setSaveStatus("saving");
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
      setSaveStatus("saved");
      success("Question deleted.");
    } catch (err) {
      setSaveStatus("error");
      toastError("Failed to delete question.");
    }
  };

  const handleDuplicateQuestion = async (q: Question) => {
    if (!form) return;
    setSaveStatus("saving");
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
      setSaveStatus("saved");
      success("Question duplicated.");
    } catch (err) {
      setSaveStatus("error");
      toastError("Failed to duplicate question.");
    }
  };

  const handleReorderQuestions = async (newQuestions: Question[]) => {
    if (!form) return;
    updateFormLocal((prev) => ({
      ...prev,
      questions: newQuestions,
    }));
    setSaveStatus("saving");
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

  const handleExportCSV = async () => {
    try {
      await api.downloadResponsesCSV(formId);
      success("CSV export download complete.");
    } catch (err) {
      toastError("Failed to export CSV file.");
    }
  };

  if (loading || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF8]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#6E1F2A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#6F6A67]">Loading Ripple Workspace...</p>
        </div>
      </div>
    );
  }

  const activeQuestion = form.questions.find((q) => q.id === activeQuestionId) || null;
  const activeIndex = form.questions.findIndex((q) => q.id === activeQuestionId);
  const totalPages = Math.ceil(totalResponses / 15) || 1;

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Header Bar persistent across all tabs */}
      <HeaderNav
        form={form}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        saveStatus={saveStatus}
        onTitleChange={(newTitle) => {
          updateFormLocal((prev) => ({ ...prev, title: newTitle }));
          triggerAutosave({ ...form, title: newTitle });
        }}
        onRetrySave={() => triggerAutosave(form)}
        onPublishClick={handlePublish}
        onUnpublishClick={handleUnpublish}
      />

      {/* 1. Builder Tab */}
      {activeTab === "builder" && (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <QuestionList
            questions={form.questions}
            activeId={activeQuestionId}
            onSelect={(id) => setActiveQuestionId(id)}
            onReorder={handleReorderQuestions}
            onAdd={handleAddQuestion}
            onDuplicate={handleDuplicateQuestion}
            onDelete={handleDeleteQuestion}
          />
          <CanvasEditor
            question={activeQuestion}
            questionIndex={activeIndex >= 0 ? activeIndex : 0}
            totalQuestions={form.questions.length}
            onUpdateQuestion={handleUpdateQuestion}
          />
          <QuestionSettings question={activeQuestion} onUpdateQuestion={handleUpdateQuestion} />
        </div>
      )}

      {/* 2. Theme Tab */}
      {activeTab === "theme" && (
        <div className="flex-1 p-8 max-w-5xl mx-auto w-full overflow-y-auto">
          <div className="crayon-card bg-white p-6 mb-8 border-2 border-[#E6DFD5] space-y-1">
            <h2 className="text-xl font-extrabold text-[#1C1917] flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#6E1F2A]" /> Form Theme & Visual Styling
            </h2>
            <p className="text-xs text-[#78716C] font-medium">
              Choose a visual palette for your conversational respondent experience. Themes update live across published & preview forms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {AVAILABLE_THEMES.map((theme) => {
              const isSelected = form.theme_id === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={async () => {
                    updateFormLocal((prev) => ({ ...prev, theme_id: theme.id }));
                    setSaveStatus("saving");
                    try {
                      await api.updateForm(form.id, { theme_id: theme.id });
                      setSaveStatus("saved");
                      success(`Applied "${theme.name}" theme.`);
                    } catch (err) {
                      setSaveStatus("error");
                    }
                  }}
                  className={`crayon-card p-5 cursor-pointer transition-all border-2 relative ${
                    isSelected ? "border-[#6E1F2A] shadow-md ring-2 ring-[#F0C9CD]" : "border-[#E6DFD5] hover:border-[#6E1F2A]"
                  }`}
                  style={{ backgroundColor: theme.background, color: theme.text }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-extrabold">{theme.name}</span>
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-[#6E1F2A] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="p-3.5 rounded-2xl space-y-2 border border-black/10" style={{ backgroundColor: theme.surface }}>
                    <div className="h-3 rounded-full w-3/4 shadow-xs" style={{ backgroundColor: theme.accent }} />
                    <div className="h-2 rounded-full w-1/2 opacity-60" style={{ backgroundColor: theme.text }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Embedded Responses Tab */}
      {activeTab === "responses" && (
        <div className="flex-1 bg-[#FCFBF8] p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#191716] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#6E1F2A]" /> Submissions & Responses
                </h2>
                <p className="text-xs text-[#6F6A67]">View, search, and export respondent submission entries.</p>
              </div>
              <Button variant="primary" size="sm" onClick={handleExportCSV} leftIcon={<Download className="w-4 h-4" />}>
                Export CSV
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white border border-[#E7E2DE] p-5 rounded-2xl shadow-subtle">
                <span className="text-xs font-semibold text-[#6F6A67] uppercase">Total Responses</span>
                <p className="text-3xl font-extrabold text-[#191716] mt-1">{totalResponses}</p>
              </div>
              <div className="bg-white border border-[#E7E2DE] p-5 rounded-2xl shadow-subtle">
                <span className="text-xs font-semibold text-[#6F6A67] uppercase">Completion Rate</span>
                <p className="text-3xl font-extrabold text-[#2F7D5B] mt-1">100%</p>
              </div>
              <div className="bg-white border border-[#E7E2DE] p-5 rounded-2xl shadow-subtle">
                <span className="text-xs font-semibold text-[#6F6A67] uppercase">Avg Completion Time</span>
                <p className="text-3xl font-extrabold text-[#191716] mt-1">
                  {responses.length > 0
                    ? `${Math.round(
                        responses.reduce((acc, r) => acc + (r.completion_time_seconds || 0), 0) / responses.length
                      )}s`
                    : "0s"}
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#E7E2DE] rounded-2xl shadow-subtle overflow-hidden">
              <div className="p-4 border-b border-[#E7E2DE] flex items-center justify-between gap-4">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#6F6A67] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search responses..."
                    value={respSearch}
                    onChange={(e) => setRespSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F5F2EF] border border-[#E7E2DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6E1F2A]"
                  />
                </div>
                <span className="text-xs font-semibold text-[#6F6A67]">Showing {responses.length} of {totalResponses}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FCFBF8] border-b border-[#E7E2DE] uppercase text-[#6F6A67] font-semibold">
                    <tr>
                      <th className="px-6 py-3">Submission ID</th>
                      <th className="px-6 py-3">Respondent Token</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Time</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E2DE]">
                    {respLoading ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#6F6A67] animate-pulse">
                          Loading submission records...
                        </td>
                      </tr>
                    ) : responses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[#6F6A67]">
                          No responses recorded yet for this form.
                        </td>
                      </tr>
                    ) : (
                      responses.map((r) => (
                        <tr key={r.id} className="hover:bg-[#F5F2EF]/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-[#6E1F2A]">{r.id.substring(0, 8)}...</td>
                          <td className="px-6 py-4 font-mono text-[#191716]">{r.respondent_token}</td>
                          <td className="px-6 py-4 text-[#6F6A67]">
                            {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "N/A"}
                          </td>
                          <td className="px-6 py-4 text-[#191716] font-semibold">{r.completion_time_seconds || 0}s</td>
                          <td className="px-6 py-4">
                            <Badge variant="published">{r.status}</Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/responses/${form.id}/${r.id}`)}
                              leftIcon={<Eye className="w-3.5 h-3.5" />}
                            >
                              Inspect
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-[#E7E2DE] bg-[#FCFBF8] flex items-center justify-between text-xs">
                <span className="text-[#6F6A67]">Page {respPage} of {totalPages}</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={respPage <= 1} onClick={() => setRespPage(respPage - 1)}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={respPage >= totalPages} onClick={() => setRespPage(respPage + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Embedded Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="flex-1 bg-[#FCFBF8] p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#191716] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#6E1F2A]" /> Performance & Analytics
              </h2>
              <p className="text-xs text-[#6F6A67]">Analyze conversion funnels, completion rates, and question dropoffs.</p>
            </div>

            {analyticsLoading || !analytics ? (
              <div className="py-16 text-center text-[#6F6A67] animate-pulse">Loading analytics dashboard...</div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                  <div className="bg-white border border-[#E7E2DE] p-5 rounded-2xl shadow-subtle">
                    <span className="text-xs font-semibold text-[#6F6A67] uppercase">Total Views</span>
                    <p className="text-3xl font-extrabold text-[#191716] mt-1">{analytics.total_views || 0}</p>
                  </div>
                  <div className="bg-white border border-[#E7E2DE] p-5 rounded-2xl shadow-subtle">
                    <span className="text-xs font-semibold text-[#6F6A67] uppercase">Submissions</span>
                    <p className="text-3xl font-extrabold text-[#191716] mt-1">{analytics.total_submissions || 0}</p>
                  </div>
                  <div className="bg-white border border-[#E7E2DE] p-5 rounded-2xl shadow-subtle">
                    <span className="text-xs font-semibold text-[#6F6A67] uppercase">Completion Rate</span>
                    <p className="text-3xl font-extrabold text-[#2F7D5B] mt-1">
                      {analytics.completion_rate ? `${analytics.completion_rate.toFixed(1)}%` : "100%"}
                    </p>
                  </div>
                  <div className="bg-white border border-[#E7E2DE] p-5 rounded-2xl shadow-subtle">
                    <span className="text-xs font-semibold text-[#6F6A67] uppercase">Avg Time</span>
                    <p className="text-3xl font-extrabold text-[#41658A] mt-1">
                      {analytics.avg_completion_time_seconds ? `${Math.round(analytics.avg_completion_time_seconds)}s` : "0s"}
                    </p>
                  </div>
                </div>

                <div className="bg-[#191716] border border-[#E7E2DE] rounded-2xl p-6 shadow-subtle space-y-4 text-white">
                  <h3 className="text-sm font-bold border-b border-white/10 pb-3">Question Dropoff Breakdown</h3>
                  <div className="space-y-4">
                    {(analytics.question_analytics || []).map((qa: any, idx: number) => (
                      <div key={qa.question_id || idx} className="space-y-1.5 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span className="truncate">{qa.question_title}</span>
                          <span className="opacity-70">{qa.responses_count} answers</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#6E1F2A] rounded-full transition-all duration-300"
                            style={{
                              width: `${
                                analytics.total_submissions > 0
                                  ? Math.min(100, Math.round((qa.responses_count / analytics.total_submissions) * 100))
                                  : 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Live Preview Mode */}
      {activeTab === "preview" && (
        <div className="flex-1 bg-[#191716]/90 p-4 sm:p-8 flex flex-col items-center justify-center overflow-hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-full flex flex-col overflow-hidden">
            <div className="bg-[#F5F2EF] px-4 py-2 border-b border-[#E7E2DE] flex items-center justify-between text-xs text-[#6F6A67]">
              <span>Preview Mode — Simulated Respondent View</span>
              <Button variant="outline" size="sm" onClick={handleExitPreview}>
                Exit Preview
              </Button>
            </div>
            <iframe key={`${form.theme_id}`} src={`/f/${form.slug}?theme=${form.theme_id}`} className="w-full flex-1 border-none" />
          </div>
        </div>
      )}

      {/* Command Palette Modal */}
      <CommandPaletteModal
        onAddQuestion={handleAddQuestion}
        onDuplicateQuestion={() => activeQuestion && handleDuplicateQuestion(activeQuestion)}
        onDeleteQuestion={() => activeQuestionId && handleDeleteQuestion(activeQuestionId)}
        onTogglePreview={() => handleTabChange(activeTab === "preview" ? previousTabRef.current : "preview")}
        onOpenShare={() => toggleShareModal(true)}
        onPublish={handlePublish}
        onOpenTheme={() => handleTabChange("theme")}
      />

      {/* Form Health Modal */}
      <FormHealthModal
        onSelectIssueQuestion={(id) => {
          setActiveQuestionId(id);
          handleTabChange("builder");
        }}
        onPublishClick={handlePublish}
      />

      {/* Share Center Modal */}
      <ShareCenterModal />
    </div>
  );
}
