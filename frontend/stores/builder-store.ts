import { create } from "zustand";
import { Form, Question, QuestionType } from "../types";

export type SaveStatus = "saved" | "saving" | "error" | "idle";

interface HistoryState {
  form: Form;
}

interface BuilderState {
  form: Form | null;
  activeQuestionId: string | null;
  saveStatus: SaveStatus;
  isCommandPaletteOpen: boolean;
  isHealthModalOpen: boolean;
  isShareModalOpen: boolean;

  past: HistoryState[];
  future: HistoryState[];

  setForm: (form: Form) => void;
  setActiveQuestionId: (id: string | null) => void;
  setSaveStatus: (status: SaveStatus) => void;
  toggleCommandPalette: (open?: boolean) => void;
  toggleHealthModal: (open?: boolean) => void;
  toggleShareModal: (open?: boolean) => void;

  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  updateFormLocal: (updater: (prev: Form) => Form) => void;
}

const cloneForm = (form: Form): Form => {
  if (typeof structuredClone === "function") {
    return structuredClone(form);
  }
  return JSON.parse(JSON.stringify(form));
};

export const useBuilderStore = create<BuilderState>((set, get) => ({
  form: null,
  activeQuestionId: null,
  saveStatus: "idle",
  isCommandPaletteOpen: false,
  isHealthModalOpen: false,
  isShareModalOpen: false,

  past: [],
  future: [],

  setForm: (form) => {
    const activeId = get().activeQuestionId || (form.questions.length > 0 ? form.questions[0].id : null);
    set({ form, activeQuestionId: activeId });
  },

  setActiveQuestionId: (id) => set({ activeQuestionId: id }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  toggleCommandPalette: (open) => set((s) => ({ isCommandPaletteOpen: open !== undefined ? open : !s.isCommandPaletteOpen })),
  toggleHealthModal: (open) => set((s) => ({ isHealthModalOpen: open !== undefined ? open : !s.isHealthModalOpen })),
  toggleShareModal: (open) => set((s) => ({ isShareModalOpen: open !== undefined ? open : !s.isShareModalOpen })),

  pushHistory: () => {
    const { form, past } = get();
    if (!form) return;
    const newPast = [...past.slice(-29), { form: cloneForm(form) }];
    set({ past: newPast, future: [] });
  },

  undo: () => {
    const { form, past, future } = get();
    if (!form || past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const newFuture = [{ form: cloneForm(form) }, ...future];

    set({
      form: previous.form,
      past: newPast,
      future: newFuture,
      saveStatus: "saving"
    });
  },

  redo: () => {
    const { form, past, future } = get();
    if (!form || future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    const newPast = [...past, { form: cloneForm(form) }];

    set({
      form: next.form,
      past: newPast,
      future: newFuture,
      saveStatus: "saving"
    });
  },

  updateFormLocal: (updater) => {
    const current = get().form;
    if (!current) return;
    get().pushHistory();
    const updated = updater(current);
    set({ form: updated, saveStatus: "saving" });
  }
}));
