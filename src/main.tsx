// 앱 진입점에서 전역 스타일과 루트 렌더링을 담당
import React from "react";
import { createRoot } from "react-dom/client";
import { initAnalytics } from "@/shared/utils/analytics";
import { App } from "./App";
import "./styles/globals.css";

// GA4는 라우터보다 먼저 준비되어야 첫 page_view가 큐잉된다
initAnalytics();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("루트 엘리먼트를 찾을 수 없습니다.");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
