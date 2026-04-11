import { AnimatePresence, motion } from "framer-motion";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HamburgerMenu } from "@/components/hamburger-menu";
import { ReviewSheet } from "@/components/review-sheet";
import { SavedAddressLimitDialog } from "@/components/saved-address-limit-dialog";
import { SwipeCard } from "@/components/swipe-card";
import { HomeHeader } from "@/features/home/components/HomeHeader";
import type { FilterSettings, Restaurant, SavedAddress, SwipeResult } from "@/lib/types";
import { restaurantAPI } from "@/shared/api/restaurant";
import { routes } from "@/shared/constants/routes";
import { useNearbyQueryStore } from "@/shared/stores/nearby-query-store";
import { useResultsStore } from "@/shared/stores/results-store";
import {
  type SavedAddressWithCoordinates,
  useSavedAddressesStore,
} from "@/shared/stores/saved-addresses-store";
import styles from "./HomePage.module.css";

const MAX_SELECTIONS = 10;

export function HomePage() {
  const navigate = useNavigate();
  const { results, addResult, resetResults } = useResultsStore();
  const { nearbyQuery, setCoordinates, setAddress, setRadius } = useNearbyQueryStore();
  const savedAddresses = useSavedAddressesStore((s) => s.addresses);
  const addSavedAddress = useSavedAddressesStore((s) => s.addAddress);
  const removeSavedAddress = useSavedAddressesStore((s) => s.removeAddress);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showReviews, setShowReviews] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const currentLocation = nearbyQuery.address;
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    searchRange: nearbyQuery.radius,
    hasParking: null,
    hasGroupSeating: null,
    petFriendly: null,
  });
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAddressLimitOpen, setSavedAddressLimitOpen] = useState(false);

  useEffect(() => {
    setFilterSettings((prev) =>
      prev.searchRange === nearbyQuery.radius ? prev : { ...prev, searchRange: nearbyQuery.radius },
    );
  }, [nearbyQuery.radius]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await restaurantAPI.searchNearby({
          latitude: nearbyQuery.latitude,
          longitude: nearbyQuery.longitude,
          radius: filterSettings.searchRange as 50 | 100 | 250,
        });
        // Map RestaurantResponse to local Restaurant type
        const fetchedRestaurants: Restaurant[] = response.restaurants.map((r) => ({
          id: r.place_id,
          name: r.name,
          address: r.address,
          latitude: r.latitude,
          longitude: r.longitude,
          rating: r.rating,
          user_ratings_total: r.user_ratings_total,
          photo_url: r.photo_url,
          opening_now: r.opening_now,
          cuisine_type: r.cuisine_type,
          distance_meters: r.distance_meters,
          walking_minutes: r.walking_minutes,
          has_parking: r.has_parking,
          blog_review_count: r.blog_review_count,
          tags: r.tags,
          // Default values for fields not in API response
          type: "Unknown", // Placeholder
          hasGroupSeating: null, // Placeholder
          petFriendly: null, // Placeholder
          reviews: [], // Placeholder
        }));
        setRestaurants(fetchedRestaurants);
        setCurrentIndex(0); // Reset index when new restaurants are fetched
      } catch (err) {
        setError("Failed to fetch restaurants.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, [nearbyQuery.latitude, nearbyQuery.longitude, filterSettings]);

  const filteredRestaurants = restaurants.filter((r) => {
    if (filterSettings.hasParking !== null && r.has_parking !== filterSettings.hasParking)
      return false;
    // Assuming hasGroupSeating and petFriendly are not coming from API yet,
    // so keeping the local filter for now.
    if (
      filterSettings.hasGroupSeating !== null &&
      r.hasGroupSeating !== filterSettings.hasGroupSeating
    )
      return false;
    if (filterSettings.petFriendly !== null && r.petFriendly !== filterSettings.petFriendly)
      return false;
    if (r.distance_meters && r.distance_meters > filterSettings.searchRange) return false;
    return true;
  });

  const currentRestaurant = filteredRestaurants[currentIndex];
  const remainingCount = MAX_SELECTIONS - results.length;

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      if (!currentRestaurant) return;
      setExitDirection(direction);
      const newResult: SwipeResult = {
        restaurant: currentRestaurant,
        liked: direction === "right",
      };

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
    // Re-fetch restaurants when starting over
    restaurantAPI
      .searchNearby({
        latitude: nearbyQuery.latitude,
        longitude: nearbyQuery.longitude,
        radius: filterSettings.searchRange as 50 | 100 | 250,
      })
      .then((response) => {
        const fetchedRestaurants: Restaurant[] = response.restaurants.map((r) => ({
          id: r.place_id,
          name: r.name,
          address: r.address,
          latitude: r.latitude,
          longitude: r.longitude,
          rating: r.rating,
          user_ratings_total: r.user_ratings_total,
          photo_url: r.photo_url,
          opening_now: r.opening_now,
          cuisine_type: r.cuisine_type,
          distance_meters: r.distance_meters,
          walking_minutes: r.walking_minutes,
          has_parking: r.has_parking,
          blog_review_count: r.blog_review_count,
          tags: r.tags,
          type: "Unknown",
          hasGroupSeating: null,
          petFriendly: null,
          reviews: [],
        }));
        setRestaurants(fetchedRestaurants);
      })
      .catch((err) => {
        setError("Failed to fetch restaurants on start over.");
        console.error(err);
      });
  };

  const handleAddAddress = (address: SavedAddress) => {
    const result = addSavedAddress(address as SavedAddressWithCoordinates);
    if (result === "limit") {
      setSavedAddressLimitOpen(true);
      return false;
    }
    return result === "ok";
  };
  const handleRemoveAddress = (id: string) => removeSavedAddress(id);
  const handleSelectAddress = async (address: SavedAddress) => {
    const selectedAddress = address as SavedAddressWithCoordinates;
    setAddress(address.address);
    if (
      typeof selectedAddress.latitude === "number" &&
      typeof selectedAddress.longitude === "number"
    ) {
      setCoordinates(selectedAddress.latitude, selectedAddress.longitude);
      setMenuOpen(false);
      return;
    }

    try {
      const response = await restaurantAPI.searchText({ query: address.address });
      const first = response.locations[0];
      if (first) {
        setCoordinates(first.latitude, first.longitude);
      }
    } catch (err) {
      setError("주소 좌표 검색에 실패했습니다.");
      console.error(err);
    }
    setMenuOpen(false);
  };

  const handleFilterChange = (settings: FilterSettings) => {
    setFilterSettings(settings);
    setRadius(settings.searchRange as 50 | 100 | 250);
  };

  const handleOpenLocationPicker = () => {
    setMenuOpen(false);
    navigate(routes.locationPicker);
  };

  return (
    <main className={styles.mainContainer}>
      <HomeHeader onMenuOpen={() => setMenuOpen(true)} maxSelections={MAX_SELECTIONS} />

      <div className={styles.cardStackContainer}>
        {isLoading && <div className={styles.loadingMessage}>Loading restaurants...</div>}
        {error && <div className={styles.errorMessage}>Error: {error}</div>}
        {!isLoading &&
        !error &&
        filteredRestaurants.length > 0 &&
        currentIndex < filteredRestaurants.length ? (
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
          !isLoading &&
          !error && (
            <div className={styles.noRestaurantsContainer}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={styles.noRestaurantsCard}
              >
                <p className={styles.noRestaurantsMessage}>
                  {filteredRestaurants.length === 0
                    ? "조건에 맞는 음식점이 없습니다"
                    : "모든 음식점을 확인했어요!"}
                </p>
                <button type="button" onClick={handleStartOver} className={styles.startOverButton}>
                  다시 시작하기
                </button>
              </motion.div>
            </div>
          )
        )}
      </div>

      <ReviewSheet
        restaurant={currentRestaurant ?? null}
        isOpen={showReviews}
        onClose={() => setShowReviews(false)}
      />
      <HamburgerMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenLocationPicker={handleOpenLocationPicker}
        currentLocation={currentLocation}
        addressSearchBiasLat={nearbyQuery.latitude}
        addressSearchBiasLng={nearbyQuery.longitude}
        filterSettings={filterSettings}
        onFilterChange={handleFilterChange}
        savedAddresses={savedAddresses}
        onAddAddress={handleAddAddress}
        onSavedAddressLimit={() => setSavedAddressLimitOpen(true)}
        onRemoveAddress={handleRemoveAddress}
        onSelectAddress={handleSelectAddress}
      />
      <SavedAddressLimitDialog
        open={savedAddressLimitOpen}
        onOpenChange={setSavedAddressLimitOpen}
      />
    </main>
  );
}
