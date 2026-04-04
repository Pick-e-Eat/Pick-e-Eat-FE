import { useState, useEffect } from "react";
import styles from "./swipe-card.module.css";
import type { Restaurant } from "@/lib/types";
import { motion, useMotionValue, useTransform, type PanInfo, animate } from "framer-motion";
import {
  Star,
  MessageSquare,
  FileText,
  Navigation,
  Car,
  Users,
  Dog,
  ThumbsUp,
  ThumbsDown,
  X,
} from "lucide-react";
import { FastAverageColor } from "fast-average-color";
import { useHeaderColorStore } from "@/features/home/stores/header-color-store";
import { cn } from "@/shared/utils/cn"; // Added cn import

const SWIPE_THRESHOLD = 100;
const Y_SWIPE_THRESHOLD = -100; // Swipe up threshold (negative y)
const Y_SWIPE_DOWN_THRESHOLD = 100; // Swipe down threshold (positive y)
const EXIT_OFFSET = 500;
const DRAG_LOCK_THRESHOLD = 5; // Pixels to determine initial drag direction

interface SwipeCardProps {
  restaurant: Restaurant;
  onSwipe: (direction: "left" | "right") => void;
  onShowReviews: () => void;
  onStop: () => void;
  isTop?: boolean;
  exitDirection?: "left" | "right" | null;
}

export function SwipeCard({
  restaurant,
  onSwipe,
  onShowReviews,
  onStop,
  isTop = true,
  exitDirection = null,
}: SwipeCardProps) {
  const [opacity, setOpacity] = useState(1);
  const [lockedDirection, setLockedDirection] = useState<"x" | "y" | null>(null);
  // Motion values for card's physical position on screen
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Motion values for tracking user's raw gesture offset (for feedback icons)
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  // Card rotation based on horizontal drag
  const rotate = useTransform(x, [-200, 200], [-15, 15]);

  // Opacity transforms for feedback icons based on dragX/dragY
  const likeOpacity = useTransform(dragX, [0, 50], [0, 1]);
  const nopeOpacity = useTransform(dragX, [-50, 0], [1, 0]);
  const reviewOpacity = useTransform(dragY, [0, -50], [0, 1]);
  const stopOpacity = useTransform(dragY, [0, 50], [0, 1]);

  const isExiting = exitDirection !== null;
  const { setColors, resetColors } = useHeaderColorStore();
  const backgroundColor = useHeaderColorStore((s) => s.backgroundColor);

  // Animate card out when horizontal swipe is triggered by onSwipe (targets x)
  useEffect(() => {
    if (!isExiting) return;
    const to = exitDirection === "right" ? EXIT_OFFSET : -EXIT_OFFSET;
    animate(x, to, { type: "spring", stiffness: 300, damping: 30 });
    setOpacity(0);
  }, [isExiting, exitDirection, x]);

  // Extract color from image when card is on top
  useEffect(() => {
    if (isTop) {
      const fac = new FastAverageColor();
      if(!restaurant.photo_url) return () => resetColors();
      // fac
      //   .getColorAsync(restaurant.photo_url, {
      //     crossOrigin: "anonymous",
      //   })
      //   .then((color) => {
      //     setColors(color.hex, color.isDark ? "#fff" : "#000");
      //   })
      //   .catch((e) => {
      //     console.error("Failed to extract color:", e);
      //     resetColors();
      //   });

      return () => {
        resetColors();
      };
    }
  }, [isTop, restaurant.photo_url, setColors, resetColors]);

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
        } else {
          setLockedDirection("y");
        }
      }
    }

    // Now, constrain *both* actual card motion AND gesture tracking motion to locked direction
    if (lockedDirection === "y") {
      y.set(info.offset.y); // Card moves Y
      x.set(0); // Card X is 0
      dragX.set(0); // Gesture tracking X is 0 if locked to Y
    } else if (lockedDirection === "x") {
      x.set(info.offset.x); // Card moves X
      y.set(0); // Card Y is 0
      dragY.set(0); // Gesture tracking Y is 0 if locked to X
    } else {
      // If direction not yet locked, card moves freely (within DRAG_LOCK_THRESHOLD, it's not actually moving)
      // dragX and dragY are already set above
      x.set(info.offset.x);
      y.set(info.offset.y);
    }
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset } = info;

    if (lockedDirection === "y") {
      if (offset.y < Y_SWIPE_THRESHOLD) {
        onShowReviews();
      } else if (offset.y > Y_SWIPE_DOWN_THRESHOLD) {
        onStop();
      }
      // Animate card back to center after any vertical swipe
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
      animate(y, 0, { type: "spring", stiffness: 500, damping: 30 });
    } else if (lockedDirection === "x") {
      if (offset.x > SWIPE_THRESHOLD) {
        onSwipe("right");
      } else if (offset.x < -SWIPE_THRESHOLD) {
        onSwipe("left");
      } else {
        // Animate card back if not swiped far enough horizontally
        animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
        animate(y, 0, { type: "spring", stiffness: 500, damping: 30 });
      }
    } else {
      // No significant drag occurred to lock a direction, animate back
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
      animate(y, 0, { type: "spring", stiffness: 500, damping: 30 });
    }

    setLockedDirection(null); // Reset locked direction for the next drag
    dragX.set(0); // Reset gesture tracking motion values
    dragY.set(0);
  };

  const dragEnabled = isTop && !isExiting;

  return (
    <motion.div
      className={styles.cardWrapper}
      style={{ x, y, rotate, opacity }} // Card's actual position
      drag={!!dragEnabled} // Allow dragging in both directions initially
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={{ top: 0.2, bottom: 0.2, left: 1, right: 1 }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 20 }}
      animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 20 }}
    >
      {/* Card Container */}
      <div className={styles.cardContainer}>
        {/* Background Image */}
        <div
          className={styles.backgroundImage}
          style={{ backgroundImage: `url(${restaurant.photo_url})` }}
        />

        {/* Gradient Overlay */}
        <div className={styles.gradientOverlay} />

        {/* Centered Action Icons */}
        <motion.div className={styles.actionIconLike} style={{ opacity: likeOpacity }}>
          <ThumbsUp className={styles.thumbsUpIcon} />
        </motion.div>
        <motion.div className={styles.actionIconNope} style={{ opacity: nopeOpacity }}>
          <ThumbsDown className={styles.thumbsDownIcon} />
        </motion.div>
        <motion.div
          className={styles.actionIconReview}
          style={{
            opacity: reviewOpacity,
            color: backgroundColor || "var(--primary)",
          }}
        >
          <MessageSquare className={cn(styles.messageSquareIcon, "fill-current stroke-none")} />
        </motion.div>
        <motion.div className={styles.actionIconStop} style={{ opacity: stopOpacity }}>
          <X className={styles.xIcon} />
        </motion.div>

        {/* Content */}
        <div className={styles.contentSection}>
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
            <div className={styles.reviewCountItem}>
              <MessageSquare className={styles.reviewCountIcon} />
              <span className={styles.reviewCountText}>
                리뷰 {restaurant.blog_review_count}
              </span>
            </div>
            <div className={styles.reviewCountItem}>
              <FileText className={styles.reviewCountIcon} />
              <span className={styles.reviewCountText}>블로그 {restaurant.blog_review_count}</span>
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

          {/* Review Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShowReviews();
            }}
            className="w-full rounded-xl bg-card/20 py-3 text-center font-medium backdrop-blur-sm transition-colors hover:bg-card/30 cursor-pointer"
          >
            리뷰 더보기
          </button>
        </div>
      </div>
    </motion.div>
  );
}
