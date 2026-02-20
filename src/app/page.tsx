import { useState, useCallback } from "react";
import type { Restaurant, FilterSettings, SavedAddress, SwipeResult } from "@/lib/types";
import { mockRestaurants } from "@/lib/mock-data";
import { SwipeCard } from "@/components/swipe-card";
import { ReviewSheet } from "@/components/review-sheet";
import { HamburgerMenu } from "@/components/hamburger-menu";
import { ResultsScreen } from "@/components/results-screen";
import { Menu, X, ThumbsDown, ThumbsUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const MAX_SELECTIONS = 10;

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<SwipeResult[]>([]);
  const [showResults, setShowResults] = useState(false);
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
      const updatedResults = [...results, newResult];
      setTimeout(() => {
        setResults(updatedResults);
        setCurrentIndex((prev) => prev + 1);
        setExitDirection(null);
        if (updatedResults.length >= MAX_SELECTIONS) setTimeout(() => setShowResults(true), 100);
      }, 300);
    },
    [currentRestaurant, results]
  );

  const handleReset = () => {
    setResults([]);
    setCurrentIndex(0);
    setShowResults(false);
  };

  const handleAddAddress = (address: SavedAddress) => setSavedAddresses((prev) => [...prev, address]);
  const handleRemoveAddress = (id: string) => setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
  const handleSelectAddress = (address: SavedAddress) => {
    setCurrentLocation(address.address);
    setMenuOpen(false);
  };

  if (showResults) {
    return (
      <ResultsScreen
        results={results}
        onContinue={() => setShowResults(false)}
        onReset={handleReset}
      />
    );
  }

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-background">
      <header className="relative z-10 flex items-center justify-between bg-card/80 px-4 py-3 backdrop-blur-lg">
        <button type="button" onClick={() => setMenuOpen(true)} className="rounded-full p-2 text-card-foreground hover:bg-muted" aria-label="메뉴 열기">
          <Menu className="h-6 w-6" />
        </button>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <h1 className="text-xl font-bold text-primary">Pick-e-Eat</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {results.length}/{MAX_SELECTIONS}
          </span>
          {results.length > 0 && (
            <button type="button" onClick={() => setShowResults(true)} className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="그만하기">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </header>

      <div className="relative flex-1 px-4 py-4">
        {filteredRestaurants.length > 0 && currentIndex < filteredRestaurants.length ? (
          <div className="relative h-full">
            <AnimatePresence mode="wait">
              {currentRestaurant && (
                <SwipeCard
                  key={currentRestaurant.id}
                  restaurant={currentRestaurant}
                  onSwipe={handleSwipe}
                  onShowReviews={() => setShowReviews(true)}
                  isTop
                  exitDirection={exitDirection}
                />
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-3xl bg-card p-8 shadow-lg">
              <p className="mb-4 text-lg font-medium text-card-foreground">
                {filteredRestaurants.length === 0 ? "조건에 맞는 음식점이 없습니다" : "모든 음식점을 확인했어요!"}
              </p>
              <button type="button" onClick={handleReset} className="rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90">
                다시 시작하기
              </button>
            </motion.div>
          </div>
        )}
      </div>

      {currentRestaurant && (
        <div className="flex items-center justify-center gap-8 bg-card/80 px-4 py-6 backdrop-blur-lg">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => handleSwipe("left")}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-unlike/10 text-unlike shadow-lg hover:bg-unlike/20"
            aria-label="싫어요"
          >
            <ThumbsDown className="h-7 w-7" />
          </motion.button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">남은 선택</p>
            <p className="text-2xl font-bold text-card-foreground">{remainingCount}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => handleSwipe("right")}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-like/10 text-like shadow-lg hover:bg-like/20"
            aria-label="좋아요"
          >
            <ThumbsUp className="h-7 w-7" />
          </motion.button>
        </div>
      )}

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
