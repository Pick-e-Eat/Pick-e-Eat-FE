export interface Review {
  id: string;
  author: string;
  content: string;
  rating: number;
  date: string;
  source: string;
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
  opening_now?: boolean | null; // Added from RestaurantResponse
  cuisine_type?: string | null; // Added from RestaurantResponse
  distance_meters?: number | null; // Mapped from distance
  walking_minutes?: number | null; // Mapped from walkingTime
  has_parking?: boolean | null; // Mapped from hasParking
  blog_review_count?: number | null; // Mapped from blogReviewCount
  tags?: string[]; // Mapped from tags

  // Existing fields without direct API mapping, kept as optional
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
}

export interface SwipeResult {
  restaurant: Restaurant;
  liked: boolean;
}
