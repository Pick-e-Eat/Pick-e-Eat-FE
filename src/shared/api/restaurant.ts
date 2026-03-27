import { apiClient } from "./client";
import type {
  NearbySearchRequest,
  NearbySearchResponse,
  TextSearchRequest,
  TextSearchResponse,
} from "../types/api.types";

export const restaurantApi = {
  searchNearby: async (
    body: NearbySearchRequest,
  ): Promise<NearbySearchResponse> => {
    return await apiClient
      .post("api/v1/restaurants/nearby", { json: body })
      .json();
  },

  searchText: async (body: TextSearchRequest): Promise<TextSearchResponse> => {
    return await apiClient
      .post("api/v1/restaurants/search", { json: body })
      .json();
  },
};
