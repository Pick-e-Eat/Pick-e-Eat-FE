import type { Restaurant } from "@/lib/types";
import styles from "./review-sheet.module.scss";
import { X, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewSheetProps {
  restaurant: Restaurant | null;
  isOpen: boolean;
  onClose: () => void;
}

function sourceLabel(source: string) {
  if (source === "naver") return "네이버";
  if (source === "blog") return "블로그";
  if (source === "instagram") return "인스타그램";
  return source;
}

export function ReviewSheet({ restaurant, isOpen, onClose }: ReviewSheetProps) {
  if (!restaurant) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-foreground/50"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-hidden rounded-t-3xl bg-card shadow-2xl"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3">
              <div className="h-1.5 w-12 rounded-full bg-muted" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-card-foreground">
                  {restaurant.name}
                </h3>
                <p className="text-sm text-muted-foreground">{restaurant.type}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted cursor-pointer"
                aria-label="닫기"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Reviews */}
            <div className="max-h-[calc(80vh-120px)] overflow-y-auto p-6">
              <div className="space-y-4">
                {restaurant.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-2xl bg-muted/50 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                          {review.author.charAt(0)}
                        </div>
                        <span className="font-medium text-card-foreground">
                          {review.author}
                        </span>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                          {sourceLabel(review.source)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="size-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium text-card-foreground">
                          {review.rating}
                        </span>
                      </div>
                    </div>
                    <p className="mb-2 text-sm leading-relaxed text-card-foreground">
                      {review.content}
                    </p>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                ))}
              </div>

              {restaurant.reviews.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">아직 리뷰가 없습니다.</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
