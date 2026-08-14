import { create } from "zustand";
import { User } from "../types";
import { api } from "../lib/api-client";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("formflow_token") : null,
  isLoading: true,

  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("formflow_token", token);
    }
    set({ user, token, isLoading: false });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("formflow_token");
    }
    set({ user: null, token: null, isLoading: false });
  },

  fetchUser: async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("formflow_token") : null;
    if (!token) {
      set({ user: null, token: null, isLoading: false });
      return;
    }
    try {
      set({ isLoading: true });
      const user = await api.getMe();
      set({ user, token, isLoading: false });
    } catch (err) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("formflow_token");
      }
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
