// 상태를 간결하게 표시하는 최소 UI 컴포넌트
import { cn } from "@/shared/utils/cn";

interface StatusBadgeProps {
  label: string;
  tone?: "success" | "warning" | "neutral";
}

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  const toneClass = {
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    neutral: "bg-slate-100 text-slate-700",
  }[tone];

  return (
    <span className={cn("rounded-full px-2 py-1 text-xs font-medium", toneClass)}>
      {label}
    </span>
  );
}
