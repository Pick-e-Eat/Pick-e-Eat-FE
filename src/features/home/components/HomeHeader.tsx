import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHeaderColorStore } from "@/features/home/stores/header-color-store";

import { routes } from "@/shared/constants/routes";
import { getBatchProgress, useResultsStore } from "@/shared/stores/results-store";
import styles from "./HomeHeader.module.css";

interface HomeHeaderProps {
  onMenuOpen: () => void;
}

export function HomeHeader({ onMenuOpen }: HomeHeaderProps) {
  const navigate = useNavigate();
  const { results, sessionBatchStart, sessionBatchEnd } = useResultsStore();
  const { current: batchProgress, max: batchMax } = getBatchProgress({
    results,
    sessionBatchStart,
    sessionBatchEnd,
  });
  const { backgroundColor, textColor } = useHeaderColorStore();

  const headerStyle = {
    "--header-bg": backgroundColor ? `${backgroundColor}CC` : undefined,
    "--header-text": textColor || undefined,
  } as React.CSSProperties;

  return (
    <header className={styles.header} style={headerStyle}>
      <button
        type="button"
        onClick={onMenuOpen}
        className={styles.menuButton}
        aria-label="메뉴 열기"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className={styles.rightSection}>
        <div
          className={styles.pickProgress}
          role="status"
          aria-label={`고른 맛집 ${batchProgress}곳, 최대 ${batchMax}곳`}
        >
          <span className={styles.pickProgressInner}>
            <span className={styles.pickProgressCurrent}>{batchProgress}</span>
            <span className={styles.pickProgressSep} aria-hidden="true">
              /
            </span>
            <span className={styles.pickProgressMax}>{batchMax}</span>
          </span>
        </div>
        {results.length > 0 && (
          <button
            type="button"
            onClick={() => navigate(routes.results)}
            className={styles.stopButton}
            aria-label="중단하고 결과 화면으로 이동"
          >
            중단하기
          </button>
        )}
      </div>
    </header>
  );
}
