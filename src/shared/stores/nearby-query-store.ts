import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { markManualLocationSelected } from "@/shared/utils/manual-location-session";

type SearchRadius = 50 | 100 | 250;

export interface NearbyQuery {
  latitude: number;
  longitude: number;
  radius: SearchRadius;
  address: string;
}

interface NearbyQueryState {
  nearbyQuery: NearbyQuery;
  setCoordinates: (latitude: number, longitude: number) => void;
  setRadius: (radius: SearchRadius) => void;
  setAddress: (address: string) => void;
  setNearbyQuery: (payload: NearbyQuery) => void;
  /**
   * 사용자가 직접 지정한 위치로 설정. 이번 세션 동안은 앱 시작 시 GPS가 이 값을 덮지 않습니다.
   * (위치 피커 확정, 저장된 주소 선택 등 사용자의 명시적 선택에만 사용)
   */
  setManualLocation: (latitude: number, longitude: number, address: string) => void;
}

/**
 * 현재 API가 250m 반경만 지원하므로 기본값을 250으로 고정합니다.
 * (50/100m 재지원 시 DEFAULT_SEARCH_RADIUS를 100으로 되돌리고
 *  hamburger-menu.tsx의 "검색 범위" 섹션 주석을 해제하면 됩니다)
 */
export const DEFAULT_SEARCH_RADIUS: SearchRadius = 250;

const DEFAULT_NEARBY_QUERY: NearbyQuery = {
  latitude: 37.5665,
  longitude: 126.978,
  radius: DEFAULT_SEARCH_RADIUS,
  address: "서울특별시 중구",
};

export const useNearbyQueryStore = create<NearbyQueryState>()(
  persist(
    (set) => ({
      nearbyQuery: DEFAULT_NEARBY_QUERY,
      setCoordinates: (latitude, longitude) =>
        set((state) => ({
          nearbyQuery: { ...state.nearbyQuery, latitude, longitude },
        })),
      setRadius: (radius) =>
        set((state) => ({
          nearbyQuery: { ...state.nearbyQuery, radius },
        })),
      setAddress: (address) =>
        set((state) => ({
          nearbyQuery: { ...state.nearbyQuery, address },
        })),
      setNearbyQuery: (payload) => set({ nearbyQuery: payload }),
      setManualLocation: (latitude, longitude, address) => {
        markManualLocationSelected();
        set((state) => ({
          nearbyQuery: { ...state.nearbyQuery, latitude, longitude, address },
        }));
      },
    }),
    {
      name: "nearby-query-store",
      storage: createJSONStorage(() => localStorage),
      // 이전 버전에서 저장된 50/100m 반경을 250m로 올려줌 (UI에서 변경할 수 없으므로)
      version: 1,
      migrate: (persisted) => {
        const state = persisted as Partial<NearbyQueryState> | undefined;
        if (!state?.nearbyQuery) return state as NearbyQueryState;
        return {
          ...state,
          nearbyQuery: { ...state.nearbyQuery, radius: DEFAULT_SEARCH_RADIUS },
        } as NearbyQueryState;
      },
    },
  ),
);
