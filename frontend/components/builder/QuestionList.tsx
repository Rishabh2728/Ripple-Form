"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Question, QuestionType } from "../../types";
import {
  GripVertical, Plus, Type, AlignLeft, List, ChevronDown, Mail, Hash,
  CheckSquare, Star, Heart, Trash2, Copy, Layers, ChevronLeft, ChevronRight
} from "lucide-react";

export const getQuestionTypeIcon = (type: QuestionType) => {
  switch (type) {
    case "short_text":
      return Type;
    case "long_text":
      return AlignLeft;
    case "multiple_choice":
      return List;
    case "dropdown":
      return ChevronDown;
    case "email":
      return Mail;
    case "number":
      return Hash;
    case "yes_no":
      return CheckSquare;
    case "rating":
      return Star;
    case "nps":
      return Heart;
    default:
      return Type;
  }
};

interface SortableItemProps {
  question: Question;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const SortableQuestionItem: React.FC<SortableItemProps> = ({
  question,
  index,
  isActive,
  onSelect,
  onDuplicate,
  onDelete,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: question.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = getQuestionTypeIcon(question.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group relative flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
        isActive
          ? "bg-[#6E1F2A] text-white border-[#6E1F2A] shadow-sm"
          : "bg-white text-[#191716] border-[#E7E2DE] hover:border-[#6F6A67]"
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <button
          {...attributes}
          {...listeners}
          className={`p-1 rounded cursor-grab active:cursor-grabbing ${
            isActive ? "text-white/70 hover:text-white" : "text-[#6F6A67] hover:text-[#191716]"
          }`}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        <span className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center ${
          isActive ? "bg-white/20 text-white" : "bg-[#F5F2EF] text-[#6F6A67]"
        }`}>
          {index + 1}
        </span>

        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-[#6E1F2A]"}`} />

        <span className="truncate max-w-[120px] sm:max-w-[150px]">
          {question.title || "Untitled Question"}
        </span>
      </div>

      <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
        isActive ? "text-white" : "text-[#6F6A67]"
      }`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          title="Duplicate"
          className="p-1 hover:bg-black/10 rounded"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete"
          className="p-1 hover:bg-black/10 rounded"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export const QuestionList: React.FC<{
  questions: Question[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onReorder: (newQuestions: Question[]) => void;
  onAdd: () => void;
  onDuplicate: (q: Question) => void;
  onDelete: (id: string) => void;
}> = ({ questions, activeId, onSelect, onReorder, onAdd, onDuplicate, onDelete }) => {
  const [collapsed, setCollapsed] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      const reordered = arrayMove(questions, oldIndex, newIndex).map((q, idx) => ({
        ...q,
        position: idx,
      }));
      onReorder(reordered);
    }
  };

  return (
    <div
      className={`border-r border-[#E7E2DE] bg-[#FCFBF8] flex flex-col h-full overflow-hidden transition-all duration-200 ${
        collapsed ? "w-14 shrink-0" : "w-full md:w-64 shrink-0"
      }`}
    >
      <div className="p-3.5 border-b border-[#E7E2DE] flex items-center justify-between">
        {!collapsed ? (
          <>
            <span className="text-xs font-bold text-[#191716] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#6E1F2A]" />
              Questions ({questions.length})
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={onAdd}
                className="px-2 py-1 text-xs font-semibold bg-[#6E1F2A] text-white hover:bg-[#581821] rounded-lg transition-colors flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
              <button
                onClick={() => setCollapsed(true)}
                className="p-1 rounded text-[#6F6A67] hover:text-[#191716] hover:bg-[#F5F2EF] hidden md:block"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full py-1 text-[#6F6A67] hover:text-[#191716] flex items-center justify-center"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {!collapsed ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
              {questions.map((q, idx) => (
                <SortableQuestionItem
                  key={q.id}
                  question={q}
                  index={idx}
                  isActive={q.id === activeId}
                  onSelect={() => onSelect(q.id)}
                  onDuplicate={() => onDuplicate(q)}
                  onDelete={() => onDelete(q.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            {questions.map((q, idx) => {
              const Icon = getQuestionTypeIcon(q.type);
              const isActive = q.id === activeId;
              return (
                <button
                  key={q.id}
                  onClick={() => onSelect(q.id)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#6E1F2A] text-white shadow-sm"
                      : "bg-white text-[#6F6A67] border border-[#E7E2DE] hover:border-[#6F6A67]"
                  }`}
                  title={`${idx + 1}. ${q.title}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
            <button
              onClick={onAdd}
              className="w-9 h-9 rounded-xl bg-[#F7EEF0] text-[#6E1F2A] hover:bg-[#6E1F2A] hover:text-white flex items-center justify-center transition-colors"
              title="Add Question"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

        {!collapsed && questions.length === 0 && (
          <div className="text-center py-8 text-xs text-[#6F6A67]">No questions added yet.</div>
        )}
      </div>
    </div>
  );
};
