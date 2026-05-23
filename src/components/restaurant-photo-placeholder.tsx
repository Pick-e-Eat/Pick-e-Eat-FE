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

  return (
    <div
      className={cn(styles.placeholder, styles[variant], className)}
      role="img"
      aria-label="가게에 올려진 이미지가 없어요."
    >
      <Utensils className={styles.icon} aria-hidden="true" />
      {showLabel ? <span className={styles.label}>가게에 올려진 이미지가 없어요.</span> : null}
    </div>
  );
}
