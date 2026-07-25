import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  type LocationBootstrapStatus,
  useLocationBootstrapStore,
} from "@/shared/stores/location-bootstrap-store";
import { useNearbyQueryStore } from "@/shared/stores/nearby-query-store";
import {
  hasStoredLocationConsent,
  readLocationPermissionState,
  storeLocationConsent,
} from "@/shared/utils/location-permission";
import { hasManualLocationInSession } from "@/shared/utils/manual-location-session";
import { reverseGeocodeToAddress } from "@/shared/utils/reverse-geocode";

export interface InitialGeolocation {
  status: LocationBootstrapStatus;
  /** 사전 안내 다이얼로그를 띄워야 하는지 */
  isAskingPermission: boolean;
  /** 위치가 확정되어 검색을 시작해도 되는지 */
  isSettled: boolean;
  /** [현재 위치로 찾기] — 브라우저 권한 팝업을 띄우고 좌표를 반영 */
  allowCurrentLocation: () => void;
  /** [직접 설정하기] — 브라우저 권한을 건드리지 않고 넘어감 */
  declineCurrentLocation: () => void;
}

/**
 * 흐름을 이미 시작했는지 (동기 플래그).
 *
 * StrictMode는 같은 렌더의 effect를 그대로 한 번 더 실행하므로 두 번째 실행의 `status`는
 * 아직 "idle"입니다. 이 플래그로 중복 시작만 막습니다 — 여기서 절대 settled로 바꾸지 않습니다.
 * (진행 중인 요청을 버리고 settled로 만들면 기본 위치로 검색되는 버그가 됩니다)
 */
let hasStartedBootstrap = false;

const HIGH_ACCURACY_TIMEOUT_MS = 10_000;
const LOW_ACCURACY_TIMEOUT_MS = 15_000;
/** 역지오코딩 실패 시 보여줄 주소 문구 */
const FALLBACK_ADDRESS_LABEL = "현재 위치";

function isGeolocationSupported(): boolean {
  return typeof navigator !== "undefined" && Boolean(navigator.geolocation);
}

/**
 * 앱에 새로 진입할 때 현재 위치를 검색 기준으로 맞춥니다.
 *
 * - 권한 미결정: 사전 안내 다이얼로그를 먼저 띄움 (거부로 권한을 태우지 않도록)
 * - 이미 허용: 안내 없이 바로 조회
 * - 이미 거부: 조회하지 않고 직접 설정 안내만 표시
 * - 사용자가 이번 세션에 위치를 직접 지정: GPS로 덮지 않음 (새로고침 포함)
 */
export function useInitialGeolocation(): InitialGeolocation {
  const setCoordinates = useNearbyQueryStore((s) => s.setCoordinates);
  const setAddress = useNearbyQueryStore((s) => s.setAddress);
  const status = useLocationBootstrapStore((s) => s.status);
  const setStatus = useLocationBootstrapStore((s) => s.setStatus);

  const requestCurrentPosition = useCallback(() => {
    const onSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      // 좌표가 정해지면 곧바로 검색을 시작하고, 주소 문구는 뒤이어 채웁니다.
      setCoordinates(latitude, longitude);
      setAddress(FALLBACK_ADDRESS_LABEL);
      setStatus("settled");

      void reverseGeocodeToAddress(latitude, longitude)
        .then((resolvedAddress) => {
          if (resolvedAddress) {
            setAddress(resolvedAddress);
          }
        })
        .catch((error) => {
          console.error("Reverse geocoding failed:", error);
        });
    };

    const run = (useHighAccuracy: boolean) => {
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        (err) => {
          console.error("Initial geolocation error:", err.code, err.message);
          if (
            useHighAccuracy &&
            (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE)
          ) {
            run(false);
            return;
          }

          if (err.code === err.PERMISSION_DENIED) {
            toast.message(
              "위치 권한이 거부되어 기본 위치로 검색합니다. 메뉴에서 위치를 직접 설정할 수 있어요.",
            );
          } else {
            toast.message("현재 위치를 확인할 수 없어 기본 위치로 검색합니다.");
          }
          setStatus("settled");
        },
        {
          enableHighAccuracy: useHighAccuracy,
          timeout: useHighAccuracy ? HIGH_ACCURACY_TIMEOUT_MS : LOW_ACCURACY_TIMEOUT_MS,
          maximumAge: 0,
        },
      );
    };

    run(true);
  }, [setAddress, setCoordinates, setStatus]);

  useEffect(() => {
    // idle이 아니면 이미 진행 중이거나 끝난 흐름 — 리마운트에서 다시 시작하지 않습니다.
    if (status !== "idle" || hasStartedBootstrap) return;
    hasStartedBootstrap = true;

    // 새로고침: 사용자가 이번 세션에 지정한 위치를 유지 / 새 진입: 세션이 비어 있으므로 GPS 재검색
    if (hasManualLocationInSession() || !isGeolocationSupported()) {
      setStatus("settled");
      return;
    }

    setStatus("checking");

    void (async () => {
      const permission = await readLocationPermissionState();

      if (permission === "denied") {
        toast.message(
          "위치 권한이 차단되어 기본 위치로 검색합니다. 메뉴에서 직접 설정할 수 있어요.",
        );
        setStatus("settled");
        return;
      }

      // 이미 허용했거나 이전에 동의한 적 있으면 안내 없이 바로 조회
      if (permission === "granted" || hasStoredLocationConsent()) {
        setStatus("locating");
        requestCurrentPosition();
        return;
      }

      setStatus("asking");
    })();
  }, [status, setStatus, requestCurrentPosition]);

  const allowCurrentLocation = useCallback(() => {
    storeLocationConsent();
    setStatus("locating");
    requestCurrentPosition();
  }, [requestCurrentPosition, setStatus]);

  const declineCurrentLocation = useCallback(() => {
    setStatus("settled");
  }, [setStatus]);

  return {
    status,
    isAskingPermission: status === "asking",
    isSettled: status === "settled",
    allowCurrentLocation,
    declineCurrentLocation,
  };
}
