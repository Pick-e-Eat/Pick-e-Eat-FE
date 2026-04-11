import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SavedAddress } from "@/lib/types";

export type SavedAddressWithCoordinates = SavedAddress & {
  latitude?: number;
  longitude?: number;
};

const SEED_ADDRESSES: SavedAddressWithCoordinates[] = [
  {
    id: "1",
    label: "집",
    address: "서울특별시 강남구 역삼동 123-45",
    isDefault: true,
    latitude: 37.5172,
    longitude: 127.0473,
  },
  {
    id: "2",
    label: "회사",
    address: "서울특별시 서초구 서초동 456-78",
    isDefault: false,
    latitude: 37.4839,
    longitude: 127.0328,
  },
];

function coordsKey(lat: number, lng: number) {
  return `${Math.round(lat * 1e5) / 1e5},${Math.round(lng * 1e5) / 1e5}`;
}

interface SavedAddressesState {
  addresses: SavedAddressWithCoordinates[];
  addAddress: (address: SavedAddressWithCoordinates) => void;
  removeAddress: (id: string) => void;
}

export const useSavedAddressesStore = create<SavedAddressesState>()(
  persist(
    (set) => ({
      addresses: SEED_ADDRESSES,
      addAddress: (address) =>
        set((state) => {
          const { latitude: lat, longitude: lng } = address;
          if (typeof lat === "number" && typeof lng === "number") {
            const key = coordsKey(lat, lng);
            const dup = state.addresses.some(
              (a) =>
                typeof a.latitude === "number" &&
                typeof a.longitude === "number" &&
                coordsKey(a.latitude, a.longitude) === key,
            );
            if (dup) return state;
          }
          const next = [...state.addresses, address];
          if (address.isDefault) {
            return {
              addresses: next.map((a) => (a.id === address.id ? a : { ...a, isDefault: false })),
            };
          }
          return { addresses: next };
        }),
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
      name: "saved-addresses-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
