"use client";

import React from "react";
import { Question } from "../../types";
import { Star, Check, ArrowRight } from "lucide-react";

export const CanvasEditor: React.FC<{
  question: Question | null;
  questionIndex: number;
  totalQuestions: number;
  onUpdateQuestion: (updated: Partial<Question>) => void;
}> = ({ question, questionIndex, totalQuestions, onUpdateQuestion }) => {
  if (!question) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-[#6F6A67]">
        Select or add a question from the left panel.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-white p-6 sm:p-12 items-center justify-center">
      <div className="w-full max-w-xl space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#6E1F2A]">
          <span>
            {String(questionIndex + 1).padStart(2, "0")} / {String(totalQuestions).padStart(2, "0")}
          </span>
          {question.required && <span className="text-[#B54747] text-xs font-semibold">* Required</span>}
        </div>

        {/* Editable Title Input */}
        <div>
          <input
            type="text"
            value={question.title}
            onChange={(e) => onUpdateQuestion({ title: e.target.value })}
            placeholder="Type your question title here..."
            className="w-full text-xl sm:text-2xl font-extrabold text-[#191716] border-b-2 border-transparent hover:border-[#E7E2DE] focus:border-[#6E1F2A] focus:outline-none py-1.5 transition-colors placeholder:text-[#6F6A67]/40"
          />
        </div>

        {/* Editable Description Input */}
        <div>
          <input
            type="text"
            value={question.description || ""}
            onChange={(e) => onUpdateQuestion({ description: e.target.value })}
            placeholder="Add a helpful description or instructions (optional)..."
            className="w-full text-sm text-[#6F6A67] border-b border-transparent hover:border-[#E7E2DE] focus:border-[#6E1F2A] focus:outline-none py-1 transition-colors placeholder:text-[#6F6A67]/40"
          />
        </div>

        {/* Live Canvas Input Preview */}
        <div className="pt-4">
          {question.type === "short_text" && (
            <input
              type="text"
              disabled
              placeholder="Respondent types short text answer..."
              className="w-full px-4 py-3 text-sm bg-[#FCFBF8] border border-[#E7E2DE] rounded-xl text-[#191716]"
            />
          )}

          {question.type === "long_text" && (
            <textarea
              disabled
              rows={3}
              placeholder="Respondent types detailed feedback..."
              className="w-full p-4 text-sm bg-[#FCFBF8] border border-[#E7E2DE] rounded-xl text-[#191716] resize-none"
            />
          )}

          {question.type === "email" && (
            <input
              type="email"
              disabled
              placeholder="name@example.com"
              className="w-full px-4 py-3 text-sm bg-[#FCFBF8] border border-[#E7E2DE] rounded-xl text-[#191716]"
            />
          )}

          {question.type === "number" && (
            <input
              type="number"
              disabled
              placeholder="42"
              className="w-full px-4 py-3 text-sm bg-[#FCFBF8] border border-[#E7E2DE] rounded-xl text-[#191716]"
            />
          )}

          {(question.type === "multiple_choice" || question.type === "dropdown") && (
            <div className="space-y-2.5">
              {question.options && question.options.length > 0 ? (
                question.options.map((opt, idx) => (
                  <div
                    key={opt.id || idx}
                    className="flex items-center gap-3 p-3.5 bg-[#FCFBF8] border border-[#E7E2DE] rounded-xl text-sm font-medium text-[#191716] shadow-subtle"
                  >
                    <span className="w-5 h-5 rounded-md bg-[#F5F2EF] text-[#6E1F2A] font-bold text-xs flex items-center justify-center border border-[#E7E2DE]">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt.label}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 border border-dashed border-[#E7E2DE] rounded-xl text-xs text-[#6F6A67] text-center">
                  No choices added yet. Configure choices in the right settings panel.
                </div>
              )}
            </div>
          )}

          {question.type === "yes_no" && (
            <div className="flex gap-4">
              <div className="flex-1 p-4 bg-[#FCFBF8] border-2 border-[#6E1F2A] rounded-xl text-center font-bold text-[#6E1F2A] text-sm shadow-subtle">
                Y — Yes
              </div>
              <div className="flex-1 p-4 bg-[#FCFBF8] border border-[#E7E2DE] rounded-xl text-center font-semibold text-[#191716] text-sm">
                N — No
              </div>
            </div>
          )}

          {question.type === "rating" && (
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  disabled
                  className="w-12 h-12 rounded-xl bg-[#FCFBF8] border border-[#E7E2DE] flex flex-col items-center justify-center hover:border-[#6E1F2A] transition-colors"
                >
                  <Star className="w-5 h-5 text-[#B7791F]" />
                  <span className="text-[10px] font-bold text-[#6F6A67]">{num}</span>
                </button>
              ))}
            </div>
          )}

          {question.type === "nps" && (
            <div>
              <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
                {Array.from({ length: 11 }, (_, i) => i).map((score) => (
                  <button
                    key={score}
                    disabled
                    className={`w-9 h-10 rounded-lg border text-xs font-bold flex items-center justify-center shrink-0 ${
                      score >= 9
                        ? "bg-[#E6F4ED] text-[#2F7D5B] border-[#B7E2CE]"
                        : score >= 7
                        ? "bg-[#FEF3C7] text-[#B7791F] border-[#FDE68A]"
                        : "bg-[#F7EEF0] text-[#B54747] border-[#F0C9CD]"
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-[#6F6A67] mt-1">
                <span>0 = Not likely</span>
                <span>10 = Extremely likely</span>
              </div>
            </div>
          )}
        </div>

        {/* Enter key mockup button */}
        <div className="pt-4 flex items-center gap-3">
          <button disabled className="px-5 py-2.5 bg-[#6E1F2A] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm">
            OK <Check className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] text-[#6F6A67] font-mono">press Enter ↵</span>
        </div>
      </div>
    </div>
  );
};
