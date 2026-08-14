"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { useAuthStore } from "../../stores/auth-store";
import { api } from "../../lib/api-client";
import { Form } from "../../types";
import { useToast } from "../../components/ui/toast";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, MoreVertical, Edit3, Eye, BarChart3, MessageSquare,
  Copy, Trash2, Sparkles, FileText, ExternalLink, Loader2, Layers, Check, X, ArrowUpRight
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

  // Instant action loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

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
      const statusFilter = activeTab === "all" ? "" : activeTab;
      const data = await api.getForms(1, 20, "", statusFilter);
      const formList: Form[] = Array.isArray(data) ? data : ((data as any)?.forms || []);
      setForms(formList);
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

  const prefetchRoute = (path: string) => {
    router.prefetch(path);
  };

  const handleCreateBlank = async () => {
    try {
      setIsCreating(true);
      const newForm = await api.createForm({
        title: "Untitled Form",
        description: "Add your questions here.",
        questions: [
          {
            type: "short_text",
            title: "What is your full name?",
            required: true,
            position: 0
          }
        ]
      });
      success("New form created!");
      router.push(`/builder/${newForm.id}`);
    } catch (err: any) {
      toastError("Could not create form.");
      setIsCreating(false);
    }
  };

  const handleDuplicate = async (form: Form) => {
    try {
      const duplicated = await api.duplicateForm(form.id);
      success(`Duplicated as "${duplicated.title}"`);
      loadForms();
    } catch (err) {
      toastError("Failed to duplicate form.");
    } finally {
      setActiveMenuId(null);
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameForm || !newTitle.trim()) return;

    try {
      setIsRenaming(true);
      await api.updateForm(renameForm.id, { title: newTitle.trim() });
      success("Form renamed!");
      setRenameForm(null);
      loadForms();
    } catch (err) {
      toastError("Failed to rename form.");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      await api.deleteForm(deleteTarget.id);
      success("Form moved to trash.");
      setDeleteTarget(null);
      loadForms();
    } catch (err) {
      toastError("Failed to delete form.");
    } finally {
      setIsDeleting(false);
    }
  };

  const copyFormLink = (slug: string) => {
    const publicUrl = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(publicUrl);
    success("Public form link copied to clipboard!");
    setActiveMenuId(null);
  };

  const filteredForms = forms.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  const publishedCount = forms.filter((f) => f.status === "published").length;
  const draftCount = forms.filter((f) => f.status === "draft").length;
  const archivedCount = forms.filter((f) => f.status === "archived").length;

  return (
    <div className="min-h-screen flex flex-col bg-crayon-paper text-[#1C1917]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        {/* 1. WORKSPACE HEADER BANNER */}
        <div className="crayon-card bg-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9EFEF] border border-[#F0C9CD] text-xs font-extrabold text-[#6E1F2A]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Workspace Studio</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight">
              {user ? `${user.workspace_name || user.name}'s Forms` : "Workspace Dashboard"}
            </h1>
            <p className="text-sm text-[#78716C] font-medium max-w-xl">
              Create, customize, and analyze conversational forms that capture maximum respondent engagement.
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-extrabold">
              <span className="px-3 py-1.5 rounded-xl bg-[#F6F3ED] border border-[#E6DFD5] text-[#1C1917]">
                Total Forms: <strong className="text-[#6E1F2A]">{forms.length}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[#E6F4EA] border border-[#34D399] text-[#059669]">
                Published: <strong>{publishedCount}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[#FEF3C7] border border-[#FBBF24] text-[#D97706]">
                Drafts: <strong>{draftCount}</strong>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="crayon-button bg-[#6E1F2A] hover:bg-[#541720] text-white text-xs font-extrabold px-6 py-3 rounded-2xl shadow-sm"
              isLoading={isCreating}
              onClick={handleCreateBlank}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Blank Form
            </Button>
            <Link href="/ai-generator">
              <Button
                variant="outline"
                size="lg"
                className="crayon-button bg-[#F9EFEF] text-[#6E1F2A] border-[#F0C9CD] hover:bg-[#F0C9CD] text-xs font-extrabold px-5 py-3 rounded-2xl"
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                AI Generator
              </Button>
            </Link>
            <Link href="/templates">
              <Button
                variant="outline"
                size="lg"
                className="crayon-button bg-white text-[#1C1917] hover:bg-[#F6F3ED] text-xs font-bold px-5 py-3 rounded-2xl"
                leftIcon={<FileText className="w-4 h-4" />}
              >
                Templates
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. SEARCH BAR & STATUS FILTER TABS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border-2 border-[#E6DFD5] shadow-xs overflow-x-auto no-scrollbar">
            {(["all", "published", "draft", "archived"] as const).map((tab) => {
              const count =
                tab === "all"
                  ? forms.length
                  : tab === "published"
                  ? publishedCount
                  : tab === "draft"
                  ? draftCount
                  : archivedCount;

              const isSelected = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold capitalize transition-all flex items-center gap-2 whitespace-nowrap ${
                    isSelected
                      ? "bg-[#6E1F2A] text-white shadow-sm"
                      : "text-[#78716C] hover:text-[#1C1917] hover:bg-[#F6F3ED]"
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      isSelected ? "bg-white/20 text-white" : "bg-[#F6F3ED] text-[#78716C]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]" />
            <input
              type="text"
              placeholder="Search forms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-white border-2 border-[#E6DFD5] rounded-2xl text-xs font-semibold placeholder:text-[#78716C]/60 focus:outline-none focus:border-[#6E1F2A] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 3. FORM CARDS GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-56 bg-[#F6F3ED] rounded-3xl border-2 border-[#E6DFD5] animate-pulse" />
            ))}
          </div>
        ) : filteredForms.length === 0 ? (
          /* Empty State */
          <div className="crayon-card bg-white p-12 text-center space-y-4 max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-3xl bg-[#F9EFEF] text-[#6E1F2A] flex items-center justify-center mx-auto border-2 border-[#F0C9CD]">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-[#1C1917]">No forms found</h3>
            <p className="text-xs text-[#78716C] font-medium leading-relaxed">
              {search
                ? `No forms match your search query "${search}". Try clearing your search filter.`
                : "You don't have any forms under this status tab yet."}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              {search ? (
                <Button size="sm" variant="outline" onClick={() => setSearch("")}>
                  Clear Search Filter
                </Button>
              ) : (
                <Button size="sm" className="bg-[#6E1F2A] text-white" onClick={handleCreateBlank}>
                  Create Blank Form
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => {
              const isMenuOpen = activeMenuId === form.id;

              return (
                <motion.div
                  key={form.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="crayon-card crayon-card-brand p-6 flex flex-col justify-between relative group"
                >
                  {/* Card Header & Status Badge */}
                  <div>
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <Badge
                        variant={
                          form.status === "published"
                            ? "published"
                            : form.status === "draft"
                            ? "draft"
                            : "archived"
                        }
                      >
                        {form.status}
                      </Badge>

                      {/* Card Action Menu Toggle */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : form.id);
                          }}
                          className="p-1.5 rounded-xl border border-[#E6DFD5] bg-white text-[#78716C] hover:text-[#1C1917] hover:border-[#6E1F2A] transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Action Dropdown Menu */}
                        {isMenuOpen && (
                          <div
                            className="absolute right-0 mt-2 w-48 bg-white border-2 border-[#E6DFD5] rounded-2xl shadow-xl py-1.5 z-40 text-xs font-bold text-[#1C1917]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                router.push(`/builder/${form.id}`);
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-[#F6F3ED] transition-colors"
                            >
                              <Edit3 className="w-4 h-4 text-[#6E1F2A]" /> Edit in Builder
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                router.push(`/f/${form.slug}`);
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-[#F6F3ED] transition-colors"
                            >
                              <Eye className="w-4 h-4 text-[#6E1F2A]" /> Preview Mode
                            </button>
                            <button
                              onClick={() => copyFormLink(form.slug)}
                              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-[#F6F3ED] transition-colors"
                            >
                              <Copy className="w-4 h-4 text-[#6E1F2A]" /> Copy Public Link
                            </button>
                            <button
                              onClick={() => handleDuplicate(form)}
                              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-[#F6F3ED] transition-colors"
                            >
                              <Layers className="w-4 h-4 text-[#6E1F2A]" /> Duplicate Form
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setRenameForm(form);
                                setNewTitle(form.title);
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-[#F6F3ED] transition-colors"
                            >
                              <Edit3 className="w-4 h-4 text-[#6E1F2A]" /> Rename Title
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setDeleteTarget(form);
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-[#B54747] hover:bg-[#F9EFEF] transition-colors border-t border-[#E6DFD5]"
                            >
                              <Trash2 className="w-4 h-4" /> Move to Trash
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <Link
                      href={`/builder/${form.id}`}
                      onMouseEnter={() => prefetchRoute(`/builder/${form.id}`)}
                      className="block group-hover:text-[#6E1F2A] transition-colors"
                    >
                      <h3 className="text-lg font-extrabold text-[#1C1917] line-clamp-1">
                        {form.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-[#78716C] mt-1 line-clamp-2 font-medium">
                      {form.description || "No description provided."}
                    </p>
                  </div>

                  {/* Card Bottom Meta Footer */}
                  <div className="mt-6 pt-4 border-t border-[#E6DFD5] flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-3 text-[#78716C]">
                      <span className="flex items-center gap-1 font-bold text-[#1C1917]">
                        <MessageSquare className="w-3.5 h-3.5 text-[#6E1F2A]" />
                        {form.question_count || 0} Qs
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-bold text-[#059669]">
                        <BarChart3 className="w-3.5 h-3.5" />
                        {form.response_count || 0} Responses
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white hover:bg-[#6E1F2A] hover:text-white hover:border-[#6E1F2A] text-xs font-bold transition-all rounded-xl"
                      onClick={() => router.push(`/builder/${form.id}`)}
                      rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                    >
                      Open
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* RENAME MODAL */}
      {renameForm && (
        <Dialog isOpen={!!renameForm} onClose={() => setRenameForm(null)} title="Rename Form">
          <form onSubmit={handleRenameSubmit} className="space-y-4 pt-2">
            <Input
              label="New Form Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Q3 Customer Satisfaction Survey"
              required
              autoFocus
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setRenameForm(null)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isRenaming} className="bg-[#6E1F2A] text-white font-bold">
                Save Changes
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <Dialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Form">
          <div className="space-y-4 pt-2 text-xs text-[#78716C]">
            <p className="font-medium text-sm text-[#1C1917]">
              Are you sure you want to delete <strong className="text-[#6E1F2A]">"{deleteTarget.title}"</strong>?
            </p>
            <p>This action will move the form to trash and hide public response submissions.</p>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                isLoading={isDeleting}
                onClick={handleDeleteSubmit}
                className="bg-[#B54747] hover:bg-[#963737] text-white font-bold"
              >
                Delete Form
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
