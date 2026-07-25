import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import styles from "./image-gallery-modal.module.css";

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export function ImageGalleryModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}: ImageGalleryModalProps) {
  const [[page, direction], setPage] = useState([initialIndex, 0]);

  // Reset page when modal opens with a specific initialIndex
  useEffect(() => {
    if (isOpen) {
      setPage([initialIndex, 0]);
    }
  }, [isOpen, initialIndex]);

  const imageIndex = ((page % images.length) + images.length) % images.length;

  const paginate = useCallback(
    (newDirection: number) => {
      setPage([page + newDirection, newDirection]);
    },
    [page],
  );

  if (images.length === 0) return null;

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={styles.overlay}>
          <DialogPrimitive.Content
            className={styles.galleryContainer}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <div className={styles.galleryContainer}>
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={page}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(_, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);

                    if (swipe < -swipeConfidenceThreshold) {
                      paginate(1);
                    } else if (swipe > swipeConfidenceThreshold) {
                      paginate(-1);
                    }
                  }}
                  className={styles.imageWrapper}
                >
                  <img
                    src={images[imageIndex]}
                    alt={`Gallery ${imageIndex + 1} of ${images.length}`}
                    className={styles.image}
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.navButton} ${styles.prevButton}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    paginate(-1);
                  }}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  type="button"
                  className={`${styles.navButton} ${styles.nextButton}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    paginate(1);
                  }}
                  aria-label="Next image"
                >
                  <ChevronRight size={32} />
                </button>
                <div className={styles.counter}>
                  {imageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
