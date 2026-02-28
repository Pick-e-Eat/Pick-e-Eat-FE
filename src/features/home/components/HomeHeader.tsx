import { useNavigate } from "react-router-dom";
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
    backgroundColor: backgroundColor || "hsl(var(--card) / 0.8)",
    color: textColor || "hsl(var(--card-foreground))",
    transition: "background-color 0.5s ease, color 0.5s ease",
  };
  
  const textPrimaryStyle = {
    color: textColor || "hsl(var(--primary))",
  };

  return (
    <header
      className="relative z-10 flex items-center justify-between px-4 py-3 backdrop-blur-lg"
      style={headerStyle}
    >
      <button
        type="button"
        onClick={onMenuOpen}
        className="rounded-full p-2 hover:bg-muted"
        aria-label="메뉴 열기"
        style={{ color: "inherit" }}
      >
        <Menu className="h-6 w-6" />
      </button>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <h1 className="text-xl font-bold" style={textPrimaryStyle}>
          Pick-e-Eat
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium"
          style={textPrimaryStyle}
        >
          {results.length}/{maxSelections}
        </span>
        {results.length > 0 && (
          <button
            type="button"
            onClick={() => navigate(routes.results)}
            className="rounded-full p-2 hover:bg-destructive/10"
            aria-label="결과 보기"
            style={{ color: "inherit" }}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  );
}
