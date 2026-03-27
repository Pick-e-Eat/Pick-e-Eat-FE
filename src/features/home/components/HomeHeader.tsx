import { useNavigate } from "react-router-dom";
import styles from "./HomeHeader.module.css";
import { Menu, X } from "lucide-react";

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
    "--header-text-primary": textColor || undefined,
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

      <div className={styles.titleContainer}>
        <h1 className={styles.title}>Pick-e-Eat</h1>
      </div>

      <div className={styles.rightSection}>
        <span className={styles.selectionCount}>
          {results.length}/{maxSelections}
        </span>
        {results.length > 0 && (
          <button
            type="button"
            onClick={() => navigate(routes.results)}
            className={styles.closeButton}
            aria-label="결과 보기"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  );
}
