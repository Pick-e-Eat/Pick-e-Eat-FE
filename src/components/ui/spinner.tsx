// 로딩 표시용 공통 스피너
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

const SIZE_CLASS = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
} as const;

type SpinnerProps = {
  size?: keyof typeof SIZE_CLASS;
  className?: string;
  /** 스크린리더용 설명. 생략하면 장식 요소로 처리합니다. */
  label?: string;
};

export function Spinner({ size = "md", className, label }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-primary", SIZE_CLASS[size], className)}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
