# `HomePage.tsx` 코드 분석

## 파일 위치

`src/pages/HomePage.tsx`

## 1. 주요 기능

이 파일은 `Pick-e-Eat` 애플리케이션의 메인 페이지를 구성합니다. 사용자에게 음식점 정보를 카드 형태로 보여주고, 사용자는 틴더(Tinder)와 유사한 스와이프 인터페이스를 통해 '좋아요' 또는 '싫어요'를 선택할 수 있습니다. 총 10개의 선택을 완료하면 결과 화면으로 이동합니다.

## 2. 상태 관리 (State Management)

`useState` 훅을 사용하여 컴포넌트의 다양한 상태를 관리합니다.

-   `restaurants`: `mockRestaurants` 데이터로 초기화된 전체 음식점 목록입니다.
-   `currentIndex`: 현재 화면에 표시되는 `filteredRestaurants` 배열의 인덱스입니다.
-   `results`: 사용자의 스와이프 결과(`{ restaurant, liked }`)를 저장하는 배열입니다.
-   `showResults`: 결과 화면(`ResultsScreen`)의 표시 여부를 제어하는 boolean 값입니다.
-   `showReviews`: 음식점 상세 리뷰(`ReviewSheet`)의 표시 여부를 제어하는 boolean 값입니다.
-   `menuOpen`: 햄버거 메뉴(`HamburgerMenu`)의 표시 여부를 제어하는 boolean 값입니다.
-   `currentLocation`: 현재 설정된 사용자 위치 주소 문자열입니다.
-   `filterSettings`: 검색 거리, 주차 여부 등 필터링 옵션을 담는 객체입니다.
-   `savedAddresses`: 사용자가 저장한 주소 목록입니다.
-   `exitDirection`: 카드 스와이프 애니메이션의 방향(`left` 또는 `right`)을 제어합니다.

## 3. 주요 로직 및 함수

-   **`filteredRestaurants`**: `filterSettings` 상태에 따라 `restaurants` 배열을 동적으로 필터링하여 생성되는 파생 배열입니다.
-   **`handleSwipe`**: 카드가 스와이프될 때 호출되는 핵심 함수입니다. 결과를 `results` 상태에 추가하고, 다음 카드를 보여주기 위해 `currentIndex`를 업데이트합니다. `MAX_SELECTIONS`(10개)에 도달하면 `showResults`를 `true`로 설정하여 결과 화면을 표시합니다.
-   **`handleReset`**: 모든 상태를 초기화하여 스와이프를 처음부터 다시 시작합니다.
-   **주소 관리 함수 (`handleAddAddress` 등)**: `HamburgerMenu` 컴포넌트에 props로 전달되어 주소 추가, 삭제, 선택 기능을 수행합니다.

## 4. 렌더링 (Rendering)

-   **조건부 렌더링**:
    -   `showResults`가 `true`이면 `ResultsScreen` 컴포넌트를 렌더링하여 스와이프 결과를 보여줍니다.
    -   스와이프할 카드가 더 이상 없으면 "모든 음식점을 확인했어요!" 메시지와 함께 "다시 시작하기" 버튼을 표시합니다.
-   **레이아웃**:
    -   **Header**: 메뉴 버튼, 앱 로고(`Pick-e-Eat`), 스와이프 진행도(`{results.length}/{MAX_SELECTIONS}`)를 표시합니다.
    -   **Main Content**: `framer-motion`의 `AnimatePresence`를 사용하여 `SwipeCard` 컴포넌트에 애니메이션 효과를 적용합니다.
    -   **Footer**: '싫어요'(`ThumbsDown`), '좋아요'(`ThumbsUp`) 버튼을 포함하며, 각 버튼은 `handleSwipe` 함수를 호출합니다.
-   **오버레이 컴포넌트**:
    -   `ReviewSheet`: 음식점 상세 리뷰를 보여주는 Bottom Sheet 형태의 컴포넌트입니다.
    -   `HamburgerMenu`: 필터 설정, 주소 관리 등 다양한 메뉴를 포함하는 Drawer 형태의 컴포넌트입니다.

## 5. 사용된 주요 컴포넌트 및 라이브러리

-   **자체 제작 컴포넌트**:
    -   `SwipeCard`: 음식점 정보를 표시하고 스와이프 이벤트를 처리하는 카드 UI.
    -   `ReviewSheet`: 음식점 리뷰를 보여주는 UI.
    -   `HamburgerMenu`: 필터, 주소 관리 등 사이드 메뉴 UI.
    -   `ResultsScreen`: 최종 스와이프 결과를 보여주는 UI.
-   **외부 라이브러리**:
    -   `lucide-react`: 아이콘 (`Menu`, `X`, `ThumbsUp` 등).
    -   `framer-motion`: 카드 스와이프와 같은 UI 인터랙션 애니메이션을 구현.
