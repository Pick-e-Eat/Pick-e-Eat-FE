# 기능 명세 및 세부 구현 요약 (FUNCTIONAL_SPEC.md)

## 1. 전체 기능 요약

Pick-e-Eat 프론트엔드 애플리케이션은 사용자가 음식점을 스와이프 방식으로 선택(좋아요/싫어요)할 수 있도록 돕는 MVP 서비스입니다. `React 19`, `TypeScript 5`, `Vite 6`를 기반으로 `framer-motion`을 활용한 풍부한 인터랙션과 `Zustand`, `React Router`를 통한 효율적인 상태 및 라우팅 관리가 특징입니다.

### 주요 기능:
-   **스와이프 기반 음식점 선택**: 카드 형태로 제공되는 음식점 정보를 좌우 스와이프를 통해 선택(좋아요/싫어요)합니다.
-   **동적 UI 피드백**: 스와이프 방향에 따른 시각적 아이콘 피드백 (엄지 위/아래, 댓글, X).
-   **개선된 제스처 처리**: 상하좌우 모든 드래그 제스처를 정교하게 구분하여, 수직 스와이프 시에는 카드가 제자리에서 액션을 트리거합니다.
-   **동적 테마/스타일**: 현재 보이는 카드 이미지의 대표 색상을 추출하여 헤더 배경색에 동적으로 적용합니다.
-   **세션 관리**: 일정 횟수 스와이프 후 결과 화면으로 이동하며, 세션을 초기화하거나 계속 진행할 수 있습니다.
-   **필터링 및 주소 관리**: 햄버거 메뉴를 통해 음식점 필터링 및 자주 가는 주소 관리 기능 제공.

### 주요 기술 스택:
-   **프레임워크**: React 19, TypeScript 5, Vite 6
-   **애니메이션**: framer-motion
-   **상태 관리**: Zustand
-   **라우팅**: React Router v7
-   **UI 컴포넌트**: shadcn/ui, Tailwind CSS v4
-   **색상 추출**: fast-average-color

### 아키텍처:
-   `Atomic Design + Feature 혼합` 아키텍처를 따르며, UI 컴포넌트는 Atomic 계층으로, 비즈니스 로직과 도메인 전용 컴포넌트는 Feature 모듈(`features/{domain}/`)로 분리합니다.

## 2. 페이지별/모듈별 세부 구현 요약

### 2.1. `HomePage` (`src/pages/HomePage.tsx`)
-   **기능 명세**: 애플리케이션의 메인 인터랙티브 뷰입니다. 음식점 카드를 표시하고, 스와이프 제스처를 처리하며, 메뉴 및 결과 화면으로의 접근을 제공합니다.
-   **세부 구현**:
    -   **상태 관리**: `restaurants` 목록, `currentIndex`, `filterSettings`, `currentLocation`, `savedAddresses` 등 페이지의 주요 UI 상태를 `useState`로 관리합니다. 스와이프 결과(`results`)는 `useResultsStore`에서 가져옵니다.
    -   **컴포넌트 렌더링**: `HomeHeader`, `SwipeCard` 컴포넌트 스택(다음 카드가 뒤에서 살짝 보이는 효과), `ReviewSheet`, `HamburgerMenu`를 렌더링합니다.
    -   **제스처 처리**: `SwipeCard`에서 전달되는 `handleSwipe` 콜백을 처리하여 `results` 스토어를 업데이트하고 `currentIndex`를 증가시킵니다. `MAX_SELECTIONS`에 도달하면 `navigate(routes.results)`를 통해 결과 페이지로 이동합니다.
    -   **세션 초기화**: '모든 음식점을 확인했어요!' 메시지 표시 시 `handleStartOver` 함수를 통해 `results` 스토어를 초기화하고 `currentIndex`를 0으로 리셋합니다.

### 2.2. `ResultsPage` (`src/pages/ResultsPage.tsx`)
-   **기능 명세**: 사용자 스와이프 세션의 최종 결과를 표시합니다. 좋아요/싫어요로 구분된 음식점 목록을 보여주고, 세션을 다시 시작하거나 홈 화면으로 돌아갈 수 있는 액션을 제공합니다.
-   **세부 구현**:
    -   **상태 접근**: `useResultsStore`에서 `results` 배열을 직접 가져와 사용합니다.
    -   **데이터 처리**: `results`를 `likedRestaurants`와 `dislikedRestaurants`로 필터링하여 각각의 목록을 렌더링합니다.
    -   **액션 처리**:
        -   `handleReset` 함수를 통해 `resetResults()`를 호출하여 `results` 스토어를 초기화하고 `navigate(routes.home)`으로 홈 페이지로 돌아갑니다.
        -   `handleContinue` 함수를 통해 단순히 `navigate(routes.home)`으로 홈 페이지로 돌아갑니다.
    -   **UI**: `framer-motion`을 활용하여 각 음식점 항목에 부드러운 애니메이션 효과를 적용합니다.

### 2.3. `SwipeCard` (`src/components/swipe-card.tsx`)
-   **기능 명세**: 단일 음식점 카드를 표시하고, 사용자의 모든 드래그 제스처(좌우, 상하)를 감지하여 적절한 액션을 트리거합니다. 드래그 중 시각적 피드백을 제공하고, 카드의 이미지에서 대표 색상을 추출합니다.
-   **세부 구현**:
    -   **`framer-motion` 핵심**: `useMotionValue` (`x`, `y` - 카드의 물리적 위치; `dragX`, `dragY` - 제스처 추적용), `useTransform` (회전, 아이콘 투명도), `animate`를 활용합니다.
    -   **제스처 잠금**: `lockedDirection` (`x` | `y` | `null`) 상태와 `DRAG_LOCK_THRESHOLD`를 사용하여 드래그 시작 시 결정된 방향으로만 제스처를 잠급니다.
    -   **핸들러**:
        -   `handleDragStart`: `lockedDirection` 및 `x`, `y`, `dragX`, `dragY` 값을 초기화합니다.
        -   `handleDrag`: `dragX`, `dragY`를 실시간으로 업데이트하고, `lockedDirection`에 따라 카드의 물리적 `x`, `y` 움직임을 제어하며, `dragX`, `dragY`도 해당 방향으로만 값을 가지도록 제약합니다.
        -   `handleDragEnd`: `lockedDirection`에 따라 `onSwipe`(좌우), `onShowReviews`(위), `onStop`(아래) 중 적절한 콜백을 호출하고, 카드를 제자리로 애니메이션합니다.
    -   **동적 색상 추출**: `isTop`일 때 `FastAverageColor`를 사용하여 `restaurant.image`에서 대표 색상을 추출하고 `useHeaderColorStore`를 업데이트합니다.
    -   **아이콘 피드백**: `dragX`, `dragY` 값에 연동된 투명도를 가진 `ThumbsUp`, `ThumbsDown`, `MessageSquare`, `X` 아이콘을 중앙에 표시합니다. 아이콘은 `fill="currentColor" stroke="none"`으로 채워진 형태입니다.

### 2.4. `HomeHeader` (`src/features/home/components/HomeHeader.tsx`)
-   **기능 명세**: 애플리케이션의 상단 고정 헤더입니다. 메뉴 버튼, 앱 로고, 스와이프 진행도, 결과 페이지 이동 버튼을 포함합니다. 현재 카드 이미지에 따라 배경색이 동적으로 변경됩니다.
-   **세부 구현**:
    -   **상태 접근**: `useResultsStore`에서 스와이프 진행도(`results.length`)를 가져오고, `useHeaderColorStore`에서 `backgroundColor`와 `textColor`를 가져옵니다.
    -   **동적 스타일**: `backgroundColor`와 `textColor`를 `style` 속성을 통해 `<header>` 및 내부 텍스트 요소에 직접 적용합니다. `backdrop-blur-lg`와 함께 `transition` 속성을 추가하여 부드러운 색상 전환 효과를 제공합니다.
    -   **액션 처리**: `onMenuOpen` 콜백을 통해 햄버거 메뉴를 열고, `useNavigate`를 통해 결과 페이지로 이동합니다.
    -   **레이아웃 변경**: 테스트 목적으로 `absolute top-0 left-0 right-0` 스타일을 적용하여 카드 뷰 위로 올라오는 형태로 배치되었습니다.

### 2.5. `useResultsStore` (`src/shared/stores/results-store.ts`)
-   **기능 명세**: 사용자 스와이프 세션의 모든 결과(`SwipeResult[]`)를 관리하는 전역 상태입니다.
-   **세부 구현**: `Zustand` 스토어로, `results` 배열, `addResult` (스와이프 결과 추가), `resetResults` (결과 초기화) 액션을 제공합니다.

### 2.6. `useHeaderColorStore` (`src/features/home/stores/header-color-store.ts`)
-   **기능 명세**: 동적으로 추출된 헤더 배경색과 그에 대비되는 텍스트 색상을 관리하는 전역 상태입니다.
-   **세부 구현**: `Zustand` 스토어로, `backgroundColor`, `textColor`, `setColors` (색상 설정), `resetColors` (색상 초기화) 액션을 제공합니다.

### 2.7. `routes.ts` (`src/shared/constants/routes.ts`)
-   **기능 명세**: 애플리케이션 내 모든 라우트 경로를 중앙에서 관리하는 상수 파일입니다.
-   **세부 구현**: `home: "/"`, `results: "/results"`, `auth.login: "/login"`, `auth.signup: "/signup"` 등 라우트 경로를 `const` 객체로 정의하여 변경 비용을 줄이고 일관성을 유지합니다.

이 문서가 프로젝트의 기능과 구현 세부 사항을 이해하는 데 도움이 되기를 바랍니다.