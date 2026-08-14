"use client";

import React from "react";
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
import { useBuilderStore } from "../../stores/builder-store";
import {
  GripVertical, Plus, Type, AlignLeft, List, ChevronDown, Mail, Hash,
  CheckSquare, Star, Heart, Trash2, Copy
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
    <div className="w-full md:w-64 border-r border-[#E7E2DE] bg-[#FCFBF8] flex flex-col h-full overflow-hidden">
      <div className="p-3.5 border-b border-[#E7E2DE] flex items-center justify-between">
        <span className="text-xs font-bold text-[#191716] uppercase tracking-wider">
          Questions ({questions.length})
        </span>
        <button
          onClick={onAdd}
          className="px-2.5 py-1 text-xs font-semibold bg-[#6E1F2A] text-white hover:bg-[#581821] rounded-lg transition-colors flex items-center gap-1 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
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

        {questions.length === 0 && (
          <div className="text-center py-8 text-xs text-[#6F6A67]">No questions added yet.</div>
        )}
      </div>
    </div>
  );
};
