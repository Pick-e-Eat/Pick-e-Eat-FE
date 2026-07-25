import { create } from "zustand";
import type { Restaurant, SwipeResult } from "@/lib/types";

/** 1차 스와이프 배치 크기 (UI 노출 단위) */
export const SWIPE_BATCH_SIZE = 10;

/** /nearby 1회 응답 기준 최대 스와이프 횟수 */
export const MAX_SWIPE_SELECTIONS = 20;

interface ResultsState {
  results: SwipeResult[];
  restaurants: Restaurant[];
  cachedTotalCount: number;
  currentIndex: number;
  maxSelections: number;
  sessionBatchStart: number;
  sessionBatchEnd: number;
  addResult: (result: SwipeResult) => void;
  setRestaurants: (restaurants: Restaurant[], totalCount?: number) => void;
  setCurrentIndex: (index: number) => void;
  continueSession: () => void;
  resetResults: () => void;
}

const initialSessionState = {
  results: [],
  restaurants: [],
  cachedTotalCount: 0,
  currentIndex: 0,
  maxSelections: SWIPE_BATCH_SIZE,
  sessionBatchStart: 0,
  sessionBatchEnd: SWIPE_BATCH_SIZE,
};

export const useResultsStore = create<ResultsState>((set) => ({
  ...initialSessionState,
  addResult: (result) =>
    set((state) => ({
      results: [...state.results, result],
      currentIndex: state.currentIndex + 1,
    })),
  setRestaurants: (restaurants, totalCount = restaurants.length) =>
    set({
      restaurants,
      cachedTotalCount: Math.max(totalCount, restaurants.length),
      currentIndex: 0,
      sessionBatchStart: 0,
      sessionBatchEnd: Math.min(SWIPE_BATCH_SIZE, restaurants.length),
      maxSelections: Math.min(SWIPE_BATCH_SIZE, restaurants.length),
    }),
  setCurrentIndex: (index) => set({ currentIndex: index }),
  continueSession: () =>
    set((state) => {
      const batchSize = Math.min(SWIPE_BATCH_SIZE, state.cachedTotalCount - state.results.length);

      return {
        sessionBatchStart: state.results.length,
        sessionBatchEnd: state.cachedTotalCount,
        maxSelections: batchSize,
      };
    }),
  resetResults: () => set({ ...initialSessionState }),
}));

export function getBatchProgress(
  state: Pick<ResultsState, "results" | "sessionBatchStart" | "sessionBatchEnd">,
) {
  const batchMax = Math.min(
    SWIPE_BATCH_SIZE,
    Math.max(0, state.sessionBatchEnd - state.sessionBatchStart),
  );
  const current = state.results.length - state.sessionBatchStart;

  return { current, max: batchMax };
}

export function canShowContinueSearch(
  state: Pick<
    ResultsState,
    "results" | "cachedTotalCount" | "sessionBatchEnd" | "sessionBatchStart"
  >,
) {
  const finishedFirstBatch =
    state.results.length >= SWIPE_BATCH_SIZE && state.sessionBatchStart === 0;

  return (
    finishedFirstBatch &&
    state.sessionBatchEnd === Math.min(SWIPE_BATCH_SIZE, state.cachedTotalCount) &&
    state.cachedTotalCount > state.results.length
  );
}
