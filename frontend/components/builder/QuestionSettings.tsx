"use client";

import React from "react";
import { Question, QuestionType, QuestionOption } from "../../types";
import { Input } from "../ui/input";
import { Plus, Trash2, Settings, ListPlus, ShieldCheck } from "lucide-react";

export const QUESTION_TYPES: { type: QuestionType; label: string }[] = [
  { type: "short_text", label: "Short Text" },
  { type: "long_text", label: "Long Text" },
  { type: "multiple_choice", label: "Multiple Choice" },
  { type: "dropdown", label: "Dropdown Select" },
  { type: "email", label: "Email Address" },
  { type: "number", label: "Number Input" },
  { type: "yes_no", label: "Yes / No" },
  { type: "rating", label: "Rating Stars (1-5)" },
  { type: "nps", label: "Net Promoter Score (0-10)" },
];

export const QuestionSettings: React.FC<{
  question: Question | null;
  onUpdateQuestion: (updated: Partial<Question>) => void;
}> = ({ question, onUpdateQuestion }) => {
  if (!question) {
    return (
      <div className="w-full md:w-72 border-l border-[#E7E2DE] bg-[#FCFBF8] p-4 text-xs text-[#6F6A67] text-center">
        Select a question to inspect settings.
      </div>
    );
  }

  const handleAddOption = () => {
    const currentOpts = question.options || [];
    const newIdx = currentOpts.length;
    const newOpt: QuestionOption = {
      label: `Option ${newIdx + 1}`,
      value: `option_${newIdx + 1}`,
      position: newIdx,
    };
    onUpdateQuestion({ options: [...currentOpts, newOpt] });
  };

  const handleOptionChange = (idx: number, label: string) => {
    const currentOpts = [...(question.options || [])];
    const val = label.toLowerCase().replace(/\s+/g, "_");
    currentOpts[idx] = { ...currentOpts[idx], label, value: val };
    onUpdateQuestion({ options: currentOpts });
  };

  const handleRemoveOption = (idx: number) => {
    const currentOpts = [...(question.options || [])];
    currentOpts.splice(idx, 1);
    onUpdateQuestion({ options: currentOpts });
  };

  const handleSettingsChange = (key: string, value: any) => {
    const currentSettings = { ...(question.settings_json || {}) };
    if (value === "" || value === null || isNaN(value) && typeof value === "number") {
      delete (currentSettings as any)[key];
    } else {
      (currentSettings as any)[key] = value;
    }
    onUpdateQuestion({ settings_json: currentSettings });
  };

  return (
    <div className="w-full md:w-72 border-l border-[#E7E2DE] bg-[#FCFBF8] flex flex-col h-full overflow-y-auto p-4 space-y-6">
      <div className="flex items-center gap-2 pb-3 border-b border-[#E7E2DE]">
        <Settings className="w-4 h-4 text-[#6E1F2A]" />
        <span className="text-xs font-bold text-[#191716] uppercase tracking-wider">Question Settings</span>
      </div>

      {/* Type Picker */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#191716] uppercase">Question Type</label>
        <select
          value={question.type}
          onChange={(e) => onUpdateQuestion({ type: e.target.value as QuestionType })}
          className="w-full px-3 py-2 text-xs bg-white border border-[#E7E2DE] rounded-lg font-medium text-[#191716] focus:outline-none focus:ring-2 focus:ring-[#6E1F2A]"
        >
          {QUESTION_TYPES.map((t) => (
            <option key={t.type} value={t.type}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Required Toggle */}
      <div className="flex items-center justify-between p-3 bg-white border border-[#E7E2DE] rounded-xl">
        <span className="text-xs font-semibold text-[#191716]">Required Question</span>
        <input
          type="checkbox"
          checked={question.required}
          onChange={(e) => onUpdateQuestion({ required: e.target.checked })}
          className="w-4 h-4 accent-[#6E1F2A] rounded cursor-pointer"
        />
      </div>

      {/* Choice Options Manager */}
      {(question.type === "multiple_choice" || question.type === "dropdown") && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#191716] uppercase flex items-center gap-1.5">
              <ListPlus className="w-3.5 h-3.5 text-[#6E1F2A]" /> Choices
            </span>
            <button
              onClick={handleAddOption}
              className="text-xs font-bold text-[#6E1F2A] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Choice
            </button>
          </div>

          <div className="space-y-2">
            {(question.options || []).map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#6F6A67] w-4">{idx + 1}.</span>
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Choice ${idx + 1}`}
                  className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-[#E7E2DE] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6E1F2A]"
                />
                <button
                  onClick={() => handleRemoveOption(idx)}
                  className="p-1 text-[#6F6A67] hover:text-[#B54747] rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Rules */}
      <div className="space-y-3 pt-2 border-t border-[#E7E2DE]">
        <span className="text-xs font-semibold text-[#191716] uppercase flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#6E1F2A]" /> Validation Rules
        </span>

        {(question.type === "short_text" || question.type === "long_text") && (
          <div className="space-y-2">
            <Input
              label="Minimum Character Length"
              type="number"
              value={question.settings_json?.min_length ?? ""}
              onChange={(e) => handleSettingsChange("min_length", e.target.value ? parseInt(e.target.value) : "")}
              placeholder="e.g. 2"
            />
            <Input
              label="Maximum Character Length"
              type="number"
              value={question.settings_json?.max_length ?? ""}
              onChange={(e) => handleSettingsChange("max_length", e.target.value ? parseInt(e.target.value) : "")}
              placeholder="e.g. 200"
            />
          </div>
        )}

        {question.type === "number" && (
          <div className="space-y-2">
            <Input
              label="Minimum Value"
              type="number"
              value={question.settings_json?.min ?? ""}
              onChange={(e) => handleSettingsChange("min", e.target.value ? parseFloat(e.target.value) : "")}
              placeholder="e.g. 0"
            />
            <Input
              label="Maximum Value"
              type="number"
              value={question.settings_json?.max ?? ""}
              onChange={(e) => handleSettingsChange("max", e.target.value ? parseFloat(e.target.value) : "")}
              placeholder="e.g. 100"
            />
          </div>
        )}
      </div>
    </div>
  );
};
