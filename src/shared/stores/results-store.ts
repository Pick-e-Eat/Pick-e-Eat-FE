import { create } from "zustand";
import type { SwipeResult } from "@/lib/types";

interface ResultsState {
  results: SwipeResult[];
  maxSelections: number;
  addResult: (result: SwipeResult) => void;
  setMaxSelections: (max: number) => void;
  resetResults: () => void;
}

export const useResultsStore = create<ResultsState>((set) => ({
  results: [],
  maxSelections: 10,
  addResult: (result) => set((state) => ({ results: [...state.results, result] })),
  setMaxSelections: (max) => set({ maxSelections: max }),
  resetResults: () => set({ results: [], maxSelections: 10 }),
}));
