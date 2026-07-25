export interface Review {
  id: string;
  author: string;
  content: string;
  rating: number;
  date: string;
  source: string;
}

export interface GoogleMapsDeepLinks {
  place_uri?: string | null;
  directions_uri?: string | null;
  reviews_uri?: string | null;
  photos_uri?: string | null;
  write_a_review_uri?: string | null;
}

export interface Restaurant {
  id: string; // Mapped from place_id
  name: string;
  address?: string; // Added from RestaurantResponse
  latitude: number; // Added from RestaurantResponse
  longitude: number; // Added from RestaurantResponse
  rating?: number | null; // Mapped from rating
  user_ratings_total?: number | null; // Mapped from reviewCount
  photo_url?: string | null; // Mapped from image
  photo_urls?: string[] | null; // 여러 장의 사진 URL
  opening_now?: boolean | null; // Added from RestaurantResponse
  cuisine_type?: string | null; // Added from RestaurantResponse
  distance_meters?: number | null; // Mapped from distance
  walking_minutes?: number | null; // Mapped from walkingTime
  has_parking?: boolean | null; // Mapped from hasParking
  blog_review_count?: number | null; // Mapped from blogReviewCount
  tags?: string[]; // Mapped from tags
  google_maps_uri?: string | null; // Google Maps 상세 페이지
  google_maps_links?: GoogleMapsDeepLinks | null; // Google Maps 딥링크 묶음
  kakao_map_uri?: string | null; // 카카오맵 딥링크

  editorial_summary?: string | null; // 식당 요약 설명

  // Legacy/Mock data compatibility fields
  image?: string;
  reviewCount?: number;
  blogReviewCount?: number;
  walkingTime?: number;
  distance?: number;
  hasParking?: boolean;

  // Existing fields without direct API mapping, kept as optional
  type?: string;
  hasGroupSeating?: boolean | null;
  petFriendly?: boolean | null;
  reviews?: Review[];
}

export interface FilterSettings {
  searchRange: number;
  hasParking: boolean | null;
  hasGroupSeating: boolean | null;
  petFriendly: boolean | null;
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}

export interface SwipeResult {
  restaurant: Restaurant;
  liked: boolean;
}
