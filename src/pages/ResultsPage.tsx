import { useNavigate } from "react-router-dom";
import styles from "./ResultsPage.module.css";
import { routes } from "@/shared/constants/routes";
import { useResultsStore } from "@/shared/stores/results-store";
import { Star, MapPin, ThumbsUp, ThumbsDown, RotateCcw, Navigation } from "lucide-react";
import { motion } from "framer-motion";

export function ResultsPage() {
  const navigate = useNavigate();
  const { results, resetResults } = useResultsStore();

  const likedRestaurants = results.filter((r) => r.liked);
  const dislikedRestaurants = results.filter((r) => !r.liked);

  const handleReset = () => {
    resetResults();
    navigate(routes.home);
  };

  const handleContinue = () => {
    navigate(routes.home);
  };

  return (
    <div className={styles.mainContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>검색 결과</h1>
        <p className={styles.headerDescription}>
          총 {results.length}개 중 {likedRestaurants.length}개를 선택했어요
        </p>
      </div>

      {/* Results */}
      <div className={styles.resultsSection}>
        {/* Liked Section */}
        {likedRestaurants.length > 0 && (
          <div className={styles.likedSection}>
            <div className={styles.sectionHeader}>
              <ThumbsUp className={styles.thumbsUpIcon} />
              <h2 className={styles.sectionTitle}>좋아요 ({likedRestaurants.length})</h2>
            </div>
            <div className={styles.likedList}>
              {likedRestaurants.map((result, index) => (
                <motion.div
                  key={result.restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={styles.likedItem}
                >
                  <div className={styles.likedItemContent}>
                    <div
                      className={styles.likedItemImage}
                      style={{ backgroundImage: `url(${result.restaurant.photo_url})` }}
                    />
                    <div className={styles.likedItemDetails}>
                      <h3 className={styles.likedItemName}>{result.restaurant.name}</h3>
                      <p className={styles.likedItemType}>{result.restaurant.cuisine_type}</p>
                      <div className={styles.likedItemMeta}>
                        <div className={styles.likedItemRating}>
                          <Star className={styles.starIcon} />
                          <span className={styles.ratingValue}>{result.restaurant.rating}</span>
                        </div>
                        <span className={styles.walkingTime}>
                          도보 {result.restaurant.walking_minutes}분
                        </span>
                      </div>
                    </div>
                    <div className={styles.likedItemActions}>
                      <button type="button" className={styles.navigationButton} aria-label="길찾기">
                        <Navigation className={styles.navigationIcon} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Disliked Section */}
        {dislikedRestaurants.length > 0 && (
          <div className={styles.dislikedSection}>
            <div className={styles.sectionHeader}>
              <ThumbsDown className={styles.thumbsDownIcon} />
              <h2 className={styles.sectionTitle}>다음에 ({dislikedRestaurants.length})</h2>
            </div>
            <div className={styles.dislikedList}>
              {dislikedRestaurants.map((result, index) => (
                <motion.div
                  key={result.restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (likedRestaurants.length + index) * 0.1 }}
                  className={styles.dislikedItem}
                >
                  <div
                    className={styles.dislikedItemImage}
                    style={{ backgroundImage: `url(${result.restaurant.photo_url})` }}
                  />
                  <div className={styles.dislikedItemDetails}>
                    <h3 className={styles.dislikedItemName}>{result.restaurant.name}</h3>
                    <p className={styles.dislikedItemType}>{result.restaurant.cuisine_type}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {results.length === 0 && (
          <div className={styles.emptyStateContainer}>
            <MapPin className={styles.emptyStateIcon} />
            <p className={styles.emptyStateTitle}>아직 결과가 없어요</p>
            <p className={styles.emptyStateDescription}>음식점을 스와이프해서 선택해주세요</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actionsContainer}>
        <div className={styles.actionButtonsWrapper}>
          <button type="button" onClick={handleReset} className={styles.resetButton}>
            <RotateCcw className={styles.resetIcon} />
            처음부터
          </button>
          <button type="button" onClick={handleContinue} className={styles.continueButton}>
            더 검색하기
          </button>
        </div>
      </div>
    </div>
  );
}
