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
} from "lucide-react";

const SWIPE_THRESHOLD = 100;
const EXIT_OFFSET = 500;

interface SwipeCardProps {
  restaurant: Restaurant;
  onSwipe: (direction: "left" | "right") => void;
  onShowReviews: () => void;
  isTop?: boolean;
  exitDirection?: "left" | "right" | null;
}

export function SwipeCard({
  restaurant,
  onSwipe,
  onShowReviews,
  isTop = true,
  exitDirection = null,
}: SwipeCardProps) {
  const [opacity, setOpacity] = useState(1);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const isExiting = exitDirection !== null;

  useEffect(() => {
    if (!isExiting) return;
    const to = exitDirection === "right" ? EXIT_OFFSET : -EXIT_OFFSET;
    animate(x, to, { type: "spring", stiffness: 300, damping: 30 });
    setOpacity(0);
  }, [isExiting, exitDirection, x]);

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const offset = info.offset.x;
    if (offset > SWIPE_THRESHOLD) {
      onSwipe("right");
    } else if (offset < -SWIPE_THRESHOLD) {
      onSwipe("left");
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 35 });
    }
  };

  const dragEnabled = isTop && !isExiting;

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
      style={{ x, rotate, opacity }}
      drag={dragEnabled ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
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
          <ThumbsUp className="size-32 opacity-40" />
        </motion.div>
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-unlike"
          style={{ opacity: nopeOpacity }}
        >
          <ThumbsDown className="size-32 opacity-40" />
        </motion.div>

        {/* Like/Nope Indicators */}
        <motion.div
          className="absolute left-8 top-8 -rotate-[15deg] rounded-lg border-4 border-like px-4 py-2"
          style={{ opacity: likeOpacity }}
        >
          <span className="text-3xl font-bold text-like">LIKE</span>
        </motion.div>

        <motion.div
          className="absolute right-8 top-8 rotate-[15deg] rounded-lg border-4 border-unlike px-4 py-2"
          style={{ opacity: nopeOpacity }}
        >
          <span className="text-3xl font-bold text-unlike">NOPE</span>
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
