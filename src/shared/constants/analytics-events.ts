// GA4 이벤트 이름을 한 곳에서 관리
// GA4 표준 속성은 속성당 이벤트 이름 500개 제한이 있으므로, 런타임에 이름을 조합하지 않고 여기서만 선언한다.
// 세부 구분은 이벤트 이름을 늘리는 대신 파라미터(action/method/reason 등)로 표현한다.
export const analyticsEvents = {
  /** 위치 사전 안내 다이얼로그 응답 — choice: allow | decline (ESC·바깥 클릭으로 닫아도 decline) */
  locationPromptResponse: "location_prompt_response",
  /**
   * 앱 진입 시 위치 권한 흐름의 최종 결과 — 흐름이 끝날 때 정확히 1회
   * (이번 세션에 직접 지정한 위치가 있으면 흐름 자체를 건너뛰므로 보내지 않는다)
   * - result: granted | denied | timeout | unavailable | declined | unsupported
   * - flow: stored(안내 없이 바로 요청) | prompted(사전 안내를 거침) | blocked(이미 차단돼 요청 안 함)
   *   → flow=prompted인 결과만 보면 "사전 안내 허용 → 브라우저 권한창 허용" 전환율이 나온다
   */
  locationPermissionResult: "location_permission_result",
  /** 검색 기준 위치 확정 — method: gps | search | map_click | initial | saved_address */
  locationSet: "location_set",
  /** 주변 맛집 검색 성공 (실제 네트워크 호출 1회당 1건, 캐시 히트는 집계하지 않음) */
  searchNearby: "search_nearby",
  /** 주변 맛집 검색 실패 */
  searchNearbyError: "search_nearby_error",
  /** 카드 좌우 스와이프 — direction: like | pass */
  swipeCard: "swipe_card",
  /** 스와이프 세션 종료 — reason: batch_complete | user_stopped | exhausted */
  swipeSessionEnd: "swipe_session_end",
  /** 카드 내 부가 탐색 — type: photo_gallery | review_sheet */
  cardInteraction: "card_interaction",
  /** 지도 열기 — 전환에 가장 가까운 행동, GA4에서 [주요 이벤트]로 지정 권장 */
  openRestaurantMap: "open_restaurant_map",
  /** 결과 화면에서 이어서 검색 */
  continueSearch: "continue_search",
  /** 처음부터 다시 검색 — source: results | empty_state | error */
  restartSearch: "restart_search",
  /** 저장 주소 — action: add | select | remove | limit_reached */
  savedAddress: "saved_address",
} as const;

export type AnalyticsEventName = (typeof analyticsEvents)[keyof typeof analyticsEvents];
