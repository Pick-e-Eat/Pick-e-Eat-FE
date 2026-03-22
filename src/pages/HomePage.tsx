import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";
import { routes } from "@/shared/constants/routes";
import type { Restaurant, FilterSettings, SavedAddress, SwipeResult } from "@/lib/types";
import { mockRestaurants } from "@/lib/mock-data";
import { useResultsStore } from "@/shared/stores/results-store";
import { SwipeCard } from "@/components/swipe-card";
import { ReviewSheet } from "@/components/review-sheet";
import { HamburgerMenu } from "@/components/hamburger-menu";
import { HomeHeader } from "@/features/home/components/HomeHeader";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const MAX_SELECTIONS = 10;

export function HomePage() {
  const navigate = useNavigate();
  const { results, addResult, resetResults } = useResultsStore();

  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showReviews, setShowReviews] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("서울특별시 강남구 역삼동");
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    searchRange: 100,
    hasParking: null,
    hasGroupSeating: null,
    petFriendly: null,
  });
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([
    { id: "1", label: "집", address: "서울특별시 강남구 역삼동 123-45", isDefault: true },
    { id: "2", label: "회사", address: "서울특별시 서초구 서초동 456-78", isDefault: false },
  ]);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);

  const filteredRestaurants = restaurants.filter((r) => {
    if (filterSettings.hasParking !== null && r.hasParking !== filterSettings.hasParking) return false;
    if (filterSettings.hasGroupSeating !== null && r.hasGroupSeating !== filterSettings.hasGroupSeating) return false;
    if (filterSettings.petFriendly !== null && r.petFriendly !== filterSettings.petFriendly) return false;
    if (r.distance > filterSettings.searchRange) return false;
    return true;
  });

  const currentRestaurant = filteredRestaurants[currentIndex];
  const remainingCount = MAX_SELECTIONS - results.length;

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      if (!currentRestaurant) return;
      setExitDirection(direction);
      const newResult: SwipeResult = { restaurant: currentRestaurant, liked: direction === "right" };

      setTimeout(() => {
        addResult(newResult);
        setCurrentIndex((prev) => prev + 1);
        setExitDirection(null);
        // results 상태는 비동기적으로 업데이트되므로, 갱신될 길이를 예측하기 위해 +1을 사용합니다.
        if (results.length + 1 >= MAX_SELECTIONS) {
          navigate(routes.results);
        }
      }, 300);
    },
    [currentRestaurant, results, addResult, navigate],
  );

  const handleStartOver = () => {
    resetResults();
    setCurrentIndex(0);
  };

  const handleAddAddress = (address: SavedAddress) => setSavedAddresses((prev) => [...prev, address]);
  const handleRemoveAddress = (id: string) => setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
  const handleSelectAddress = (address: SavedAddress) => {
    setCurrentLocation(address.address);
    setMenuOpen(false);
  };

  return (
    <main className={styles.mainContainer}>
      <HomeHeader onMenuOpen={() => setMenuOpen(true)} maxSelections={MAX_SELECTIONS} />

      <div className={styles.cardStackContainer}>
        {filteredRestaurants.length > 0 && currentIndex < filteredRestaurants.length ? (
          <div className={styles.cardWrapper}>
            <AnimatePresence>
              {[filteredRestaurants[currentIndex + 1], filteredRestaurants[currentIndex]]
                .filter(Boolean)
                .map((restaurant, index, arr) => {
                  const isTop = index === arr.length - 1;
                  return (
                    <SwipeCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      onSwipe={isTop ? handleSwipe : () => {}}
                      onShowReviews={isTop ? () => setShowReviews(true) : () => {}}
                      onStop={isTop ? () => navigate(routes.results) : () => {}}
                      isTop={isTop}
                      exitDirection={isTop ? exitDirection : null}
                    />
                  );
                })}
            </AnimatePresence>
          </div>
        ) : (
          <div className={styles.noRestaurantsContainer}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={styles.noRestaurantsCard}>
              <p className={styles.noRestaurantsMessage}>
                {filteredRestaurants.length === 0 ? "조건에 맞는 음식점이 없습니다" : "모든 음식점을 확인했어요!"}
              </p>
              <button type="button" onClick={handleStartOver} className={styles.startOverButton}>
                다시 시작하기
              </button>
            </motion.div>
          </div>
        )}
      </div>

      <ReviewSheet restaurant={currentRestaurant ?? null} isOpen={showReviews} onClose={() => setShowReviews(false)} />
      <HamburgerMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        currentLocation={currentLocation}
        filterSettings={filterSettings}
        onFilterChange={setFilterSettings}
        savedAddresses={savedAddresses}
        onAddAddress={handleAddAddress}
        onRemoveAddress={handleRemoveAddress}
        onSelectAddress={handleSelectAddress}
      />
    </main>
  );
}
