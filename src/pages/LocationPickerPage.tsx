import { ArrowLeft, Crosshair, Minus, Plus, Save, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { routes } from "@/shared/constants/routes";
import { useNearbyQueryStore } from "@/shared/stores/nearby-query-store";
import { MAX_SAVED_ADDRESSES, useSavedAddressesStore } from "@/shared/stores/saved-addresses-store";
import type { LocationResult } from "@/shared/types/api.types";
import {
  type GoogleGeocoderLike,
  pickLocationLabelFromGeocodeResult,
  searchAddressWithGoogleGeocoder,
} from "@/shared/utils/google-geocode-address-search";
import { loadGoogleMapsSdk } from "@/shared/utils/load-google-maps";
import styles from "./LocationPickerPage.module.css";

type LatLng = { lat: number; lng: number };

type GoogleMapInstance = {
  panTo: (pos: LatLng) => void;
  getZoom: () => number | undefined;
  setZoom: (zoom: number) => void;
  addListener: (event: string, handler: (e: MapClickEvent) => void) => { remove: () => void };
};

type MapClickEvent = {
  latLng?: {
    lat: () => number;
    lng: () => number;
  };
};

type AdvancedMarkerInstance = {
  position: LatLng | null;
};

type LocationPickerNavState = {
  mode?: "setLocation" | "saveOnly";
  returnToMenuOpen?: boolean;
  skipMenuOpenAnimation?: boolean;
};

const ZOOM_BY_RADIUS: Record<50 | 100 | 250, number> = {
  50: 17,
  100: 16,
  250: 15,
};
const MIN_MAP_ZOOM = 14;
const MAX_MAP_ZOOM = 19;

function getInitialZoomByRadius(radius: number): number {
  if (radius === 50 || radius === 100 || radius === 250) {
    return ZOOM_BY_RADIUS[radius];
  }
  return ZOOM_BY_RADIUS[100];
}

function createCustomMarkerContent(): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.style.width = "36px";
  wrapper.style.height = "46px";
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.justifyContent = "center";
  wrapper.style.transform = "translateY(-6px)";

  wrapper.innerHTML = `
    <svg width="33" height="42" viewBox="0 0 44 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22 55C21 55 20.2 54.6 19.6 53.9L7 41.4C2.8 37.2 0 31.2 0 24.5C0 10.9 10.4 0 22 0C33.6 0 44 10.9 44 24.5C44 31.2 41.2 37.2 37 41.4L24.4 53.9C23.8 54.6 23 55 22 55Z" fill="#FF1018"/>
      <ellipse cx="22" cy="23" rx="8.6" ry="8.6" fill="#D9000A"/>
      <path d="M9.2 13.2C7.9 15 7 17 6.5 19.3" stroke="rgba(255,255,255,0.65)" stroke-width="2" stroke-linecap="round"/>
      <path d="M11 40.4L16.2 45.6" stroke="rgba(255,255,255,0.38)" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
  `;

  return wrapper;
}

export function LocationPickerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as LocationPickerNavState | null;
  const isSaveOnlyMode = navState?.mode === "saveOnly";
  const shouldReturnToMenuOpen = Boolean(navState?.returnToMenuOpen);
  const shouldSkipMenuOpenAnimation = Boolean(navState?.skipMenuOpenAnimation);
  const { nearbyQuery, setCoordinates, setAddress } = useNearbyQueryStore();
  const savedAddresses = useSavedAddressesStore((s) => s.addresses);
  const addSavedAddress = useSavedAddressesStore((s) => s.addAddress);
  const [selectedPosition, setSelectedPosition] = useState<LatLng>({
    lat: nearbyQuery.latitude,
    lng: nearbyQuery.longitude,
  });
  const [selectedAddress, setSelectedAddress] = useState(nearbyQuery.address);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveLabel, setSaveLabel] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [, setIsResolvingAddress] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMapInstance | null>(null);
  const markerRef = useRef<AdvancedMarkerInstance | null>(null);
  const geocoderRef = useRef<GoogleGeocoderLike | null>(null);
  const geocodeRequestIdRef = useRef(0);

  const navigateBackOrHome = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(routes.home, { replace: true });
  }, [navigate]);

  const moveMarker = useCallback((nextPos: LatLng, panMap: boolean) => {
    setSelectedPosition(nextPos);
    if (markerRef.current) {
      markerRef.current.position = nextPos;
    }
    if (panMap) {
      mapRef.current?.panTo(nextPos);
    }
  }, []);

  const resolveAddressFromLatLng = useCallback(async (position: LatLng): Promise<string | null> => {
    if (!window.google?.maps) return null;

    const requestId = ++geocodeRequestIdRef.current;
    if (!geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder() as GoogleGeocoderLike;
    }

    setIsResolvingAddress(true);
    try {
      const response = await geocoderRef.current.geocode({
        location: { lat: position.lat, lng: position.lng },
        language: "ko",
      });
      if (requestId !== geocodeRequestIdRef.current) return null;
      const firstResult = response?.results?.[0];
      return pickLocationLabelFromGeocodeResult(firstResult);
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      if (requestId === geocodeRequestIdRef.current) {
        setIsResolvingAddress(false);
      }
    }
  }, []);

  useEffect(() => {
    let clickListener: { remove: () => void } | null = null;
    let mounted = true;

    const setupMap = async () => {
      try {
        await loadGoogleMapsSdk();
        if (!mounted || !mapContainerRef.current || !window.google?.maps) {
          return;
        }

        const center = { lat: nearbyQuery.latitude, lng: nearbyQuery.longitude };
        const initialZoom = getInitialZoomByRadius(nearbyQuery.radius);
        const mapsApi = window.google.maps;
        const mapsLib = mapsApi.importLibrary ? await mapsApi.importLibrary("maps") : null;
        const markerLib = mapsApi.importLibrary ? await mapsApi.importLibrary("marker") : null;
        type MapLib = { Map?: new (el: HTMLElement, opts: object) => GoogleMapInstance };
        type MarkerLib = {
          AdvancedMarkerElement?: new (opts: {
            position: LatLng;
            map: GoogleMapInstance;
            content?: Node;
            title?: string;
          }) => AdvancedMarkerInstance;
        };
        const MapCtor = (mapsLib as MapLib | null)?.Map ?? mapsApi.Map;
        const AdvancedMarkerCtor = (markerLib as MarkerLib | null)?.AdvancedMarkerElement ?? null;

        if (typeof MapCtor !== "function") {
          throw new Error("Google Maps Map 생성자를 불러오지 못했습니다.");
        }

        const map = new MapCtor(mapContainerRef.current, {
          center,
          zoom: initialZoom,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID",
        });
        if (typeof AdvancedMarkerCtor !== "function") {
          throw new Error("AdvancedMarkerElement 생성자를 불러오지 못했습니다.");
        }
        const marker = new AdvancedMarkerCtor({
          position: center,
          map,
          content: createCustomMarkerContent(),
        });

        clickListener = map.addListener("click", (event: MapClickEvent) => {
          const latLng = event.latLng;
          if (!latLng) return;
          const nextPos = { lat: latLng.lat(), lng: latLng.lng() };
          moveMarker(nextPos, false);
          setSelectedAddress("위치 확인 중...");
          void resolveAddressFromLatLng(nextPos).then((resolvedAddress) => {
            if (resolvedAddress) {
              setSelectedAddress(resolvedAddress);
            } else {
              setSelectedAddress("선택한 위치");
            }
          });
          setSearchResults([]);
        });

        mapRef.current = map;
        markerRef.current = marker;
      } catch (error) {
        console.error(error);
        toast.error("지도 초기화에 실패했습니다. 브라우저 캐시를 지운 뒤 다시 시도해 주세요.");
      } finally {
        if (mounted) {
          setIsLoadingMap(false);
        }
      }
    };

    setupMap();
    return () => {
      mounted = false;
      clickListener?.remove();
    };
  }, [
    moveMarker,
    nearbyQuery.latitude,
    nearbyQuery.longitude,
    nearbyQuery.radius,
    resolveAddressFromLatLng,
  ]);

  const handleSearchLocation = async () => {
    const query = searchQuery.trim();
    if (!query) {
      toast.error("검색어를 입력해 주세요.");
      return;
    }
    setIsSearching(true);
    try {
      const locations = await searchAddressWithGoogleGeocoder({
        query,
        contextAddress: selectedAddress,
        biasLat: selectedPosition.lat,
        biasLng: selectedPosition.lng,
      });
      setSearchResults(locations);
      if (locations.length === 0) {
        toast.message("검색 결과가 없습니다.");
      }
    } catch (error) {
      console.error(error);
      toast.error("위치 검색에 실패했습니다.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (location: LocationResult) => {
    const nextPos = { lat: location.latitude, lng: location.longitude };
    moveMarker(nextPos, true);
    setSelectedAddress(location.address || location.name);
    setSearchResults([]);
    setSearchQuery(location.name);
  };

  const handleMoveToGps = () => {
    if (!navigator.geolocation) {
      toast.error("이 브라우저는 GPS 기능을 지원하지 않습니다.");
      return;
    }
    const onSuccess = (pos: GeolocationPosition) => {
      const nextPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      moveMarker(nextPos, true);
      setSelectedAddress("위치 확인 중...");
      void resolveAddressFromLatLng(nextPos).then((resolvedAddress) => {
        if (resolvedAddress) {
          setSelectedAddress(resolvedAddress);
        } else {
          setSelectedAddress("현재 위치");
        }
      });
    };

    const requestCurrentPosition = (useHighAccuracy: boolean) => {
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        (err) => {
          console.error("Geolocation error:", err.code, err.message);
          if (
            useHighAccuracy &&
            (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE)
          ) {
            requestCurrentPosition(false);
            return;
          }

          switch (err.code) {
            case err.PERMISSION_DENIED:
              toast.error(
                "위치 권한이 거부되었습니다. 웹사이트 설정에서 위치 권한을 허용해 주세요.",
              );
              break;
            case err.TIMEOUT:
              toast.error("현재 위치 확인 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.");
              break;
            case err.POSITION_UNAVAILABLE:
              toast.error("현재 위치 정보를 가져올 수 없습니다. 실외에서 다시 시도해 주세요.");
              break;
            default:
              toast.error("현재 위치를 가져올 수 없습니다.");
          }
        },
        {
          enableHighAccuracy: useHighAccuracy,
          timeout: useHighAccuracy ? 10_000 : 15_000,
          maximumAge: 0,
        },
      );
    };

    requestCurrentPosition(true);
  };

  const handleZoom = (delta: number) => {
    const map = mapRef.current;
    if (!map) return;
    const currentZoom = map.getZoom() ?? getInitialZoomByRadius(nearbyQuery.radius);
    const nextZoom = Math.min(MAX_MAP_ZOOM, Math.max(MIN_MAP_ZOOM, currentZoom + delta));
    map.setZoom(nextZoom);
  };

  const handleConfirmLocation = useCallback(() => {
    if (isConfirming) return;
    setIsConfirming(true);
    const resolved = selectedAddress || "선택한 위치";
    setCoordinates(selectedPosition.lat, selectedPosition.lng);
    setAddress(resolved);

    window.setTimeout(() => {
      navigate(routes.home, {
        replace: true,
        state: {
          returnToMenuOpen: shouldReturnToMenuOpen,
          skipMenuOpenAnimation: shouldSkipMenuOpenAnimation,
        },
      });
    }, 120);
  }, [
    isConfirming,
    navigate,
    selectedAddress,
    selectedPosition.lat,
    selectedPosition.lng,
    setAddress,
    setCoordinates,
    shouldReturnToMenuOpen,
    shouldSkipMenuOpenAnimation,
  ]);

  const handleOpenSaveModal = useCallback(() => {
    if (savedAddresses.length >= MAX_SAVED_ADDRESSES) {
      toast.message(`주소는 최대 ${MAX_SAVED_ADDRESSES}개까지 저장할 수 있어요.`);
      return;
    }
    setSaveLabel("");
    setIsSaveModalOpen(true);
  }, [savedAddresses.length]);

  const handleSaveAddress = useCallback(() => {
    if (isSavingAddress) return;
    const trimmedLabel = saveLabel.trim();
    if (!trimmedLabel) {
      toast.message("저장할 라벨을 입력해 주세요.");
      return;
    }
    if (savedAddresses.length >= MAX_SAVED_ADDRESSES) {
      toast.message(`주소는 최대 ${MAX_SAVED_ADDRESSES}개까지 저장할 수 있어요.`);
      return;
    }
    setIsSavingAddress(true);
    const resolved = selectedAddress || "선택한 위치";
    const result = addSavedAddress({
      id: Date.now().toString(),
      label: trimmedLabel,
      address: resolved,
      isDefault: savedAddresses.length === 0,
      latitude: selectedPosition.lat,
      longitude: selectedPosition.lng,
    });
    if (result === "duplicate") {
      setIsSavingAddress(false);
      toast.message("이미 저장된 위치예요.");
      return;
    }
    if (result === "limit") {
      setIsSavingAddress(false);
      toast.message(`주소는 최대 ${MAX_SAVED_ADDRESSES}개까지 저장할 수 있어요.`);
      return;
    }

    window.setTimeout(() => {
      setIsSaveModalOpen(false);
      setIsSavingAddress(false);
      navigate(routes.home, {
        replace: true,
        state: {
          returnToMenuOpen: shouldReturnToMenuOpen,
          skipMenuOpenAnimation: shouldSkipMenuOpenAnimation,
        },
      });
    }, 120);
  }, [
    addSavedAddress,
    isSavingAddress,
    navigate,
    saveLabel,
    savedAddresses.length,
    selectedAddress,
    selectedPosition.lat,
    selectedPosition.lng,
    shouldReturnToMenuOpen,
    shouldSkipMenuOpenAnimation,
  ]);

  return (
    <main className={styles.pageContainer}>
      <section className={styles.mapSection}>
        <div ref={mapContainerRef} className={styles.mapContainer} />
        {isLoadingMap && <div className={styles.mapLoadingOverlay}>지도를 불러오는 중...</div>}
        <header className={styles.header}>
          <button type="button" className={styles.iconButton} onClick={navigateBackOrHome}>
            <ArrowLeft className={styles.icon} />
          </button>
          <h1 className={styles.title}>{isSaveOnlyMode ? "위치 저장" : "위치 설정"}</h1>
        </header>
        <section className={styles.searchBarSection}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void handleSearchLocation();
              }
            }}
            placeholder="도로명/건물명 검색"
            className={styles.searchInput}
          />
          <button
            type="button"
            className={styles.searchButton}
            onClick={() => void handleSearchLocation()}
            disabled={isSearching}
          >
            <Search className={styles.icon} />
          </button>
        </section>
        {searchResults.length > 0 && (
          <section className={styles.searchResults}>
            {searchResults.map((location) => (
              <button
                key={location.place_id}
                type="button"
                className={styles.searchResultItem}
                onClick={() => handleSelectSearchResult(location)}
              >
                <p className={styles.searchResultName}>{location.name}</p>
                <p className={styles.searchResultAddress}>{location.address}</p>
              </button>
            ))}
          </section>
        )}
        <div className={styles.mapActionButtons}>
          {!isSaveOnlyMode && (
            <button
              type="button"
              className={styles.mapActionButton}
              onClick={handleOpenSaveModal}
              aria-label="현재 위치 저장"
              title="현재 위치 저장"
            >
              <Save className={styles.icon} />
            </button>
          )}
          <button type="button" className={styles.mapActionButton} onClick={handleMoveToGps}>
            <Crosshair className={styles.icon} />
          </button>
          <button type="button" className={styles.mapActionButton} onClick={() => handleZoom(1)}>
            <Plus className={styles.icon} />
          </button>
          <button type="button" className={styles.mapActionButton} onClick={() => handleZoom(-1)}>
            <Minus className={styles.icon} />
          </button>
        </div>
        {isSaveOnlyMode ? (
          <section className={styles.bottomSheet}>
            <p className={styles.selectedAddress}>{selectedAddress || "선택한 위치"}</p>
            <input
              type="text"
              value={saveLabel}
              onChange={(e) => setSaveLabel(e.target.value)}
              placeholder="라벨 (예: 집, 회사)"
              className={styles.saveLabelInput}
              autoComplete="off"
            />
            <button
              type="button"
              className={`${styles.confirmButton} ${styles.compactConfirmButton}`}
              onClick={handleSaveAddress}
              disabled={isSavingAddress || !saveLabel.trim()}
            >
              {isSavingAddress ? "저장 중..." : "이 위치 저장"}
            </button>
          </section>
        ) : (
          <section className={styles.bottomSheet}>
            <p className={styles.selectedAddress}>{selectedAddress || "선택한 위치"}</p>
            <button
              type="button"
              className={styles.confirmButton}
              onClick={handleConfirmLocation}
              disabled={isConfirming}
            >
              {isConfirming ? "처리 중..." : "이 위치로 설정"}
            </button>
          </section>
        )}
        {!isSaveOnlyMode && isSaveModalOpen && (
          <div
            className={styles.saveModalOverlay}
            role="presentation"
            onClick={() => setIsSaveModalOpen(false)}
          >
            <section
              className={styles.saveModal}
              role="dialog"
              aria-modal="true"
              aria-label="주소 저장"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.saveModalHeader}>
                <h2 className={styles.saveModalTitle}>현재 위치 저장</h2>
                <button
                  type="button"
                  className={styles.saveModalCloseButton}
                  onClick={() => setIsSaveModalOpen(false)}
                  aria-label="닫기"
                >
                  <X className={styles.icon} />
                </button>
              </div>
              <p className={styles.saveModalAddress}>{selectedAddress || "선택한 위치"}</p>
              <input
                type="text"
                value={saveLabel}
                onChange={(e) => setSaveLabel(e.target.value)}
                placeholder="라벨 (예: 집, 회사)"
                className={styles.saveLabelInput}
                autoComplete="off"
              />
              <button
                type="button"
                className={`${styles.confirmButton} ${styles.compactConfirmButton}`}
                onClick={handleSaveAddress}
                disabled={isSavingAddress}
              >
                {isSavingAddress ? "저장 중..." : "저장"}
              </button>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
