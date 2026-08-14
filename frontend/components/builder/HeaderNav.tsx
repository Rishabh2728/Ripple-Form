"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Form } from "../../types";
import { SaveStatus, useBuilderStore } from "../../stores/builder-store";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  ArrowLeft, Check, Loader2, Eye, Share2, Send, Activity, Undo, Redo, Command
} from "lucide-react";

export const HeaderNav: React.FC<{
  form: Form;
  activeTab: "builder" | "preview" | "theme" | "share" | "responses" | "analytics";
  setActiveTab: (tab: "builder" | "preview" | "theme" | "share" | "responses" | "analytics") => void;
  saveStatus: SaveStatus;
  onTitleChange: (newTitle: string) => void;
  onRetrySave: () => void;
  onPublishClick: () => void;
  onUnpublishClick: () => void;
}> = ({
  form,
  activeTab,
  setActiveTab,
  saveStatus,
  onTitleChange,
  onRetrySave,
  onPublishClick,
  onUnpublishClick,
}) => {
  const { undo, redo, past, future, toggleCommandPalette, toggleHealthModal, toggleShareModal } = useBuilderStore();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(form.title);

  const handleTitleSubmit = () => {
    setEditingTitle(false);
    if (titleText.trim() && titleText !== form.title) {
      onTitleChange(titleText.trim());
    }
  };

  return (
    <header className="border-b border-[#E7E2DE] bg-white px-3 sm:px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2 z-30 shrink-0">
      {/* Top / Left section */}
      <div className="flex items-center justify-between md:justify-start gap-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-lg text-[#6F6A67] hover:text-[#191716] hover:bg-[#F5F2EF] transition-colors shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {editingTitle ? (
            <input
              autoFocus
              type="text"
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
              className="text-xs sm:text-sm font-bold text-[#191716] bg-[#F5F2EF] px-2 py-0.5 rounded border border-[#6E1F2A] focus:outline-none"
            />
          ) : (
            <h2
              onClick={() => setEditingTitle(true)}
              className="text-xs sm:text-sm font-bold text-[#191716] truncate max-w-[140px] sm:max-w-[200px] cursor-pointer hover:text-[#6E1F2A] transition-colors"
              title="Click to rename form"
            >
              {form.title}
            </h2>
          )}

          <Badge variant={form.status as any}>{form.status}</Badge>

          {/* Autosave status indicator */}
          <div className="flex items-center gap-1 text-[11px] font-medium text-[#6F6A67]">
            {saveStatus === "saving" && (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-[#6E1F2A]" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check className="w-3 h-3 text-[#2F7D5B]" />
                <span className="text-[#2F7D5B] hidden sm:inline">Saved</span>
              </>
            )}
            {saveStatus === "error" && (
              <button onClick={onRetrySave} className="text-[#B54747] font-semibold hover:underline">
                Retry
              </button>
            )}
          </div>
        </div>

        {/* Mobile quick actions */}
        <div className="flex items-center gap-1 md:hidden">
          <Button
            variant="primary"
            size="sm"
            onClick={onPublishClick}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Publish
          </Button>
        </div>
      </div>

      {/* Center Tabs (Always visible & clean responsive) */}
      <nav className="flex items-center justify-center gap-1 bg-[#F5F2EF] p-1 rounded-xl no-scrollbar max-w-full overflow-hidden">
        {(["builder", "theme", "responses", "analytics"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
              activeTab === tab
                ? "bg-white text-[#191716] shadow-subtle"
                : "text-[#6F6A67] hover:text-[#191716]"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Right Action buttons */}
      <div className="hidden md:flex items-center gap-2">
        {/* History triggers */}
        <div className="flex items-center gap-1 mr-1">
          <button
            onClick={undo}
            disabled={past.length === 0}
            className="p-1.5 rounded-lg text-[#6F6A67] hover:text-[#191716] hover:bg-[#F5F2EF] disabled:opacity-40"
            title="Undo (Cmd+Z)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="p-1.5 rounded-lg text-[#6F6A67] hover:text-[#191716] hover:bg-[#F5F2EF] disabled:opacity-40"
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Shortcuts Command Palette button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleCommandPalette(true)}
          leftIcon={<Command className="w-3.5 h-3.5 text-[#6E1F2A]" />}
          title="Command Palette & Shortcuts (Ctrl + K)"
        >
          Shortcuts
        </Button>

        {/* Form Health button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleHealthModal(true)}
          leftIcon={<Activity className="w-3.5 h-3.5 text-[#6E1F2A]" />}
        >
          Health
        </Button>

        {/* Preview toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveTab(activeTab === "preview" ? "builder" : "preview")}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          {activeTab === "preview" ? "Edit" : "Preview"}
        </Button>

        {/* Share */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => toggleShareModal(true)}
          leftIcon={<Share2 className="w-3.5 h-3.5 text-[#6E1F2A]" />}
        >
          Share
        </Button>

        {/* Publish */}
        {form.status === "published" ? (
          <Button variant="outline" size="sm" onClick={onUnpublishClick}>
            Unpublish
          </Button>
        ) : (
          <Button variant="primary" size="sm" onClick={onPublishClick} leftIcon={<Send className="w-3.5 h-3.5" />}>
            Publish
          </Button>
        )}
      </div>
    </header>
  );
};
