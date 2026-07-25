import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HamburgerMenu } from "@/components/hamburger-menu";
import { LocationPermissionDialog } from "@/components/location-permission-dialog";
import { SavedAddressLimitDialog } from "@/components/saved-address-limit-dialog";
import { ErrorPanel, LoadingPanel } from "@/components/status-panel";
import { SwipeCard } from "@/components/swipe-card";
import { HomeHeader } from "@/features/home/components/HomeHeader";
import type { FilterSettings, SavedAddress, SwipeResult } from "@/lib/types";
import {
  buildNearbySearchRequest,
  mapRestaurantResponse,
  restaurantAPI,
} from "@/shared/api/restaurant";
import { routes } from "@/shared/constants/routes";
import { useInitialGeolocation } from "@/shared/hooks/useInitialGeolocation";
import { useNearbyQueryStore } from "@/shared/stores/nearby-query-store";
import { useResultsStore } from "@/shared/stores/results-store";
import type { SavedAddressWithCoordinates } from "@/shared/stores/saved-addresses-store";
import { useSavedAddressesStore } from "@/shared/stores/saved-addresses-store";
import styles from "./HomePage.module.css";

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as {
    returnToMenuOpen?: boolean;
    skipMenuOpenAnimation?: boolean;
    continueSearch?: boolean;
  } | null;
  const initialMenuOpen = Boolean(navState?.returnToMenuOpen);
  const initialSkipMenuOpenAnimation = Boolean(navState?.skipMenuOpenAnimation);
  const {
    results,
    restaurants,
    currentIndex,
    sessionBatchEnd,
    addResult,
    setRestaurants,
    resetResults,
  } = useResultsStore();
  const { nearbyQuery, setAddress, setRadius, setManualLocation } = useNearbyQueryStore();
  const {
    isSettled: isLocationSettled,
    isAskingPermission,
    allowCurrentLocation,
    declineCurrentLocation,
  } = useInitialGeolocation();
  const savedAddresses = useSavedAddressesStore((s) => s.addresses);
  const removeSavedAddress = useSavedAddressesStore((s) => s.removeAddress);

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
  /** 현재 위치 확인 전에는 기본 좌표로 검색하지 않고 로딩만 보여줌 */
  const isWaitingForLocation = !isLocationSettled && !navState?.continueSearch;
  const showLoading = isLoading || isWaitingForLocation;

  const searchQueryKey = [
    nearbyQuery.latitude,
    nearbyQuery.longitude,
    filterSettings.searchRange,
    filterSettings.hasParking,
    filterSettings.hasGroupSeating,
    filterSettings.petFriendly,
  ].join("|");

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
    if (!navState?.continueSearch) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [navState?.continueSearch, navigate, location.pathname]);

  const fetchNearby = useCallback(async () => {
    const response = await restaurantAPI.searchNearby(
      buildNearbySearchRequest(nearbyQuery.latitude, nearbyQuery.longitude, filterSettings, []),
    );
    const fetchedRestaurants = response.restaurants.map(mapRestaurantResponse);
    setRestaurants(fetchedRestaurants, response.count);
    return fetchedRestaurants;
  }, [
    nearbyQuery.latitude,
    nearbyQuery.longitude,
    filterSettings.searchRange,
    filterSettings.hasParking,
    filterSettings.hasGroupSeating,
    filterSettings.petFriendly,
    setRestaurants,
  ]);

  // 위치·필터 변경 시 1회 호출 (최대 20개 수신, 1차에는 10개만 노출)
  useEffect(() => {
    if (navState?.continueSearch) return;
    // 위치가 확정되기 전에 기본 좌표로 검색하면 엉뚱한 지역 결과가 먼저 노출됨
    if (!isLocationSettled) return;

    const loadInitialRestaurants = async () => {
      setIsLoading(true);
      setError(null);
      resetResults();

      try {
        await fetchNearby();
      } catch (err) {
        setError("맛집 정보를 불러오지 못했어요.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialRestaurants();
  }, [searchQueryKey, fetchNearby, resetResults, isLocationSettled]);

  const currentRestaurant = restaurants[currentIndex];
  const hasCardsInCurrentBatch =
    restaurants.length > 0 && currentIndex < sessionBatchEnd && currentIndex < restaurants.length;

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
        setExitDirection(null);
        const nextCount = results.length + 1;
        if (nextCount === sessionBatchEnd) {
          navigate(routes.results);
        }
      }, 480);
    },
    [currentRestaurant, results.length, sessionBatchEnd, addResult, navigate],
  );

  const handleStartOver = () => {
    resetResults();
    setIsLoading(true);
    setError(null);
    fetchNearby()
      .catch((err) => {
        setError("맛집 정보를 다시 불러오지 못했어요.");
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  };

  const handleRemoveAddress = (id: string) => removeSavedAddress(id);
  const handleSelectAddress = async (address: SavedAddress) => {
    const selectedAddress = address as SavedAddressWithCoordinates;
    if (
      typeof selectedAddress.latitude === "number" &&
      typeof selectedAddress.longitude === "number"
    ) {
      setManualLocation(selectedAddress.latitude, selectedAddress.longitude, address.address);
      return;
    }

    setAddress(address.address);
    try {
      const response = await restaurantAPI.searchText({ query: address.address });
      const first = response.locations[0];
      if (first) {
        setManualLocation(first.latitude, first.longitude, address.address);
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

  /** 사전 안내에서 "직접 설정하기" — 브라우저 권한을 건드리지 않고 위치 피커로 보냄 */
  const handleDeclineLocationPermission = () => {
    declineCurrentLocation();
    navigate(routes.locationPicker, { state: { mode: "setLocation" } });
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
      />

      <div className={styles.cardStackContainer}>
        {showLoading && !isAskingPermission && (
          <LoadingPanel
            message={isWaitingForLocation ? "현재 위치를 확인하고 있어요" : "맛집을 찾고 있어요"}
            description={
              isWaitingForLocation
                ? "위치를 확인한 뒤 주변 맛집을 보여드릴게요."
                : "잠시만 기다려 주세요."
            }
          />
        )}
        {!showLoading && error && (
          <ErrorPanel message={error} actionLabel="다시 시도하기" onAction={handleStartOver} />
        )}
        {!showLoading && !error && hasCardsInCurrentBatch ? (
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
          !showLoading &&
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
      <LocationPermissionDialog
        open={isAskingPermission}
        onAllow={allowCurrentLocation}
        onDecline={handleDeclineLocationPermission}
      />
    </main>
  );
}
