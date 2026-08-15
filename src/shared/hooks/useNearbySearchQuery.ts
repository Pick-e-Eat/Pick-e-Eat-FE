import { useQuery } from "@tanstack/react-query";
import type { FilterSettings, Restaurant } from "@/lib/types";
import {
  buildNearbySearchRequest,
  mapRestaurantResponse,
  restaurantAPI,
} from "@/shared/api/restaurant";
import type { NearbyQuery } from "@/shared/stores/nearby-query-store";

interface NearbySearchResult {
  restaurants: Restaurant[];
  count: number;
}

/**
 * GPS는 재접속할 때마다 수십 m 단위로 흔들릴 수 있는데, 검색 반경 최소값이 50m라
 * 11m(1e4) 오차는 "같은 위치"로 봐도 결과에 영향이 없다.
 */
function roundCoordinate(value: number) {
  return Math.round(value * 1e4) / 1e4;
}

export function buildNearbySearchQueryKey(
  nearbyQuery: NearbyQuery,
  filterSettings: Pick<FilterSettings, "hasParking" | "hasGroupSeating" | "petFriendly">,
) {
  return [
    "nearbySearch",
    roundCoordinate(nearbyQuery.latitude),
    roundCoordinate(nearbyQuery.longitude),
    nearbyQuery.radius,
    filterSettings.hasParking,
    filterSettings.hasGroupSeating,
    filterSettings.petFriendly,
  ] as const;
}

export function useNearbySearchQuery(
  nearbyQuery: NearbyQuery,
  filterSettings: FilterSettings,
  options: { enabled: boolean },
) {
  return useQuery<NearbySearchResult>({
    queryKey: buildNearbySearchQueryKey(nearbyQuery, filterSettings),
    queryFn: async () => {
      const response = await restaurantAPI.searchNearby(
        buildNearbySearchRequest(nearbyQuery.latitude, nearbyQuery.longitude, filterSettings, []),
      );
      return {
        restaurants: response.restaurants.map(mapRestaurantResponse),
        count: response.count,
      };
    },
    enabled: options.enabled,
    staleTime: 30 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}
