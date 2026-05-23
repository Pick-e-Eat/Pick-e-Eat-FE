// 공통 API 응답 형태를 재사용하기 위한 타입 정의
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

// ─── 주변 식당 검색 (GPS 좌표 기반) ────────────────────────────────
export interface NearbySearchRequest {
  /** 주변 식당 검색 요청. 위도/경도와 반경(m)을 전달합니다. */
  latitude: number; // 위도 (예: 37.5665)
  longitude: number; // 경도 (예: 126.978)
  radius?: 50 | 100 | 250; // 검색 반경 (미터). 50, 100, 250 중 선택
  excluded_place_ids?: string[]; // 이미 스와이프한 장소 제외
}

export interface RestaurantResponse {
  /** 식당 카드 한 장에 필요한 정보. 스와이프 UI에서 카드 단위로 사용됩니다. */
  place_id: string; // Google Place 고유 ID
  name: string; // 식당 이름
  address?: string; // 주소
  latitude: number; // 위도
  longitude: number; // 경도
  rating?: number | null; // Google 평점 (1.0~5.0)
  user_ratings_total?: number | null; // 리뷰 수
  photo_url?: string | null; // 대표 사진 URL (1장)
  opening_now?: boolean | null; // 현재 영업 중 여부
  // --- UI 카드에 필요한 확장 필드 ---
  cuisine_type?: string | null; // 음식 카테고리 (예: 일식 / 돈까스)
  distance_meters?: number | null; // 사용자로부터의 거리 (미터)
  walking_minutes?: number | null; // 도보 소요 시간 (분)
  has_parking?: boolean | null; // 주차 가능 여부
  blog_review_count?: number | null; // 블로그 리뷰 수
  tags?: string[]; // 태그 목록 (예: 혼밥, 가성비)
}

export interface NearbySearchResponse {
  /** 주변 식당 검색 결과. restaurants 배열을 순서대로 스와이프합니다. */
  restaurants: RestaurantResponse[]; // 식당 목록
  count: number; // 검색된 식당 수
}

// ─── 지역 검색 (텍스트 기반 → 좌표 변환) ──────────────────────────
export interface TextSearchRequest {
  /**
   * 지역명/장소명으로 검색하는 요청.
   * GPS가 꺼진 환경(데스크톱 등)에서 사용합니다.
   * 검색 결과의 좌표를 `/nearby` 요청에 활용할 수 있습니다.
   */
  query: string; // 검색할 지역명 또는 장소명 (예: 강남역, 홍대입구)
}

export interface LocationResult {
  /** 검색된 장소 한 건의 정보. FE에서 선택 후 좌표를 `/nearby`에 전달합니다. */
  place_id: string; // Google Place 고유 ID
  name: string; // 장소 이름
  address?: string; // 주소
  latitude: number; // 위도
  longitude: number; // 경도
}

export interface TextSearchResponse {
  /** 지역 검색 결과. 최대 5건의 후보 장소를 반환합니다. */
  locations: LocationResult[]; // 검색된 장소 목록
  count: number; // 검색된 장소 수
}
