import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SearchRadius = 50 | 100 | 250;

interface NearbyQuery {
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
}

const DEFAULT_NEARBY_QUERY: NearbyQuery = {
  latitude: 37.5665,
  longitude: 126.978,
  radius: 100,
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
    }),
    {
      name: "nearby-query-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
