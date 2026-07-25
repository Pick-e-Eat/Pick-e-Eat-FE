import { RestaurantPhoto } from "@/components/restaurant-photo";
import { cn } from "@/shared/utils/cn";
import styles from "./restaurant-photo-grid.module.css";

interface RestaurantPhotoGridProps {
  photoUrls?: string[] | null;
  photoUrl?: string | null; // Fallback legacy single URL
  alt: string;
  className?: string;
  onUsingPlaceholderChange?: (usingPlaceholder: boolean) => void;
  onPhotoClick?: (index: number) => void;
}

export function RestaurantPhotoGrid({
  photoUrls,
  photoUrl,
  alt,
  className,
  onUsingPlaceholderChange,
  onPhotoClick,
}: RestaurantPhotoGridProps) {
  // Normalize images into an array
  const images = photoUrls && photoUrls.length > 0 ? photoUrls : photoUrl ? [photoUrl] : [];

  if (images.length === 0) {
    return (
      <RestaurantPhoto
        alt={alt}
        className={cn(styles.gridContainer, styles.gridContainerEmpty, className)}
        onUsingPlaceholderChange={onUsingPlaceholderChange}
      />
    );
  }

  const displayImages = images.slice(0, 4);
  const remainingCount = images.length - 4;
  const layoutClass = styles[`layout${Math.min(displayImages.length, 4)}` as keyof typeof styles];

  return (
    <div className={cn(styles.gridContainer, layoutClass, className)}>
      {displayImages.map((url, index) => (
        <button
          // biome-ignore lint/suspicious/noArrayIndexKey: 같은 음식점에 동일 photo_url이 중복될 수 있어 index를 함께 써야 키가 유일해진다
          key={`${url}-${index}`}
          type="button"
          className={styles.photoItem}
          aria-label={`${alt} ${index + 1} 크게 보기`}
          onClick={() => onPhotoClick?.(index)}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <RestaurantPhoto
            photoUrl={url}
            alt={`${alt} ${index + 1}`}
            variant="cover"
            // Only report placeholder status for the first/main image
            onUsingPlaceholderChange={index === 0 ? onUsingPlaceholderChange : undefined}
          />
          {index === 3 && remainingCount > 0 && (
            <div className={styles.moreOverlay}>+{remainingCount}</div>
          )}
        </button>
      ))}
    </div>
  );
}
