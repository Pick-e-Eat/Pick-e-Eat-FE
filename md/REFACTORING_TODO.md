# 리팩토링 TODO List

이 문서는 Pick-e-Eat FE 프로젝트의 코드 품질 향상과 유지보수성 개선을 위한 리팩토링 항목들을 관리합니다.

---

## 1. 전역 상태 및 스토어 리팩토링 (Shared/Stores)
상태 파편화를 방지하고 컴포넌트 간 결합도를 낮추기 위한 작업입니다.

- [ ] **`useSettingsStore` 신규 생성**
    - [ ] `HomePage`의 `filterSettings`, `currentLocation`, `savedAddresses` 이동
    - [ ] 필터 변경 및 주소 관리(추가/삭제/선택) 로직을 스토어 액션으로 통합
- [ ] **`useOverlayStore` 신규 생성**
    - [ ] `HamburgerMenu`, `ReviewSheet` 등 오버레이 노출 여부 및 데이터 관리
    - [ ] `HomePage`에서 직접 관리하던 `isOpen` 상태 제거
- [ ] **스토어 위치 및 컨벤션 통일**
    - [ ] 도메인 종속적이지 않은 스토어들을 `src/shared/stores`로 재배치
    - [ ] `useHeaderColorStore`와 `useResultsStore` 간의 역할 및 위치 재검토

---

## 2. 파일별 리팩토링 상세

### `src/pages/HomePage.tsx`
- [ ] **비즈니스 로직 분리**: 음식점 필터링 로직을 커스텀 훅(`useFilteredRestaurants`)으로 추출
- [ ] **상태 구독 전환**: 로컬 `useState`들을 `useSettingsStore` 및 `useOverlayStore` 구독으로 변경
- [ ] **선언적 애니메이션 처리**: `handleSwipe` 내 `setTimeout` 제거 및 `framer-motion`의 콜백 활용 검토
- [ ] **상수 외부화**: `MAX_SELECTIONS`를 전역 설정 파일로 이동

### `src/components/swipe-card.tsx`
- [ ] **커스텀 훅 추출**
    - [ ] `useSwipeGesture`: 복잡한 드래그/잠금/임계값 체크 로직 분리
    - [ ] `useImageColor`: `FastAverageColor` 기반 색상 추출 및 스토어 업데이트 로직 분리
- [ ] **상태 정리**: `opacity` `useState`와 `motionValue` 혼용 정리
- [ ] **임계값 상수화**: 하드코딩된 `SWIPE_THRESHOLD` 등을 별도 파일(`shared/constants/config.ts`)로 분리

### `src/components/hamburger-menu.tsx`
- [ ] **Props Drilling 해결**: 부모로부터 전달받는 상태/핸들러를 스토어 직접 구독으로 변경
- [ ] **컴포넌트 분할**: `FilterToggle`, `AddressItem` 등을 별도 파일로 분리하여 가독성 향상

### `src/features/home/components/HomeHeader.tsx`
- [ ] **스타일 일관성**: 헤더 내 모든 텍스트(로고, 진행도 등)에 `textColor`가 일관되게 적용되도록 수정

---

## 3. 공통 및 아키텍처 개선 (Shared/Common)

- [ ] **배럴 파일(`index.ts`) 도입**: 각 모듈 폴더(`features/home` 등)에 배럴 파일을 추가하여 외부 공개 API 정의
- [ ] **타입 시스템 정리**: `src/lib/types.ts`의 타입들을 도메인별(`restaurant.ts`, `auth.ts` 등)로 분리
- [ ] **상수 관리 중앙화**: 앱 전반의 설정값들을 `src/shared/constants/config.ts`에서 관리
- [ ] **이미지 로딩 처리**: `SwipeCard` 내 이미지 로딩 상태(스켈레톤 등) 피드백 추가
- [ ] **오버레이 루트 일관성**: `ReviewSheet` 등도 `HamburgerMenu`와 같이 `AppLayout`의 오버레이 루트를 사용하도록 통일

---
*마지막 업데이트: 2026-03-14*
