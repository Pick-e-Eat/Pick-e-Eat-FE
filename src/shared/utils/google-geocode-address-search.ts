/**
 * 주소/장소 검색 — Google Maps Geocoder (한국어, 맥락 쿼리 + bounds 바이어스).
 * 위치 피커와 햄버거 메뉴 저장 주소 검색에서 동일하게 사용합니다.
 */
import type { LocationResult } from "@/shared/types/api.types";
import { loadGoogleMapsSdk } from "@/shared/utils/load-google-maps";

type GeocodeComponent = {
  long_name?: string;
  types?: string[];
};

export type GeocodeResultLike = {
  formatted_address?: string;
  address_components?: GeocodeComponent[];
  place_id?: string;
  geometry?: {
    location?: {
      lat: () => number;
      lng: () => number;
    };
  };
};

type GeocoderRequest = {
  location?: { lat: number; lng: number };
  address?: string;
  language?: string;
  region?: string;
  bounds?: { north: number; south: number; east: number; west: number };
};

/** LocationPicker 역지오코딩용 ref 타입 */
export type GoogleGeocoderLike = {
  geocode: (req: GeocoderRequest) => Promise<{ results?: GeocodeResultLike[] }>;
};

export function pickLocationLabelFromGeocodeResult(
  result: GeocodeResultLike | null | undefined,
): string | null {
  if (!result) return null;

  const components: GeocodeComponent[] = result.address_components ?? [];
  const findByType = (type: string) =>
    components.find((component) => component.types?.includes(type))?.long_name;

  const normalizedFormattedAddress =
    typeof result.formatted_address === "string"
      ? result.formatted_address.replace(/^대한민국\s*/, "").trim()
      : "";
  const route = findByType("route");
  const streetNumber = findByType("street_number");
  const premise = findByType("premise");
  const roadAddressNumber = streetNumber || premise;
  const cityOrProvince = findByType("administrative_area_level_1");
  const district = findByType("administrative_area_level_2");
  const neighborhood = findByType("administrative_area_level_3");

  if (route) {
    return [
      cityOrProvince,
      district,
      neighborhood,
      [route, roadAddressNumber].filter(Boolean).join(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  if (/(?:로|길)\s*\d*/.test(normalizedFormattedAddress)) {
    return normalizedFormattedAddress;
  }

  if (normalizedFormattedAddress) {
    return normalizedFormattedAddress;
  }

  const dong =
    findByType("sublocality_level_4") ??
    findByType("sublocality_level_3") ??
    findByType("sublocality_level_2") ??
    findByType("sublocality_level_1");
  if (dong) return dong;

  return result.formatted_address ?? null;
}

export function buildSearchCandidateQueries(query: string, contextAddress: string): string[] {
  const normalizedAddress = contextAddress.replace(/^대한민국\s*/, "").trim();
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

const DEFAULT_BIAS_DELTA = 0.2;

export async function searchAddressWithGoogleGeocoder(options: {
  query: string;
  /** 맥락 검색어 접두에 쓰는 기준 주소 (예: 현재 내 위치 텍스트) */
  contextAddress: string;
  biasLat: number;
  biasLng: number;
  biasDelta?: number;
}): Promise<LocationResult[]> {
  const { query, contextAddress, biasLat, biasLng, biasDelta = DEFAULT_BIAS_DELTA } = options;
  const trimmed = query.trim();
  if (!trimmed) return [];

  await loadGoogleMapsSdk();
  if (!window.google?.maps) {
    throw new Error("Google Maps SDK가 준비되지 않았습니다.");
  }

  const geocoder = new window.google.maps.Geocoder() as GoogleGeocoderLike;
  const candidateQueries = buildSearchCandidateQueries(trimmed, contextAddress);
  const bounds = {
    north: biasLat + biasDelta,
    south: biasLat - biasDelta,
    east: biasLng + biasDelta,
    west: biasLng - biasDelta,
  };

  let geocodeResults: GeocodeResultLike[] = [];
  for (const candidateQuery of candidateQueries) {
    try {
      const response = await geocoder.geocode({
        address: candidateQuery,
        language: "ko",
        region: "KR",
        bounds,
      });
      geocodeResults = response?.results ?? [];
      if (geocodeResults.length > 0) {
        break;
      }
    } catch {
      geocodeResults = [];
    }
  }

  return geocodeResults.slice(0, 5).map((result) => {
    const lat = result.geometry?.location?.lat?.();
    const lng = result.geometry?.location?.lng?.();
    const roadAddress = pickLocationLabelFromGeocodeResult(result);
    return {
      place_id: result.place_id ?? `${lat}-${lng}`,
      name: roadAddress ?? trimmed,
      address: roadAddress ?? result.formatted_address ?? "",
      latitude: typeof lat === "number" ? lat : 0,
      longitude: typeof lng === "number" ? lng : 0,
    };
  });
}
