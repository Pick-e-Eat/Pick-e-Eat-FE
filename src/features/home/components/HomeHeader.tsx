import { useNavigate } from "react-router-dom";
import styles from "./HomeHeader.module.css";
import { Menu } from "lucide-react";

import { routes } from "@/shared/constants/routes";
import { useResultsStore } from "@/shared/stores/results-store";
import { useHeaderColorStore } from "@/features/home/stores/header-color-store";

interface HomeHeaderProps {
  onMenuOpen: () => void;
  maxSelections: number;
}

export function HomeHeader({ onMenuOpen, maxSelections }: HomeHeaderProps) {
  const navigate = useNavigate();
  const { results } = useResultsStore();
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
          aria-label={`고른 맛집 ${results.length}곳, 최대 ${maxSelections}곳`}
        >
          <span className={styles.pickProgressInner}>
            <span className={styles.pickProgressCurrent}>{results.length}</span>
            <span className={styles.pickProgressSep} aria-hidden="true">
              /
            </span>
            <span className={styles.pickProgressMax}>{maxSelections}</span>
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
