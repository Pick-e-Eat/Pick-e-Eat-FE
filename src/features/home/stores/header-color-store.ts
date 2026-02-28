import { create } from "zustand";

interface HeaderColorState {
  backgroundColor: string | null;
  textColor: string | null;
  setColors: (backgroundColor: string, textColor: string) => void;
  resetColors: () => void;
}

export const useHeaderColorStore = create<HeaderColorState>((set) => ({
  backgroundColor: null,
  textColor: null,
  setColors: (backgroundColor, textColor) => set({ backgroundColor, textColor }),
  resetColors: () => set({ backgroundColor: null, textColor: null }),
}));
