import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SavedAddress } from "@/lib/types";

export type SavedAddressWithCoordinates = SavedAddress & {
  latitude?: number;
  longitude?: number;
};

/** 저장된 주소 최대 개수 */
export const MAX_SAVED_ADDRESSES = 3;

export type AddSavedAddressResult = "ok" | "limit" | "duplicate";

function coordsKey(lat: number, lng: number) {
  return `${Math.round(lat * 1e5) / 1e5},${Math.round(lng * 1e5) / 1e5}`;
}

interface SavedAddressesState {
  addresses: SavedAddressWithCoordinates[];
  addAddress: (address: SavedAddressWithCoordinates) => AddSavedAddressResult;
  removeAddress: (id: string) => void;
}

export const useSavedAddressesStore = create<SavedAddressesState>()(
  persist(
    (set, get) => ({
      addresses: [],
      addAddress: (address) => {
        const state = get();
        if (state.addresses.length >= MAX_SAVED_ADDRESSES) {
          return "limit";
        }
        const { latitude: lat, longitude: lng } = address;
        if (typeof lat === "number" && typeof lng === "number") {
          const key = coordsKey(lat, lng);
          const dup = state.addresses.some(
            (a) =>
              typeof a.latitude === "number" &&
              typeof a.longitude === "number" &&
              coordsKey(a.latitude, a.longitude) === key,
          );
          if (dup) return "duplicate";
        }
        set((s) => {
          const next = [...s.addresses, address];
          if (address.isDefault) {
            return {
              addresses: next.map((a) => (a.id === address.id ? a : { ...a, isDefault: false })),
            };
          }
          return { addresses: next };
        });
        return "ok";
      },
      removeAddress: (id) =>
        set((state) => {
          const addresses = state.addresses.filter((a) => a.id !== id);
          if (addresses.length === 0) return { addresses };
          const hasDefault = addresses.some((a) => a.isDefault);
          if (hasDefault) return { addresses };
          return {
            addresses: addresses.map((a, i) => (i === 0 ? { ...a, isDefault: true } : a)),
          };
        }),
    }),
    {
      name: "saved-addresses-store-v2",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
