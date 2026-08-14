"use client";

import React, { useEffect, useState } from "react";
import { useBuilderStore } from "../stores/builder-store";
import {
  Search, Plus, Copy, Trash2, ArrowUp, ArrowDown, Eye,
  Share2, Send, Palette, Undo, Redo
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const CommandPaletteModal: React.FC<{
  onAddQuestion?: () => void;
  onDuplicateQuestion?: () => void;
  onDeleteQuestion?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onTogglePreview?: () => void;
  onOpenShare?: () => void;
  onPublish?: () => void;
  onOpenTheme?: () => void;
}> = ({
  onAddQuestion,
  onDuplicateQuestion,
  onDeleteQuestion,
  onMoveUp,
  onMoveDown,
  onTogglePreview,
  onOpenShare,
  onPublish,
  onOpenTheme,
}) => {
  const { isCommandPaletteOpen, toggleCommandPalette, undo, redo } = useBuilderStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleCommandPalette();
      } else if (e.key === "Escape" && isCommandPaletteOpen) {
        e.preventDefault();
        toggleCommandPalette(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, toggleCommandPalette]);

  if (!isCommandPaletteOpen) return null;

  const commands = [
    { id: "add", label: "Add Question", icon: Plus, action: onAddQuestion },
    { id: "duplicate", label: "Duplicate Active Question", icon: Copy, action: onDuplicateQuestion },
    { id: "delete", label: "Delete Active Question", icon: Trash2, action: onDeleteQuestion },
    { id: "move-up", label: "Move Question Up", icon: ArrowUp, action: onMoveUp },
    { id: "move-down", label: "Move Question Down", icon: ArrowDown, action: onMoveDown },
    { id: "preview", label: "Toggle Live Preview", icon: Eye, action: onTogglePreview },
    { id: "share", label: "Share Form Link", icon: Share2, action: onOpenShare },
    { id: "publish", label: "Publish Form", icon: Send, action: onPublish },
    { id: "theme", label: "Theme Editor", icon: Palette, action: onOpenTheme },
    { id: "undo", label: "Undo Change (Cmd+Z)", icon: Undo, action: undo },
    { id: "redo", label: "Redo Change (Cmd+Shift+Z)", icon: Redo, action: redo },
  ];

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (cmd: typeof commands[0]) => {
    toggleCommandPalette(false);
    if (cmd.action) {
      cmd.action();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => toggleCommandPalette(false)}
          className="fixed inset-0 bg-[#191716]/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="relative w-full max-w-xl bg-white rounded-xl shadow-modal border border-[#E7E2DE] overflow-hidden z-10"
        >
          <div className="flex items-center px-4 border-b border-[#E7E2DE] bg-[#FCFBF8]">
            <Search className="w-4 h-4 text-[#6F6A67] mr-2 shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Type a command or search actions... (Cmd+K)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full py-3 text-sm bg-transparent border-none focus:outline-none placeholder:text-[#6F6A67]/60 text-[#191716]"
            />
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-[#6F6A67] bg-[#F5F2EF] rounded border border-[#E7E2DE]">
              ESC
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#6F6A67]">No commands matching &quot;{query}&quot;</div>
            ) : (
              filtered.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-medium text-[#191716] hover:bg-[#F5F2EF] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-[#6F6A67] group-hover:text-[#6E1F2A] transition-colors" />
                      <span>{cmd.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#6F6A67] group-hover:text-[#191716]">Execute →</span>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
