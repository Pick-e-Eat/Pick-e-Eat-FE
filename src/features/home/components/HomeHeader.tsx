import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

import { routes } from "@/shared/constants/routes";
import { useResultsStore } from "@/shared/stores/results-store";

interface HomeHeaderProps {
  onMenuOpen: () => void;
  maxSelections: number;
}

export function HomeHeader({ onMenuOpen, maxSelections }: HomeHeaderProps) {
  const navigate = useNavigate();
  const { results } = useResultsStore();

  return (
    <header className="relative z-10 flex items-center justify-between bg-card/80 px-4 py-3 backdrop-blur-lg">
      <button
        type="button"
        onClick={onMenuOpen}
        className="rounded-full p-2 text-card-foreground hover:bg-muted"
        aria-label="메뉴 열기"
      >
        <Menu className="h-6 w-6" />
      </button>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <h1 className="text-xl font-bold text-primary">Pick-e-Eat</h1>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {results.length}/{maxSelections}
        </span>
        {results.length > 0 && (
          <button
            type="button"
            onClick={() => navigate(routes.results)}
            className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="결과 보기"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  );
}
