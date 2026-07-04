import { Utensils } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import styles from "./restaurant-photo-placeholder.module.css";

export type RestaurantPhotoVariant = "cover" | "thumbnail" | "thumbnailSm";

interface RestaurantPhotoPlaceholderProps {
  variant?: RestaurantPhotoVariant;
  className?: string;
}

export function RestaurantPhotoPlaceholder({
  variant = "cover",
  className,
}: RestaurantPhotoPlaceholderProps) {
  const showLabel = variant !== "thumbnailSm";
  const label =
    variant === "thumbnail" ? "이미지 없음" : "가게에 올려진 이미지가 없어요.";

  return (
    <div
      className={cn(styles.placeholder, styles[variant], className)}
      role="img"
      aria-label="가게에 올려진 이미지가 없어요."
    >
      <div className={styles.messageGroup}>
        <div className={styles.iconWrap}>
          <Utensils className={styles.icon} aria-hidden="true" />
        </div>
        {showLabel ? <span className={styles.label}>{label}</span> : null}
      </div>
    </div>
  );
}
