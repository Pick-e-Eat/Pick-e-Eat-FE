# 개선점 도출 문서 (IMPROVEMENT_AREAS.md)

이 문서는 현재까지 구현된 코드베이스를 기반으로, 구조적 및 기능적으로 향후 개선이 필요하거나 고려해볼 만한 영역들을 정리합니다.

## 1. 구조적 개선점

### 1.1. `SwipeCard.tsx` 내 `opacity` `useState` 제거
-   **현황**: `SwipeCard.tsx` 컴포넌트 내부에 `const [opacity, setOpacity] = useState(1);` 상태가 선언되어 있지만, 실제 카드의 물리적 `opacity`는 `motion.div`의 `animate` prop이나 `setOpacity(0)` 호출을 통해 `framer-motion`이 직접 제어하고 있습니다. 이 `useState`는 현재 사용되지 않아 제거할 수 있습니다.
-   **개선 방향**: 불필요한 `useState`를 제거하여 코드의 간결성을 높이고 혼동을 방지합니다.

### 1.2. `HomeHeader` 텍스트 스타일 일관성
-   **현황**: `HomeHeader.tsx`에서 동적 배경색(`backgroundColor`)에 따라 텍스트 색상(`textColor`)이 스토어에서 제공됩니다. 그러나 헤더 내부의 일부 텍스트 (`h1`의 `Pick-e-Eat`, `span`의 스와이프 진행도)는 `textPrimaryStyle`이라는 별도의 스타일 객체를 통해 `textColor`를 사용하거나 `hsl(var(--primary))`를 폴백으로 사용합니다. 이는 `textColor`가 `#fff` 또는 `#000`으로 고정되어 이미지 밝기에 대비되도록 설계된 것과 완전히 일치하지 않을 수 있습니다.
-   **개선 방향**: `HomeHeader` 내부의 모든 텍스트 관련 요소들도 동적으로 결정된 `textColor` (흰색 또는 검은색)를 우선적으로 사용하도록 통일하여, 헤더 배경색과 텍스트의 대비를 항상 최적화해야 합니다.

### 1.3. `features/home` 모듈의 배럴 파일(`index.ts`) 도입
-   **현황**: `프로젝트_초기_세팅_문서.md`의 프로젝트 구조에 따르면 `features/{domain}`에는 배럴 파일(`index.ts`)을 두어 외부 공개 API를 관리하는 컨벤션이 있습니다. `features/home`은 현재 `HomeHeader` 컴포넌트와 `header-color-store`를 포함하고 있으나 `index.ts` 파일이 없습니다.
-   **개선 방향**: `features/home/index.ts` 파일을 생성하여 `HomeHeader` 컴포넌트와 `useHeaderColorStore`를 export 하도록 하여 컨벤션을 준수하고 모듈의 응집성을 높입니다.

### 1.4. 중앙 집중식 상수 관리
-   **현황**: `MAX_SELECTIONS`와 같은 상수가 `HomePage.tsx` 내부에 직접 선언되어 있습니다.
-   **개선 방향**: 전역적으로 사용되거나 여러 도메인에서 참조될 가능성이 있는 상수들은 `src/shared/constants` 폴더나 `features/home/constants` 폴더 내 별도 파일로 분리하여 관리하면 가독성과 유지보수성이 향상됩니다.

## 2. 기능적 개선점

### 2.1. `SwipeCard.tsx`의 임계값 설정
-   **현황**: `SWIPE_THRESHOLD`, `Y_SWIPE_THRESHOLD`, `Y_SWIPE_DOWN_THRESHOLD`, `DRAG_LOCK_THRESHOLD`와 같은 임계값들이 하드코딩된 매직 넘버 형태로 존재합니다.
-   **개선 방향**: 이 값들을 컴포넌트의 상단에서 상수로 정의하거나, 필요에 따라 외부에서 `props`로 주입받을 수 있도록 변경하여 조정의 용이성과 코드 가독성을 높일 수 있습니다. 특히 `DRAG_LOCK_THRESHOLD`는 사용자 경험에 큰 영향을 미치므로, 실제 사용자의 피드백을 통해 최적화할 필요가 있습니다.

### 2.2. 동적 색상 추출 실패 시 처리
-   **현황**: `SwipeCard.tsx`에서 `FastAverageColor`가 색상 추출에 실패했을 경우 `console.error`로만 처리하고 있습니다.
-   **개선 방향**: 사용자에게 시각적으로 오류를 알리거나, 헤더 색상을 기본값(예: `--card` 색상)으로 강제 설정하는 등 더 견고한 오류 처리 메커니즘을 추가해야 합니다.

### 2.3. 이미지 로딩 및 오류 상태 피드백
-   **현황**: `SwipeCard` 컴포넌트는 `restaurant.image`가 로딩 중이거나 오류가 발생했을 때 별도의 시각적 피드백을 제공하지 않습니다.
-   **개선 방향**: 이미지 로딩 중에는 스켈레톤 UI나 로딩 스피너를 표시하고, 이미지 로드 실패 시에는 플레이스홀더 이미지 또는 오류 메시지를 표시하여 사용자 경험을 개선할 수 있습니다.

### 2.4. 전역 UI 상태 관리 (`ReviewSheet`, `HamburgerMenu`)
-   **현황**: `ReviewSheet`와 `HamburgerMenu`는 `HomePage` 내부에 렌더링되며 `isOpen`이라는 로컬 상태에 의해 제어됩니다.
-   **개선 방향**: 이 컴포넌트들은 앱 전반에 걸쳐 사용될 수 있는 오버레이 UI입니다. 이를 `Zustand`와 같은 전역 UI 스토어를 통해 관리하거나, `react-router-dom`의 모달 라우팅 기능을 활용하여 구현하면 더 유연하고 확장 가능한 구조를 만들 수 있습니다. 이렇게 하면 어떤 컴포넌트에서든 오버레이를 열 수 있게 되며, URL을 통한 접근성도 확보할 수 있습니다.

### 2.5. 필터 설정의 중앙 관리
-   **현황**: `filterSettings`는 현재 `HomePage` 내 `useState`로 관리됩니다.
-   **개선 방향**: 만약 필터 설정이 다른 페이지나 컴포넌트에도 영향을 미치거나, 세션 간에 유지되어야 한다면, 이를 `Zustand` 스토어로 분리하여 전역적으로 관리하는 것이 적절합니다.

## 3. 결론

현재까지의 구현은 `framer-motion`과 `Zustand`를 효과적으로 사용하여 복잡한 인터랙션과 상태 관리를 성공적으로 처리했습니다. 위에 제시된 개선점들은 대부분 코드의 유지보수성, 확장성, 견고성 및 사용자 경험을 더욱 향상시키기 위한 제안입니다. 프로젝트의 다음 단계에서 이러한 점들을 점진적으로 반영해 나가는 것을 고려해볼 수 있습니다.