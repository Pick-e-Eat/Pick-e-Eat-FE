import { useState, useEffect } from "react";
import type { Restaurant } from "@/lib/types";
import {
  motion,
  useMotionValue,
  useTransform,
  PanInfo,
  animate,
} from "framer-motion";
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

const SWIPE_THRESHOLD = 100;
const Y_SWIPE_THRESHOLD = -100; // Swipe up
const Y_SWIPE_DOWN_THRESHOLD = 100; // Swipe down
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
  const [lockedDirection, setLockedDirection] = useState<"x" | "y" | null>(
    null
  );
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  
  // Horizontal swipe opacities
  const likeOpacity = useTransform(x, [0, 50], [0, 1]);
  const nopeOpacity = useTransform(x, [-50, 0], [1, 0]);

  // Vertical swipe opacities
  const reviewOpacity = useTransform(y, [0, -50], [0, 1]);
  const stopOpacity = useTransform(y, [0, 50], [0, 1]);

  const isExiting = exitDirection !== null;
  const { setColors, resetColors } = useHeaderColorStore();

  // Animate card out when horizontal swipe is triggered
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
      fac
        .getColorAsync(restaurant.image, {
          crossOrigin: "anonymous",
        })
        .then((color) => {
          setColors(color.hex, color.isDark ? "#fff" : "#000");
        })
        .catch((e) => {
          console.error("Failed to extract color:", e);
          resetColors();
        });

      return () => {
        resetColors();
      };
    }
  }, [isTop, restaurant.image, setColors, resetColors]);

  const handleDragStart = () => {
    setLockedDirection(null); // Reset locked direction on new drag
    x.set(0); // Ensure x, y are at 0 when starting a new drag
    y.set(0);
  };

  const handleDrag = (_: any, info: PanInfo) => {
    if (lockedDirection === null) {
      // Determine lock direction after initial movement threshold
      if (Math.abs(info.offset.x) > DRAG_LOCK_THRESHOLD || Math.abs(info.offset.y) > DRAG_LOCK_THRESHOLD) {
        if (Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
          setLockedDirection("x");
        } else {
          setLockedDirection("y");
        }
      }
    }

    // Constrain motion to locked direction
    if (lockedDirection === "y") {
      x.set(0); // If locked to Y, prevent X movement
    } else if (lockedDirection === "x") {
      y.set(0); // If locked to X, prevent Y movement
    }
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
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
  };

  const dragEnabled = isTop && !isExiting;

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
      style={{ x, y, rotate, opacity }}
      drag={dragEnabled ? true : false} // Allow dragging in both directions initially
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={{ top: 0.2, bottom: 0.2, left: 1, right: 1 }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 20 }}
      animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 20 }}
    >
      {/* Card Container */}
      <div className="relative h-full w-full overflow-hidden bg-card shadow-2xl">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${restaurant.image})` }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-foreground/90 via-foreground/30 to-transparent" />

        {/* Centered Action Icons */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-like"
          style={{ opacity: likeOpacity }}
        >
          <ThumbsUp className="size-32 opacity-60" />
        </motion.div>
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-unlike"
          style={{ opacity: nopeOpacity }}
        >
          <ThumbsDown className="size-32 opacity-60" />
        </motion.div>
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500"
          style={{ opacity: reviewOpacity }}
        >
          <MessageSquare className="size-28 opacity-60" />
        </motion.div>
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-destructive"
          style={{ opacity: stopOpacity }}
        >
          <X className="size-32 opacity-60" />
        </motion.div>

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-6 text-card">
          {/* Tags */}
          {restaurant.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {restaurant.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-card/20 px-3 py-1 text-xs font-medium backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Restaurant Name & Type */}
          <h2 className="mb-1 text-3xl font-bold text-balance">
            {restaurant.name}
          </h2>
          <p className="mb-3 text-lg text-card/80">{restaurant.type}</p>

          {/* Ratings & Reviews */}
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="size-5 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{restaurant.rating}</span>
            </div>
            <div className="flex items-center gap-1 text-card/80">
              <MessageSquare className="size-4" />
              <span className="text-sm">
                리뷰 {restaurant.reviewCount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1 text-card/80">
              <FileText className="size-4" />
              <span className="text-sm">
                블로그 {restaurant.blogReviewCount}
              </span>
            </div>
          </div>

          {/* Distance */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-card/20 px-3 py-1.5 backdrop-blur-sm">
              <Navigation className="size-4" />
              <span className="text-sm font-medium">
                도보 {restaurant.walkingTime}분 ({restaurant.distance}m)
              </span>
            </div>
          </div>

          {/* Amenities */}
          {(restaurant.hasParking ||
            restaurant.hasGroupSeating ||
            restaurant.petFriendly) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {restaurant.hasParking && (
                <span className="flex items-center gap-1 rounded-full bg-accent/80 px-3 py-1 text-xs text-accent-foreground">
                  <Car className="size-3" /> 주차
                </span>
              )}
              {restaurant.hasGroupSeating && (
                <span className="flex items-center gap-1 rounded-full bg-accent/80 px-3 py-1 text-xs text-accent-foreground">
                  <Users className="size-3" /> 단체석
                </span>
              )}
              {restaurant.petFriendly && (
                <span className="flex items-center gap-1 rounded-full bg-accent/80 px-3 py-1 text-xs text-accent-foreground">
                  <Dog className="size-3" /> 반려동물
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
            className="w-full rounded-xl bg-card/20 py-3 text-center font-medium backdrop-blur-sm transition-colors hover:bg-card/30"
          >
            리뷰 더보기
          </button>
        </div>
      </div>
    </motion.div>
  );
}
