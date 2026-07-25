/**
 * 좌표 → 한국어 주소 라벨 역지오코딩.
 * 앱 시작 시 GPS로 받은 좌표를 사용자에게 보여줄 주소 문구로 바꾸는 데 사용합니다.
 */
import {
  type GoogleGeocoderLike,
  pickLocationLabelFromGeocodeResult,
} from "@/shared/utils/google-geocode-address-search";
import { loadGoogleMapsSdk } from "@/shared/utils/load-google-maps";

export async function reverseGeocodeToAddress(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  await loadGoogleMapsSdk();
  if (!window.google?.maps) return null;

  const geocoder = new window.google.maps.Geocoder() as GoogleGeocoderLike;
  const response = await geocoder.geocode({
    location: { lat: latitude, lng: longitude },
    language: "ko",
  });

  return pickLocationLabelFromGeocodeResult(response?.results?.[0]);
}
