"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { useAuthStore } from "../../stores/auth-store";
import { api, ApiError } from "../../lib/api-client";
import { Form, FormStatus } from "../../types";
import { useToast } from "../../components/ui/toast";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import {
  Plus, Search, MoreVertical, Edit3, Eye, BarChart3, MessageSquare,
  Copy, Share2, Archive, Trash2, Sparkles, FileText, Calendar, ExternalLink
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, fetchUser, isLoading: authLoading } = useAuthStore();
  const { success, error: toastError } = useToast();

  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "draft" | "published" | "archived">("all");
  const [search, setSearch] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Rename modal
  const [renameForm, setRenameForm] = useState<Form | null>(null);
  const [newTitle, setNewTitle] = useState("");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Form | null>(null);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const loadForms = async () => {
    try {
      setLoading(true);
      const data = await api.getForms(activeTab === "all" ? undefined : activeTab);
      setForms(data);
    } catch (err: any) {
      toastError("Failed to load workspace forms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadForms();
    }
  }, [user, activeTab]);

  const handleCreateBlank = async () => {
    try {
      const newForm = await api.createForm({
        title: "Untitled Form",
        description: "Add your questions here.",
        questions: [
          {
            type: "short_text",
            title: "What is your name?",
            required: true,
            position: 0
          }
        ]
      });
      success("New form created!");
      router.push(`/builder/${newForm.id}`);
    } catch (err: any) {
      toastError("Could not create form.");
    }
  };

  const handleDuplicate = async (form: Form) => {
    try {
      const duplicated = await api.duplicateForm(form.id);
      success(`Duplicated as "${duplicated.title}"`);
      loadForms();
    } catch (err) {
      toastError("Failed to duplicate form.");
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameForm) return;
    try {
      await api.updateForm(renameForm.id, { title: newTitle });
      success("Form renamed!");
      setRenameForm(null);
      loadForms();
    } catch (err) {
      toastError("Failed to rename form.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteForm(deleteTarget.id);
      success("Form deleted permanently.");
      setDeleteTarget(null);
      loadForms();
    } catch (err) {
      toastError("Failed to delete form.");
    }
  };

  const filteredForms = forms.filter((f) =>
    f.title.toLowerCase().includes(search.toLowerCase()) ||
    (f.description && f.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF8]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191716] tracking-tight">Forms Dashboard</h1>
            <p className="text-xs text-[#6F6A67] mt-1">
              Manage your conversational forms, live published links, and submission analytics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/templates">
              <Button variant="outline" size="sm" leftIcon={<FileText className="w-4 h-4" />}>
                Templates
              </Button>
            </Link>
            <Link href="/ai-generator">
              <Button variant="secondary" size="sm" leftIcon={<Sparkles className="w-4 h-4 text-[#6E1F2A]" />}>
                Generate with AI
              </Button>
            </Link>
            <Button variant="primary" size="sm" onClick={handleCreateBlank} leftIcon={<Plus className="w-4 h-4" />}>
              Create Form
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[#E7E2DE] mb-6">
          <div className="flex items-center gap-1 bg-[#F5F2EF] p-1 rounded-xl w-full sm:w-auto">
            {(["all", "draft", "published", "archived"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? "bg-white text-[#191716] shadow-subtle"
                    : "text-[#6F6A67] hover:text-[#191716]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#6F6A67] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search forms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E7E2DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6E1F2A]"
            />
          </div>
        </div>

        {/* Forms list / empty state */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 bg-[#F5F2EF] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-[#E7E2DE] rounded-2xl bg-white p-8">
            <div className="w-12 h-12 rounded-2xl bg-[#F7EEF0] text-[#6E1F2A] flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#191716]">No forms found</h3>
            <p className="text-xs text-[#6F6A67] mt-1 max-w-sm mx-auto">
              {search
                ? `No forms matching "${search}"`
                : "Get started by creating a blank form, choosing a template, or generating one with AI."}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button variant="primary" size="sm" onClick={handleCreateBlank} leftIcon={<Plus className="w-4 h-4" />}>
                Create Form
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <div
                key={form.id}
                className="group relative bg-white border border-[#E7E2DE] hover:border-[#6E1F2A]/40 rounded-2xl p-5 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge variant={form.status as any}>{form.status}</Badge>

                    {/* Actions Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === form.id ? null : form.id)}
                        className="p-1 rounded-lg text-[#6F6A67] hover:text-[#191716] hover:bg-[#F5F2EF] transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === form.id && (
                        <div
                          className="absolute right-0 mt-1 w-48 bg-white border border-[#E7E2DE] rounded-xl shadow-modal py-1 z-30"
                          onMouseLeave={() => setActiveMenuId(null)}
                        >
                          <Link
                            href={`/builder/${form.id}`}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#191716] hover:bg-[#F5F2EF]"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#6F6A67]" /> Edit Builder
                          </Link>
                          <Link
                            href={`/preview/${form.id}`}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#191716] hover:bg-[#F5F2EF]"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#6F6A67]" /> Preview
                          </Link>
                          <Link
                            href={`/responses/${form.id}`}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#191716] hover:bg-[#F5F2EF]"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-[#6F6A67]" /> Responses
                          </Link>
                          <Link
                            href={`/analytics/${form.id}`}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#191716] hover:bg-[#F5F2EF]"
                          >
                            <BarChart3 className="w-3.5 h-3.5 text-[#6F6A67]" /> Analytics
                          </Link>

                          <div className="my-1 border-t border-[#E7E2DE]" />

                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              handleDuplicate(form);
                            }}
                            className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#191716] hover:bg-[#F5F2EF]"
                          >
                            <Copy className="w-3.5 h-3.5 text-[#6F6A67]" /> Duplicate
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              setRenameForm(form);
                              setNewTitle(form.title);
                            }}
                            className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#191716] hover:bg-[#F5F2EF]"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#6F6A67]" /> Rename
                          </button>

                          {form.status === "published" && (
                            <a
                              href={`/f/${form.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#6E1F2A] hover:bg-[#F7EEF0]"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Public Link
                            </a>
                          )}

                          <div className="my-1 border-t border-[#E7E2DE]" />

                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              setDeleteTarget(form);
                            }}
                            className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#B54747] hover:bg-[#F7EEF0]"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <Link href={`/builder/${form.id}`}>
                    <h3 className="text-base font-bold text-[#191716] group-hover:text-[#6E1F2A] transition-colors truncate">
                      {form.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-[#6F6A67] mt-1 line-clamp-2 min-h-[32px]">
                    {form.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E7E2DE] flex items-center justify-between text-xs text-[#6F6A67]">
                  <div className="flex items-center gap-3">
                    <span>{form.question_count || 0} questions</span>
                    <span>•</span>
                    <span className="font-semibold text-[#191716]">{form.response_count || 0} responses</span>
                  </div>

                  <Link
                    href={`/builder/${form.id}`}
                    className="font-semibold text-[#6E1F2A] hover:underline flex items-center gap-1"
                  >
                    Build →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Rename Dialog */}
      <Dialog isOpen={!!renameForm} onClose={() => setRenameForm(null)} title="Rename Form">
        <form onSubmit={handleRenameSubmit} className="space-y-4">
          <Input label="Form Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setRenameForm(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Title
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Form">
        <p className="text-xs text-[#6F6A67] mb-4">
          Delete <span className="font-bold text-[#191716]">&quot;{deleteTarget?.title}&quot;</span>? This will permanently delete the form, all version snapshots, and its submitted responses. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteConfirm}>
            Delete Permanently
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
