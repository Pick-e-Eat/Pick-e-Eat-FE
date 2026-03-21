# 프로젝트 검토 문서 (PROJECT_REVIEW.md)

## 1. 진행 상황 요약

이 문서는 Pick-e-Eat FE 프로젝트에서 Gemini CLI와 함께 진행한 주요 변경사항과 기능 구현, 그리고 전반적인 코드 리뷰를 다룹니다.

### 주요 구현 및 개선 사항:
-   **Zustand 상태 관리 도입**: `HomePage.tsx`의 로컬 `results` 상태를 `Zustand` 전역 스토어(`useResultsStore`)로 마이그레이션하여 상태 관리의 중앙집중화 및 컴포넌트 간 분리 개선.
-   **React Router 기반 라우팅**: `ResultsScreen` 컴포넌트를 `ResultsPage`로 분리하고 `react-router-dom`을 활용하여 `/results` 경로 라우팅 구현. `HomePage`는 더 이상 조건부 렌더링 대신 라우팅을 통해 페이지 전환.
-   **컴포넌트 분리 및 구조화**:
    -   `HomePage`의 상단 `<header>` 부분을 `HomeHeader` 컴포넌트(`src/features/home/components/HomeHeader.tsx`)로 추출.
    -   프로젝트 아키텍처(`Atomic Design + Feature 혼합`)의 `features/{domain}/components` 컨벤션 준수.
-   **동적 헤더 배경색 기능**:
    -   `fast-average-color` 라이브러리 도입.
    -   `SwipeCard`에서 현재 카드의 이미지로부터 대표 색상을 추출하여 `useHeaderColorStore`(`src/features/home/stores/header-color-store.ts`)에 저장.
    -   `HomeHeader`는 이 스토어의 색상을 구독하여 배경색과 텍스트 색상을 동적으로 변경 (색상 전환 애니메이션 포함).
-   **카드 스택 효과**: `HomePage`에서 `SwipeCard` 렌더링 시 다음 카드가 현재 카드 뒤에 살짝 보이도록 구현 (`SwipeCard`의 `isTop` prop 활용).
-   **강화된 제스처 처리 로직**: `SwipeCard.tsx`에서 `framer-motion`을 이용한 정교한 스와이프 제스처 처리 구현.
    -   **제스처 방향 잠금**: `lockedDirection` 상태를 통해 드래그 시작 시 결정된 방향(x축 또는 y축)으로만 제스처가 유효하도록 제한.
    -   **4방향 스와이프 액션**: 좌우 스와이프 (`onSwipe`), 위로 스와이프 (`onShowReviews`), 아래로 스와이프 (`onStop`) 기능 구현.
    -   수직 스와이프 시 카드는 제자리로 돌아오며 액션만 트리거.
-   **시각적 피드백 아이콘**: 스와이프 방향에 따라 화면 중앙에 `ThumbsUp`, `ThumbsDown`, `MessageSquare`, `X` 아이콘을 표시.
    -   아이콘의 투명도(opacity) 및 나타나는 속도 조정.
    -   모든 아이콘을 `fill="currentColor" stroke="none"`으로 채워진 형태로 변경.
    -   `MessageSquare` 아이콘은 카드 이미지에서 추출한 동적 색상 적용.
-   **버그 수정**:
    -   제스처 처리 로직 개선으로 스와이프 방향 혼동 문제 해결.
    -   `dragX`, `dragY` `motion` 값의 초기화 로직 보강으로 불필요한 아이콘 깜빡임 버그 해결.

## 2. 코드 리뷰: 전체적인 접근 방식 및 컨벤션

### 2.1. 아키텍처 및 폴더 구조
-   **컨벤션 준수**: `프로젝트_초기_세팅_문서.md`에 명시된 `Atomic Design + Feature 혼합` 아키텍처에 충실하게 `src/features/home/components/HomeHeader.tsx`와 `src/features/home/stores/header-color-store.ts`를 생성하여 도메인별 기능 모듈(`features`) 구조를 따랐습니다. 이는 `features/auth` 폴더의 기존 패턴과도 일치합니다.
-   **모듈성 향상**: `HomePage`의 로직과 UI가 효과적으로 분리되어, 각 컴포넌트의 책임이 명확해지고 모듈성이 향상되었습니다.

### 2.2. 상태 관리
-   **`Zustand` 활용**: `useState`를 `Zustand`로 전환하며 클라이언트 상태(UI 관련)를 전역적으로 관리하는 좋은 사례를 만들었습니다. `useResultsStore`, `useHeaderColorStore` 모두 `Zustand` 컨벤션(create, devtools, selector 활용)에 맞춰 작성되었습니다.
-   **단일 책임 원칙**: `results`와 `headerColor`를 각각의 스토어로 분리하여 스토어 또한 단일 책임을 가지도록 설계했습니다.

### 2.3. 라우팅
-   **`react-router-dom` 적용**: `HomePage`의 조건부 렌더링을 라우터 기반 페이지 전환으로 변경하여 애플리케이션의 확장성과 URL 기반의 사용자 경험을 개선했습니다.

### 2.4. UX/UI 및 애니메이션
-   **`framer-motion`의 고급 활용**: `useMotionValue`, `useTransform`, `animate` 등의 `framer-motion` API를 깊이 있게 활용하여 복잡한 제스처 인식과 부드러운 애니메이션 효과를 구현했습니다. 특히 `dragX/dragY`와 `x/y`를 분리하여 제스처와 애니메이션의 간섭을 최소화한 점은 훌륭한 패턴입니다.
-   **시각적 피드백**: 스와이프 방향별 아이콘 피드백 추가는 사용성(Usability)을 크게 향상시켰습니다.

### 2.5. 코드 품질
-   **TypeScript**: 모든 변경사항은 `TypeScript`를 사용하여 타입 안정성을 확보했습니다.
-   **컨벤션 준수**: `named export`, `PascalCase` 컴포넌트명 등 `프로젝트_초기_세팅_문서.md`의 컴포넌트 작성 컨벤션을 준수했습니다.

## 3. 잠재적 개선점 및 고려사항

### 3.1. `SwipeCard.tsx` - `DRAG_LOCK_THRESHOLD` 조정
-   현재 `DRAG_LOCK_THRESHOLD = 5`로 설정되어 있습니다. 이 값은 사용자가 드래그를 시작할 때 축을 결정하는 민감도를 나타냅니다. 실제 사용 환경에서 테스트하여 사용자 경험에 가장 적합한 값으로 미세 조정할 필요가 있습니다.

### 3.2. `SwipeCard.tsx` - 불필요한 `opacity` 상태 제거
-   `SwipeCard` 컴포넌트 내부에 `const [opacity, setOpacity] = useState(1);` 상태가 있지만, 현재 `motion.div`의 `style`에 `opacity` (`style={{ x, y, rotate, opacity }}`)를 직접 사용하는 대신 `animate(x, to, {...}); setOpacity(0);`와 같이 `setOpacity(0)`만 호출하고 있습니다. 이는 `opacity` `useState`가 불필요하게 사용되고 있음을 의미합니다. `motion.div`의 `opacity`는 `framer-motion`의 `animate` 함수에서 직접 제어하거나, `useTransform`을 사용하여 드래그 값에 연동시키는 것이 더 일관성이 있습니다. 현재 `opacity` `useState`는 제거를 고려할 수 있습니다.

### 3.3. `HomeHeader.tsx` - `textPrimaryStyle`의 `hsl()` 값
-   `textPrimaryStyle`에서 `backgroundColor`의 `textColor`는 `backgroundColor`가 없으면 `hsl(var(--card-foreground))`를 사용하는데, `textPrimaryStyle`의 `color`는 `hsl(var(--primary))`를 사용합니다. `Pick-e-Eat` 로고와 `results.length/maxSelections` 텍스트가 헤더 배경색에 따라 잘 보이도록 `textColor` 값을 `textPrimaryStyle`에도 적용하는 것이 일관성을 높일 수 있습니다. (예: `color: textColor || "hsl(var(--primary))"`)

### 3.4. 성능 최적화 (선택 사항)
-   `FastAverageColor`는 이미지 로딩 및 분석에 비용이 드는 작업입니다. 현재 최상위 카드가 변경될 때마다 실행되는데, 필요하다면 추출된 색상을 캐싱하는 로직을 추가하여 불필요한 재계산을 줄일 수 있습니다.

### 3.5. `ReviewSheet` 및 `HamburgerMenu` 컴포넌트 위치
-   현재 `HomePage` 하단에 항상 렌더링되고 `isOpen` prop으로 표시 여부를 제어합니다. 대규모 애플리케이션에서는 이들을 라우팅 기반의 별도 모달/오버레이로 관리하거나, 글로벌 UI 스토어에서 상태를 관리하는 것이 더 효율적일 수 있습니다. MVP 단계에서는 현재 방식도 유효합니다.

## 4. 최종 의견

전반적으로 복잡한 요구사항들을 `framer-motion`과 `Zustand`의 특징을 잘 활용하여 매우 효과적으로 구현했습니다. 특히 제스처 처리 로직과 동적 UI 피드백은 사용자 경험을 크게 향상시킬 것입니다. 프로젝트의 아키텍처 컨벤션도 잘 지켜졌으며, 견고한 코드 품질을 유지하고 있습니다.

이 문서가 코드베이스 이해와 향후 개발에 도움이 되기를 바랍니다.