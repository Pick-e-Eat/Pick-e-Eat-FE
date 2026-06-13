import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HamburgerMenu } from "@/components/hamburger-menu";
import { SavedAddressLimitDialog } from "@/components/saved-address-limit-dialog";
import { SwipeCard } from "@/components/swipe-card";
import { HomeHeader } from "@/features/home/components/HomeHeader";
import type { FilterSettings, Restaurant, SavedAddress, SwipeResult } from "@/lib/types";
import { restaurantAPI, buildNearbySearchRequest, mapRestaurantResponse } from "@/shared/api/restaurant";
import { routes } from "@/shared/constants/routes";
import { useNearbyQueryStore } from "@/shared/stores/nearby-query-store";
import { useResultsStore } from "@/shared/stores/results-store";
import type { SavedAddressWithCoordinates } from "@/shared/stores/saved-addresses-store";
import { useSavedAddressesStore } from "@/shared/stores/saved-addresses-store";
import styles from "./HomePage.module.css";

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as
    | { returnToMenuOpen?: boolean; skipMenuOpenAnimation?: boolean }
    | null;
  const initialMenuOpen = Boolean(navState?.returnToMenuOpen);
  const initialSkipMenuOpenAnimation = Boolean(navState?.skipMenuOpenAnimation);
  const { results, addResult, resetResults } = useResultsStore();
  const { nearbyQuery, setCoordinates, setAddress, setRadius } = useNearbyQueryStore();
  const savedAddresses = useSavedAddressesStore((s) => s.addresses);
  const removeSavedAddress = useSavedAddressesStore((s) => s.removeAddress);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(initialMenuOpen);
  const [skipMenuOpenAnimation, setSkipMenuOpenAnimation] = useState(initialSkipMenuOpenAnimation);
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
    const shouldOpenMenuAfterLocationSet = Boolean(navState?.returnToMenuOpen);
    if (!shouldOpenMenuAfterLocationSet) return;
    setMenuOpen(true);
    setSkipMenuOpenAnimation(Boolean(navState?.skipMenuOpenAnimation));
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, navState?.returnToMenuOpen, navState?.skipMenuOpenAnimation, navigate]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await restaurantAPI.searchNearby(
          buildNearbySearchRequest(
            nearbyQuery.latitude,
            nearbyQuery.longitude,
            filterSettings,
            results.map((r) => r.restaurant.id),
          ),
        );
        const fetchedRestaurants: Restaurant[] = response.restaurants.map(mapRestaurantResponse);
        setRestaurants(fetchedRestaurants);
        setCurrentIndex(0);
      } catch (err) {
        setError("Failed to fetch restaurants.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, [
    nearbyQuery.latitude,
    nearbyQuery.longitude,
    filterSettings.searchRange,
    filterSettings.hasParking,
    filterSettings.hasGroupSeating,
    filterSettings.petFriendly,
  ]);

  const currentRestaurant = restaurants[currentIndex];
  const maxSelections = Math.max(10, results.length + Math.max(0, restaurants.length - currentIndex));

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
        if (results.length + 1 >= maxSelections) {
          navigate(routes.results);
        }
      }, 480);
    },
    [currentRestaurant, results, addResult, navigate, maxSelections],
  );

  const handleStartOver = () => {
    resetResults();
    setCurrentIndex(0);
    // Re-fetch restaurants when starting over
    restaurantAPI
      .searchNearby(
        buildNearbySearchRequest(
          nearbyQuery.latitude,
          nearbyQuery.longitude,
          filterSettings,
          [],
        ),
      )
      .then((response) => {
        setRestaurants(response.restaurants.map(mapRestaurantResponse));
      })
      .catch((err) => {
        setError("Failed to fetch restaurants on start over.");
        console.error(err);
      });
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
  };

  const handleFilterChange = (settings: FilterSettings) => {
    setFilterSettings(settings);
    setRadius(settings.searchRange as 50 | 100 | 250);
  };

  const handleOpenLocationPicker = () => {
    navigate(routes.locationPicker, {
      state: { mode: "setLocation", returnToMenuOpen: true, skipMenuOpenAnimation: true },
    });
  };

  const handleOpenSaveLocationPicker = () => {
    navigate(routes.locationPicker, {
      state: { mode: "saveOnly", returnToMenuOpen: true, skipMenuOpenAnimation: true },
    });
  };

  return (
    <main className={styles.mainContainer}>
      <HomeHeader
        onMenuOpen={() => {
          setSkipMenuOpenAnimation(false);
          setMenuOpen(true);
        }}
        maxSelections={maxSelections}
      />

      <div className={styles.cardStackContainer}>
        {isLoading && <div className={styles.loadingMessage}>Loading restaurants...</div>}
        {error && <div className={styles.errorMessage}>Error: {error}</div>}
        {!isLoading &&
        !error &&
        restaurants.length > 0 &&
        currentIndex < restaurants.length ? (
          <div className={styles.cardWrapper}>
            <AnimatePresence>
              {[restaurants[currentIndex + 1], restaurants[currentIndex]]
                .filter(Boolean)
                .map((restaurant, index, arr) => {
                  const isTop = index === arr.length - 1;
                  return (
                    <SwipeCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      onSwipe={isTop ? handleSwipe : () => {}}
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
                  {results.length > 0
                    ? "더 이상 검색할 음식점이 없습니다"
                    : "조건에 맞는 음식점이 없습니다"}
                </p>
                <div className={styles.noRestaurantsActions}>
                  {results.length > 0 && (
                    <button
                      type="button"
                      onClick={() => navigate(routes.results)}
                      className={styles.viewResultsButton}
                    >
                      결과 보기
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleStartOver}
                    className={styles.startOverButton}
                  >
                    {results.length > 0 ? "처음부터 다시하기" : "다시 시도하기"}
                  </button>
                </div>
              </motion.div>
            </div>
          )
        )}
      </div>

      <HamburgerMenu
        isOpen={menuOpen}
        onClose={() => {
          setMenuOpen(false);
          setSkipMenuOpenAnimation(false);
        }}
        onOpenLocationPicker={handleOpenLocationPicker}
        onOpenSaveLocationPicker={handleOpenSaveLocationPicker}
        currentLocation={currentLocation}
        currentLatitude={nearbyQuery.latitude}
        currentLongitude={nearbyQuery.longitude}
        disableOpenAnimation={skipMenuOpenAnimation}
        filterSettings={filterSettings}
        onFilterChange={handleFilterChange}
        savedAddresses={savedAddresses}
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
