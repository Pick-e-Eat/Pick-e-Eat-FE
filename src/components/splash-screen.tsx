import { useEffect, useState } from "react";
import { cn } from "@/shared/utils/cn";
import styles from "./splash-screen.module.css";

/** Tailwind `sm`과 동일: 이 너비 미만이면 모바일 레이아웃으로 간주 */
const MOBILE_MEDIA = "(max-width: 639px)";

const DISPLAY_MS = 3000;
const FADE_MS = 350;
/** 워드마크와 함께 화면이 뜬 뒤, 위쪽 문구가 나타나기까지 */
const TAGLINE_DELAY_MS = 800;

function isMobileViewport(): boolean {
  return typeof window !== "undefined" && window.matchMedia(MOBILE_MEDIA).matches;
}

/**
 * 모바일 폭에서만 페이지(앱)를 열 때마다 잠시 표시. 데스크톱에서는 렌더하지 않음.
 */
export function SplashScreen() {
  const [mounted, setMounted] = useState(() => {
    if (typeof window === "undefined") return false;
    return isMobileViewport();
  });
  const [opacity, setOpacity] = useState(() => {
    if (typeof window === "undefined") return 0;
    return isMobileViewport() ? 1 : 0;
  });
  const [taglineVisible, setTaglineVisible] = useState(false);

  useEffect(() => {
    if (!isMobileViewport()) {
      setMounted(false);
      return;
    }

    const taglineTimer = window.setTimeout(() => {
      setTaglineVisible(true);
    }, TAGLINE_DELAY_MS);

    const hideTimer = window.setTimeout(() => {
      setOpacity(0);
    }, DISPLAY_MS);

    const unmountTimer = window.setTimeout(() => {
      setMounted(false);
    }, DISPLAY_MS + FADE_MS);

    return () => {
      window.clearTimeout(taglineTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(unmountTimer);
    };
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-10000 flex items-center justify-center bg-primary transition-opacity ease-out"
      style={{
        opacity,
        transitionDuration: `${FADE_MS}ms`,
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      role="status"
      aria-label="Pick-e-Eat, 랜덤 맛집 추천서비스"
    >
      <div className={styles.stack}>
        <p className={cn(styles.tagline, taglineVisible && styles.taglineVisible)}>
          랜덤 맛집 추천서비스
        </p>
        <h1 className={styles.wordmark} aria-label="Pick-e-Eat">
          <span className={styles.wordPick}>Pick</span>
          <span className={styles.wordGlue} aria-hidden="true">
            -e-
          </span>
          <span className={styles.wordEat}>Eat</span>
        </h1>
      </div>
    </div>
  );
}
