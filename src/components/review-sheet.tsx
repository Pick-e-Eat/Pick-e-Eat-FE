import { createPortal } from "react-dom";
import { APP_OVERLAY_ROOT_ID } from "@/app/AppLayout";
import type { Restaurant } from "@/lib/types";
import styles from "./review-sheet.module.css";
import { X, Star, Quote } from "lucide-react";
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
  const overlayRoot =
    typeof document !== "undefined" ? document.getElementById(APP_OVERLAY_ROOT_ID) : null;

  if (!restaurant) return null;

  const sheetContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.overlay}
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={styles.sheetContainer}
          >
            {/* Handle */}
            <div className={styles.handleBarContainer}>
              <div className={styles.handleBar} />
            </div>

            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerTextContainer}>
                <h3 className={styles.restaurantName}>{restaurant.name}</h3>
                <p className={styles.restaurantType}>{restaurant.cuisine_type || restaurant.type}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={styles.closeButton}
                aria-label="닫기"
              >
                <X className={styles.closeIcon} />
              </button>
            </div>

            {/* Content Area */}
            <div className={styles.contentArea}>
              {/* Editorial Summary */}
              {restaurant.editorial_summary && (
                <div className={styles.summarySection}>
                  <div className={styles.summaryContent}>
                    <Quote className={styles.quoteIcon} />
                    <p className={styles.summaryText}>{restaurant.editorial_summary}</p>
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className={styles.reviewsContainer}>
                <h4 className={styles.sectionTitle}>리뷰</h4>
                <div className={styles.reviewsList}>
                  {restaurant.reviews?.map((review) => (
                    <div key={review.id} className={styles.reviewItem}>
                      <div className={styles.reviewHeader}>
                        <div className={styles.reviewAuthorInfo}>
                          <div className={styles.authorInitial}>{review.author.charAt(0)}</div>
                          <span className={styles.authorName}>{review.author}</span>
                          <span className={styles.reviewSource}>{sourceLabel(review.source)}</span>
                        </div>
                        <div className={styles.reviewRating}>
                          <Star className={styles.ratingIcon} />
                          <span className={styles.ratingValue}>{review.rating}</span>
                        </div>
                      </div>
                      <p className={styles.reviewContent}>{review.content}</p>
                      <p className={styles.reviewDate}>{review.date}</p>
                    </div>
                  ))}
                </div>

                {(!restaurant.reviews || restaurant.reviews.length === 0) && (
                  <div className={styles.noReviewsContainer}>
                    <p className={styles.noReviewsText}>아직 리뷰가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return overlayRoot ? createPortal(sheetContent, overlayRoot) : null;
}
