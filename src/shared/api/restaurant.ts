import { apiClient } from "./client";
import type {
  NearbySearchRequest,
  NearbySearchResponse,
  TextSearchRequest,
  TextSearchResponse,
} from "../types/api.types";

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
