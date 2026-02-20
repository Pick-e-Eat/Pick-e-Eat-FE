export interface Review {
  id: string;
  author: string;
  content: string;
  rating: number;
  date: string;
  source: string;
}

export interface Restaurant {
  id: string;
  name: string;
  type: string;
  rating: number;
  reviewCount: number;
  blogReviewCount: number;
  walkingTime: number;
  distance: number;
  tags: string[];
  image: string;
  hasParking: boolean;
  hasGroupSeating: boolean;
  petFriendly: boolean;
  reviews: Review[];
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
