import { useEffect, useState } from "react";
import {
  RestaurantPhotoPlaceholder,
  type RestaurantPhotoVariant,
} from "@/components/restaurant-photo-placeholder";
import { cn } from "@/shared/utils/cn";
import styles from "./restaurant-photo.module.css";

interface RestaurantPhotoProps {
  photoUrl?: string | null;
  alt: string;
  variant?: RestaurantPhotoVariant;
  className?: string;
  onUsingPlaceholderChange?: (usingPlaceholder: boolean) => void;
}

export function RestaurantPhoto({
  photoUrl,
  alt,
  variant = "cover",
  className,
  onUsingPlaceholderChange,
}: RestaurantPhotoProps) {
  return (
    <RestaurantPhotoInner
      key={photoUrl ?? "missing"}
      photoUrl={photoUrl}
      alt={alt}
      variant={variant}
      className={className}
      onUsingPlaceholderChange={onUsingPlaceholderChange}
    />
  );
}

function RestaurantPhotoInner({
  photoUrl,
  alt,
  variant = "cover",
  className,
  onUsingPlaceholderChange,
}: RestaurantPhotoProps) {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !photoUrl || failed;

  useEffect(() => {
    onUsingPlaceholderChange?.(showPlaceholder);
  }, [onUsingPlaceholderChange, showPlaceholder]);

  if (showPlaceholder) {
    return <RestaurantPhotoPlaceholder variant={variant} className={className} />;
  }

  return (
    <img
      src={photoUrl}
      alt={alt}
      className={cn(styles.photo, styles[variant], className)}
      onError={() => setFailed(true)}
    />
  );
}
