import {
  animate,
  type MotionValue,
  motion,
  type PanInfo,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Car, Dog, Heart, HeartCrack, MapPinned, Navigation, Star, Users, X, Images } from "lucide-react";
import { useEffect, useState } from "react";
import { RestaurantPhotoGrid } from "@/components/restaurant-photo-grid";
import { ImageGalleryModal } from "@/components/image-gallery-modal";
import { useHeaderColorStore } from "@/features/home/stores/header-color-store";
import type { Restaurant } from "@/lib/types";
import { cn } from "@/shared/utils/cn";
import styles from "./swipe-card.module.css";

const SWIPE_THRESHOLD = 100;
const Y_SWIPE_DOWN_THRESHOLD = 100; // Swipe down threshold (positive y)
const EXIT_OFFSET = 520;
const EXIT_FALL_Y = 200;
const EXIT_TILT_DEG = 34;
const MAX_DRAG_TILT = 22;
const DRAG_LOCK_THRESHOLD = 5; // Pixels to determine initial drag direction

function clampTilt(offsetX: number) {
  return Math.max(-MAX_DRAG_TILT, Math.min(MAX_DRAG_TILT, (offsetX / 170) * 20));
}

interface SwipeCardProps {
  restaurant: Restaurant;
  onSwipe: (direction: "left" | "right") => void;
  onStop: () => void;
  isTop?: boolean;
  exitDirection?: "left" | "right" | null;
}

interface AdvancedOverlayProps {
  motionValue: MotionValue<number>;
  direction: "right" | "left" | "down";
  range: number;
  icon: React.ElementType;
  className: string;
  iconClassName?: string;
}

const AdvancedOverlay = ({
  motionValue,
  direction,
  range,
  icon: Icon,
  className,
  iconClassName,
}: AdvancedOverlayProps) => {
  // 1. 투명도: 0 -> 1 (더 빠르게 나타나도록 설정)
  const opacity = useTransform(motionValue, [0, range * 0.6], [0, 1]);

  // 2. 크기: 0.5배 -> 1.2배 -> 1배 (튕기는 느낌)
  const scale = useTransform(motionValue, [0, range * 0.7, range], [0.5, 1.2, 1]);

  // 3. 회전: 살짝 회전하면서 등장 (좌우 스와이프 시에만 적용)
  const rotateRange = direction === "right" ? [-15, 0] : direction === "left" ? [15, 0] : [0, 0];
  const rotate = useTransform(motionValue, [0, range], rotateRange);

  return (
    <motion.div
      className={cn(styles.overlayContainer, className)}
      style={{ opacity, scale, rotate }}
    >
      <Icon className={cn(styles.overlayIcon, iconClassName)} />
    </motion.div>
  );
};

export function SwipeCard({
  restaurant,
  onSwipe,
  onStop,
  isTop = true,
  exitDirection = null,
}: SwipeCardProps) {
  const [lockedDirection, setLockedDirection] = useState<"x" | "y" | null>(null);
  const [usingPlaceholder, setUsingPlaceholder] = useState(!restaurant.photo_url);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Motion values for card's physical position on screen
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const cardRotate = useMotionValue(0);
  const cardScale = useMotionValue(1);
  const cardOpacity = useMotionValue(1);
  /** 드래그 중 살짝 키워 덱 위로 떠 있는 느낌 */
  const liftScale = useMotionValue(1);
  const displayScale = useTransform(
    [cardScale, liftScale],
    ([s, l]) => (s as number) * (l as number),
  );

  // Motion values for tracking user's raw gesture offset (for feedback icons)
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  const isExiting = exitDirection !== null;
  const { resetColors } = useHeaderColorStore();

  // 스와이프 확정 후: 옆으로 밀리며 아래로 떨어지는 느낌 + 살짝 축소·페이드
  useEffect(() => {
    if (!isExiting) return;
    liftScale.set(1);
    const toX = exitDirection === "right" ? EXIT_OFFSET : -EXIT_OFFSET;
    const toRotate = exitDirection === "right" ? EXIT_TILT_DEG : -EXIT_TILT_DEG;
    const springOut = { type: "spring" as const, stiffness: 220, damping: 26, mass: 0.9 };
    animate(x, toX, springOut);
    animate(y, EXIT_FALL_Y, { ...springOut, stiffness: 260, damping: 30 });
    animate(cardRotate, toRotate, { ...springOut, stiffness: 200, damping: 24 });
    animate(cardScale, 0.88, { type: "spring", stiffness: 280, damping: 32 });
    void animate(cardOpacity, 0, { duration: 0.42, ease: [0.4, 0, 1, 1] });
  }, [isExiting, exitDirection, x, y, cardRotate, cardScale, cardOpacity, liftScale]);

  // Extract color from image when card is on top
  useEffect(() => {
    if (isTop) {
      // const fac = new FastAverageColor();
      if (!restaurant.photo_url) return () => resetColors();

      return () => {
        resetColors();
      };
    }
  }, [isTop, restaurant.photo_url, resetColors]);

  // Explicitly reset drag gesture motion values when card state changes due to non-drag events
  useEffect(() => {
    dragX.set(0);
    dragY.set(0);
  }, [dragX, dragY]);

  const handleDragStart = () => {
    setLockedDirection(null); // Reset locked direction for a new drag
    // Also reset physical card position if it somehow drifted
    x.set(0);
    y.set(0);
    cardRotate.set(0);
    cardScale.set(1);
    cardOpacity.set(1);
    liftScale.set(1);
    void animate(liftScale, 1.07, { type: "spring", stiffness: 420, damping: 28 });
    // Reset gesture tracking motion values at the start of a drag
    dragX.set(0);
    dragY.set(0);
  };

  const handleDrag = (_: MouseEvent | TouchEvent, info: PanInfo) => {
    // Update gesture tracking motion values with raw offset
    dragX.set(info.offset.x);
    dragY.set(info.offset.y);

    if (lockedDirection === null) {
      // Determine lock direction after initial movement threshold
      if (
        Math.abs(info.offset.x) > DRAG_LOCK_THRESHOLD ||
        Math.abs(info.offset.y) > DRAG_LOCK_THRESHOLD
      ) {
        if (Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
          setLockedDirection("x");
        } else if (info.offset.y > 0) {
          // Only lock to Y if dragging DOWN (PASS gesture)
          setLockedDirection("y");
        }
      }
    }

    // Now, constrain *both* actual card motion AND gesture tracking motion to locked direction
    if (lockedDirection === "y") {
      y.set(Math.max(0, info.offset.y)); // Card moves Y (only down)
      x.set(0); // Card X is 0
      cardRotate.set(0);
      dragX.set(0); // Gesture tracking X is 0 if locked to Y
      dragY.set(Math.max(0, info.offset.y)); // Ensure overlay also stays at 0 or positive
    } else if (lockedDirection === "x") {
      x.set(info.offset.x); // Card moves X
      y.set(0); // Card Y is 0
      cardRotate.set(clampTilt(info.offset.x));
      dragY.set(0); // Gesture tracking Y is 0 if locked to X
    } else {
      // If direction not yet locked, card moves freely within DRAG_LOCK_THRESHOLD
      x.set(info.offset.x);
      // Even before lock, we can prevent moving up if we're sure we want to remove it
      y.set(Math.max(0, info.offset.y));
      // y.set(info.offset.y); TODO 검토 필요 위에걸로 대체함
      cardRotate.set(clampTilt(info.offset.x));
    }
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset } = info;

    if (lockedDirection === "y") {
      if (offset.y > Y_SWIPE_DOWN_THRESHOLD) {
        onStop();
      }
      // Animate card back to center after any vertical swipe
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
      animate(y, 0, { type: "spring", stiffness: 500, damping: 30 });
      animate(cardRotate, 0, { type: "spring", stiffness: 500, damping: 30 });
      animate(liftScale, 1, { type: "spring", stiffness: 400, damping: 32 });
    } else if (lockedDirection === "x") {
      if (offset.x > SWIPE_THRESHOLD) {
        onSwipe("right");
      } else if (offset.x < -SWIPE_THRESHOLD) {
        onSwipe("left");
      } else {
        // Animate card back if not swiped far enough horizontally
        animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
        animate(y, 0, { type: "spring", stiffness: 500, damping: 30 });
        animate(cardRotate, 0, { type: "spring", stiffness: 500, damping: 30 });
        animate(liftScale, 1, { type: "spring", stiffness: 400, damping: 32 });
      }
    } else {
      // No significant drag occurred to lock a direction, animate back
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
      animate(y, 0, { type: "spring", stiffness: 500, damping: 30 });
      animate(cardRotate, 0, { type: "spring", stiffness: 500, damping: 30 });
      animate(liftScale, 1, { type: "spring", stiffness: 400, damping: 32 });
    }

    setLockedDirection(null); // Reset locked direction for the next drag
    dragX.set(0); // Reset gesture tracking motion values
    dragY.set(0);
  };

  const openInMaps = (latitude: number, longitude: number) => {
    const q = encodeURIComponent(`${latitude},${longitude}`);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${q}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const openRestaurantInMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    const mapsUrl =
      restaurant.google_maps_links?.place_uri ??
      restaurant.google_maps_uri ??
      restaurant.kakao_map_uri;

    if (mapsUrl) {
      window.open(mapsUrl, "_blank", "noopener,noreferrer");
      return;
    }

    openInMaps(restaurant.latitude, restaurant.longitude);
  };

  const openGallery = (e: React.MouseEvent, index = 0) => {
    e.stopPropagation();
    setSelectedImageIndex(index);
    setIsGalleryOpen(true);
  };

  const dragEnabled = isTop && !isExiting;
  const images = restaurant.photo_urls && restaurant.photo_urls.length > 0 
    ? restaurant.photo_urls 
    : restaurant.photo_url ? [restaurant.photo_url] : [];

  return (
    <>
      <motion.div
        className={styles.cardWrapper}
        style={{
          x,
          y,
          rotate: cardRotate,
          scale: displayScale,
          opacity: cardOpacity,
          zIndex: isTop ? 30 : 1,
        }}
        drag={!!dragEnabled} // Allow dragging in both directions initially
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.2, left: 1, right: 1 }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      >
        {/* Card Container */}
        <div className={styles.cardContainer}>
          {/* Background Image */}
          <RestaurantPhotoGrid
            photoUrls={restaurant.photo_urls}
            photoUrl={restaurant.photo_url}
            alt={`${restaurant.name} 대표 사진`}
            className={styles.backgroundImage}
            onUsingPlaceholderChange={setUsingPlaceholder}
            onPhotoClick={(index) => {
              setSelectedImageIndex(index);
              setIsGalleryOpen(true);
            }}
          />

          {!usingPlaceholder ? <div className={styles.gradientOverlay} /> : null}
          {usingPlaceholder ? <div className={styles.placeholderOverlay} /> : null}

          {/* Action Buttons Container */}
          {isTop && !isExiting && (
            <div
              className={cn(
                styles.actionButtonsContainer,
                usingPlaceholder && styles.actionButtonsOnPlaceholder,
              )}
            >
              <button
                type="button"
                className={styles.actionButton}
                onClick={openRestaurantInMaps}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label="지도에서 보기"
              >
                <MapPinned className={styles.actionIcon} />
              </button>
              
              {!usingPlaceholder && images.length > 0 && (
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={(e) => openGallery(e)}
                  onPointerDown={(e) => e.stopPropagation()}
                  aria-label="사진 전체보기"
                >
                  <Images className={styles.actionIcon} />
                </button>
              )}
            </div>
          )}

          {/* Centered Action Icons - Advanced Overlays */}
          <AdvancedOverlay
            motionValue={dragX}
            direction="right"
            range={SWIPE_THRESHOLD}
            icon={Heart}
            className={styles.overlayRight}
            iconClassName={styles.overlayIconFilled}
          />
          <AdvancedOverlay
            motionValue={dragX}
            direction="left"
            range={-SWIPE_THRESHOLD}
            icon={HeartCrack}
            className={styles.overlayLeft}
          />
          <AdvancedOverlay
            motionValue={dragY}
            direction="down"
            range={Y_SWIPE_DOWN_THRESHOLD}
            icon={X}
            className={styles.overlayDown}
          />

          {/* Content */}
          <div
            className={cn(
              styles.contentSection,
              usingPlaceholder && styles.contentSectionOnPlaceholder,
            )}
          >
            {/* Tags */}
            {restaurant.tags && restaurant.tags.length > 0 && (
              <div className={styles.tagsContainer}>
                {restaurant.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Restaurant Name & Type */}
            <h2 className={styles.restaurantName}>{restaurant.name}</h2>
            <p className={styles.restaurantType}>{restaurant.cuisine_type}</p>

            {/* Ratings & Reviews */}
            <div className={styles.ratingsReviewsContainer}>
              <div className={styles.ratingItem}>
                <Star className={styles.starIcon} />
                <span className={styles.ratingValue}>{restaurant.rating}</span>
              </div>
            </div>

            {/* Distance */}
            <div className={styles.distanceContainer}>
              <div className={styles.distanceBadge}>
                <Navigation className={styles.navigationIcon} />
                <span className={styles.distanceText}>
                  도보 {restaurant.walking_minutes}분 ({restaurant.distance_meters}m)
                </span>
              </div>
            </div>

            {/* Amenities */}
            {(restaurant.has_parking || restaurant.hasGroupSeating || restaurant.petFriendly) && (
              <div className={styles.amenitiesContainer}>
                {restaurant.has_parking && (
                  <span className={styles.amenityBadge}>
                    <Car className={styles.amenityIcon} /> 주차
                  </span>
                )}
                {restaurant.hasGroupSeating && (
                  <span className={styles.amenityBadge}>
                    <Users className={styles.amenityIcon} /> 단체석
                  </span>
                )}
                {restaurant.petFriendly && (
                  <span className={styles.amenityBadge}>
                    <Dog className={styles.amenityIcon} /> 반려동물
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <ImageGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={images}
        initialIndex={selectedImageIndex}
      />
    </>
  );
}
