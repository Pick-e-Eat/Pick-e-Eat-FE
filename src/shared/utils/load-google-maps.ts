let googleMapsLoaderPromise: Promise<void> | null = null;

const GOOGLE_MAPS_SCRIPT_ID = "pick-e-eat-google-maps-sdk";

export function loadGoogleMapsSdk(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps SDK는 브라우저에서만 사용할 수 있습니다."));
  }

  if (window.google?.maps) {
    return Promise.resolve();
  }

  if (googleMapsLoaderPromise) {
    return googleMapsLoaderPromise;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(
      new Error("VITE_GOOGLE_MAPS_API_KEY가 설정되지 않았습니다. .env를 확인해 주세요."),
    );
  }

  googleMapsLoaderPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      if (window.google?.maps) {
        resolve();
        return;
      }
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Google Maps SDK 로드에 실패했습니다.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${apiKey}` +
      "&language=ko&region=KR&v=weekly";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      googleMapsLoaderPromise = null;
      reject(new Error("Google Maps SDK 로드에 실패했습니다."));
    };
    document.head.appendChild(script);
  });

  return googleMapsLoaderPromise;
}
