import { create } from "zustand";
import type { SwipeResult } from "@/lib/types";

interface ResultsState {
  results: SwipeResult[];
  addResult: (result: SwipeResult) => void;
  resetResults: () => void;
}

export const useResultsStore = create<ResultsState>((set) => ({
  results: [],
  addResult: (result) => set((state) => ({ results: [...state.results, result] })),
  resetResults: () => set({ results: [] }),
}));
