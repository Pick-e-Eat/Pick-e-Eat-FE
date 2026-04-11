import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Crosshair, Search } from "lucide-react";
import { toast } from "sonner";
import styles from "./LocationPickerPage.module.css";
import type { LocationResult } from "@/shared/types/api.types";
import { useNearbyQueryStore } from "@/shared/stores/nearby-query-store";
import { loadGoogleMapsSdk } from "@/shared/utils/load-google-maps";

type LatLng = { lat: number; lng: number };
type GoogleMarkerLike = {
  position?: LatLng;
};

const pickLocationLabelFromGeocodeResult = (result: any): string | null => {
  if (!result) return null;

  if (typeof result.formatted_address === "string" && result.formatted_address.trim()) {
    return result.formatted_address.trim();
  }

  const components: Array<{ long_name?: string; types?: string[] }> = result.address_components ?? [];
  const findByType = (type: string) =>
    components.find((component) => component.types?.includes(type))?.long_name;

  const dong =
    findByType("sublocality_level_4") ??
    findByType("sublocality_level_3") ??
    findByType("sublocality_level_2") ??
    findByType("sublocality_level_1");
  if (dong) return dong;

  return result.formatted_address ?? null;
}

const buildSearchCandidateQueries = (query: string, selectedAddress: string): string[] => {
  const normalizedAddress = selectedAddress.replace(/^대한민국\s*/, "").trim();
  const addressParts = normalizedAddress.split(/\s+/).filter(Boolean).slice(0, 3);
  const contextualPrefixes: string[] = [];

  if (addressParts.length >= 1) {
    contextualPrefixes.push(addressParts[0]);
  }
  if (addressParts.length >= 2) {
    contextualPrefixes.push(addressParts.slice(0, 2).join(" "));
  }
  if (addressParts.length >= 3) {
    contextualPrefixes.push(addressParts.slice(0, 3).join(" "));
  }

  return Array.from(
    new Set([
      query,
      ...contextualPrefixes.map((prefix) => `${prefix} ${query}`),
      `대한민국 ${query}`,
      `서울 ${query}`,
      `부산 ${query}`,
    ]),
  );
}

export function LocationPickerPage() {
  const navigate = useNavigate();
  const { nearbyQuery, setCoordinates, setAddress } = useNearbyQueryStore();
  const [selectedPosition, setSelectedPosition] = useState<LatLng>({
    lat: nearbyQuery.latitude,
    lng: nearbyQuery.longitude,
  });
  const [selectedAddress, setSelectedAddress] = useState(nearbyQuery.address);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<GoogleMarkerLike | null>(null);
  const geocoderRef = useRef<any>(null);
  const geocodeRequestIdRef = useRef(0);

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
      geocoderRef.current = new window.google.maps.Geocoder();
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
        const mapsApi = window.google.maps;
        const mapsLib = mapsApi.importLibrary ? await mapsApi.importLibrary("maps") : null;
        const markerLib = mapsApi.importLibrary ? await mapsApi.importLibrary("marker") : null;
        const MapCtor = (mapsLib as { Map?: any } | null)?.Map ?? mapsApi.Map;
        const AdvancedMarkerCtor =
          (markerLib as { AdvancedMarkerElement?: any } | null)?.AdvancedMarkerElement ?? null;

        if (typeof MapCtor !== "function") {
          throw new Error("Google Maps Map 생성자를 불러오지 못했습니다.");
        }

        const map = new MapCtor(mapContainerRef.current, {
          center,
          zoom: 16,
          disableDefaultUI: true,
          zoomControl: true,
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID",
        });
        if (typeof AdvancedMarkerCtor !== "function") {
          throw new Error("AdvancedMarkerElement 생성자를 불러오지 못했습니다.");
        }
        const marker = new AdvancedMarkerCtor({
          position: center,
          map,
        });

        clickListener = map.addListener("click", (event: any) => {
          const latLng = event?.latLng;
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
  }, [moveMarker, nearbyQuery.latitude, nearbyQuery.longitude, resolveAddressFromLatLng]);

  const handleSearchLocation = async () => {
    const query = searchQuery.trim();
    if (!query) {
      toast.error("검색어를 입력해 주세요.");
      return;
    }
    setIsSearching(true);
    try {
      await loadGoogleMapsSdk();
      if (!window.google?.maps) {
        throw new Error("Google Maps SDK가 준비되지 않았습니다.");
      }

      if (!geocoderRef.current) {
        geocoderRef.current = new window.google.maps.Geocoder();
      }

      const candidateQueries = buildSearchCandidateQueries(query, selectedAddress);
      const biasDelta = 0.2;
      const biasBounds = {
        north: selectedPosition.lat + biasDelta,
        south: selectedPosition.lat - biasDelta,
        east: selectedPosition.lng + biasDelta,
        west: selectedPosition.lng - biasDelta,
      };

      let geocodeResults: any[] = [];
      for (const candidateQuery of candidateQueries) {
        try {
          const response = await geocoderRef.current.geocode({
            address: candidateQuery,
            language: "ko",
            region: "KR",
            bounds: biasBounds,
          });
          geocodeResults = response?.results ?? [];
          if (geocodeResults.length > 0) {
            break;
          }
        } catch {
          geocodeResults = [];
        }
      }

      const locations: LocationResult[] = geocodeResults.slice(0, 5).map((result: any) => {
        const lat = result.geometry?.location?.lat?.();
        const lng = result.geometry?.location?.lng?.();
        return {
          place_id: result.place_id ?? `${lat}-${lng}`,
          name: pickLocationLabelFromGeocodeResult(result) ?? query,
          address: result.formatted_address ?? "",
          latitude: typeof lat === "number" ? lat : 0,
          longitude: typeof lng === "number" ? lng : 0,
        };
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
    navigator.geolocation.getCurrentPosition(
      (pos) => {
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
      },
      () => {
        toast.error("위치 권한이 없거나 현재 위치를 가져올 수 없습니다.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
      },
    );
  };

  const handleConfirmLocation = () => {
    if (isConfirming) return;
    setIsConfirming(true);
    setCoordinates(selectedPosition.lat, selectedPosition.lng);
    setAddress(selectedAddress || "선택한 위치");
    const appliedLocationLabel = (selectedAddress || "선택한 위치").replace(/^대한민국\s*/, "").trim();
    const shortLabel =
      appliedLocationLabel.length > 18 ? `${appliedLocationLabel.slice(0, 18)}...` : appliedLocationLabel;
    toast.success(
      <>
        위치를 적용했어요.
        <br />
        위치: {shortLabel}
      </>,
    );
    window.setTimeout(() => {
      navigate(-1);
    }, 120);
  };

  return (
    <main className={styles.pageContainer}>
      <header className={styles.header}>
        <button type="button" className={styles.iconButton} onClick={() => navigate(-1)}>
          <ArrowLeft className={styles.icon} />
        </button>
        <h1 className={styles.title}>내 위치 찾기</h1>
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
          placeholder="주소/건물명 검색"
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

      <section className={styles.mapSection}>
        <div ref={mapContainerRef} className={styles.mapContainer} />
        {isLoadingMap && <div className={styles.mapLoadingOverlay}>지도를 불러오는 중...</div>}
        <button type="button" className={styles.gpsButton} onClick={handleMoveToGps}>
          <Crosshair className={styles.icon} />
        </button>
      </section>

      <section className={styles.bottomSheet}>
        <p className={styles.selectedAddress}>{selectedAddress || "선택한 위치"}</p>
        <p className={styles.metaText}>
          {isResolvingAddress
            ? "위치 이름을 확인하는 중..."
            : "지도를 탭하거나 검색/GPS로 위치를 선택해 주세요."}
        </p>
        <button
          type="button"
          className={styles.confirmButton}
          onClick={handleConfirmLocation}
          disabled={isConfirming}
        >
          {isConfirming ? "적용 중..." : "이 위치로 설정"}
        </button>
      </section>
    </main>
  );
}
