import { useQuery } from "@tanstack/react-query";
import type { FilterSettings, Restaurant } from "@/lib/types";
import {
  buildNearbySearchRequest,
  mapRestaurantResponse,
  restaurantAPI,
} from "@/shared/api/restaurant";
import { analyticsEvents } from "@/shared/constants/analytics-events";
import type { NearbyQuery } from "@/shared/stores/nearby-query-store";
import { trackEvent } from "@/shared/utils/analytics";

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

/** 켜져 있는 부가 필터 개수 (필터를 몇 개나 쓰는지 = 필터 UI의 실효성 지표) */
function countActiveFilters(filterSettings: FilterSettings): number {
  return [
    filterSettings.hasParking,
    filterSettings.hasGroupSeating,
    filterSettings.petFriendly,
  ].filter((value) => value !== null).length;
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
      // queryFn은 실제 네트워크 호출에서만 실행되므로, 캐시 히트로 인한 중복 집계가 없다.
      const startedAt = performance.now();
      const response = await restaurantAPI.searchNearby(
        buildNearbySearchRequest(nearbyQuery.latitude, nearbyQuery.longitude, filterSettings, []),
      );
      trackEvent(analyticsEvents.searchNearby, {
        radius: nearbyQuery.radius,
        result_count: response.count,
        is_empty: response.count === 0,
        filter_count: countActiveFilters(filterSettings),
        duration_ms: Math.round(performance.now() - startedAt),
      });
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
