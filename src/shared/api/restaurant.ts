import type { FilterSettings, Restaurant } from "@/lib/types";
import type {
  NearbySearchRequest,
  NearbySearchResponse,
  RestaurantResponse,
  TextSearchRequest,
  TextSearchResponse,
} from "../types/api.types";
import { apiClient } from "./client";

export function buildNearbySearchRequest(
  latitude: number,
  longitude: number,
  filterSettings: FilterSettings,
  excludedPlaceIds: string[],
): NearbySearchRequest {
  const body: NearbySearchRequest = {
    latitude,
    longitude,
    radius: filterSettings.searchRange as 50 | 100 | 250,
    excluded_place_ids: excludedPlaceIds,
  };

  if (filterSettings.hasParking !== null) {
    body.has_parking = filterSettings.hasParking;
  }
  if (filterSettings.petFriendly !== null) {
    body.allows_dogs = filterSettings.petFriendly;
  }
  if (filterSettings.hasGroupSeating !== null) {
    body.good_for_groups = filterSettings.hasGroupSeating;
  }

  return body;
}

export function mapRestaurantResponse(r: RestaurantResponse): Restaurant {
  return {
    id: r.place_id,
    name: r.name,
    address: r.address,
    latitude: r.latitude,
    longitude: r.longitude,
    rating: r.rating,
    user_ratings_total: r.user_ratings_total,
    photo_url: r.photo_url,
    photo_urls: r.photo_urls,
    opening_now: r.opening_now,
    cuisine_type: r.cuisine_type,
    distance_meters: r.distance_meters,
    walking_minutes: r.walking_minutes,
    has_parking: r.has_parking,
    hasGroupSeating: r.good_for_groups ?? null,
    petFriendly: r.allows_dogs ?? null,
    blog_review_count: r.blog_review_count,
    tags: r.tags,
    google_maps_uri: r.google_maps_uri,
    google_maps_links: r.google_maps_links,
    kakao_map_uri: r.kakao_map_uri,
    // 서버가 음식 카테고리를 내려주지 않음 — 빈 값이면 리뷰 시트에서 줄을 감춥니다
    type: "",
    reviews: [],
  };
}

export const restaurantAPI = {
  searchNearby: async (body: NearbySearchRequest) => {
    const response = await apiClient
      .post("api/v1/restaurants/nearby", { json: body })
      .json<NearbySearchResponse>();
    return response;
  },

  searchText: async (body: TextSearchRequest) => {
    const response = await apiClient
      .post("api/v1/restaurants/search", { json: body })
      .json<TextSearchResponse>();
    return response;
  },
};
