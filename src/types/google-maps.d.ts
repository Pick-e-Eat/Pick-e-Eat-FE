declare global {
  interface Window {
    google?: {
      // biome-ignore lint/suspicious/noExplicitAny: 스크립트 태그로 주입되는 서드파티 전역이라 타입 정의가 없다. 제대로 좁히려면 @types/google.maps 설치가 필요하다
      maps?: any;
    };
  }
}

export {};
