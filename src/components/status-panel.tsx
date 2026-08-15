import { AlertTriangle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import styles from "./status-panel.module.css";

type StatusPanelProps = {
  /** 한 줄 요약 (예: "맛집을 찾고 있어요") */
  message: string;
  /** 보조 설명 — 생략 가능 */
  description?: string;
};

/**
 * 카드 영역을 대신 채우는 공통 로딩 패널.
 * 메인·결과 등 화면 전체가 대기 상태일 때 같은 모양으로 쓰기 위한 모듈입니다.
 */
export function LoadingPanel({ message, description }: StatusPanelProps) {
  return (
    <div className={styles.container} role="status" aria-live="polite">
      <div className={styles.panel}>
        <span className={styles.iconBadge}>
          <Spinner size="lg" />
        </span>
        <p className={styles.message}>{message}</p>
        {description && <p className={styles.description}>{description}</p>}
      </div>
    </div>
  );
}

type ErrorPanelProps = StatusPanelProps & {
  /** 재시도 등 후속 동작 — actionLabel과 onAction을 함께 넘길 때만 버튼이 노출됩니다 */
  actionLabel?: string;
  onAction?: () => void;
};

/** 로딩 패널과 같은 레이아웃을 쓰는 공통 오류 패널 */
export function ErrorPanel({ message, description, actionLabel, onAction }: ErrorPanelProps) {
  return (
    <div className={styles.container} role="alert">
      <div className={styles.panel}>
        <span className={styles.errorIconBadge}>
          <AlertTriangle className="size-6" aria-hidden />
        </span>
        <p className={styles.message}>{message}</p>
        {description && <p className={styles.description}>{description}</p>}
        {actionLabel && onAction && (
          <button type="button" className={styles.actionButton} onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
