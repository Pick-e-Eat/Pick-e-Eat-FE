import { create } from "zustand";

/**
 * "idle": 아직 시작 안 함 / "checking": 권한 상태 확인 중
 * "asking": 사전 안내로 사용자 응답 대기 중 / "locating": GPS 조회 중
 * "settled": 위치 확정(허용·거부·미지원 모두 포함)
 */
export type LocationBootstrapStatus = "idle" | "checking" | "asking" | "locating" | "settled";

interface LocationBootstrapState {
  status: LocationBootstrapStatus;
  setStatus: (status: LocationBootstrapStatus) => void;
}

/**
 * 앱 진입 시 위치 확정 흐름의 진행 상태.
 *
 * 컴포넌트 state가 아니라 스토어에 두는 이유: StrictMode 이중 마운트나 라우트 재진입으로
 * 훅이 다시 실행돼도 진행 중인 흐름을 이어받아야 하기 때문입니다. 컴포넌트 state로 두면
 * 리마운트가 진행 중인 요청을 버리고 "이미 요청했음"으로 오판해 기본 위치로 검색합니다.
 *
 * 영속화하지 않습니다 — 새로고침하면 idle부터 다시 판단하는 게 의도된 동작입니다.
 */
export const useLocationBootstrapStore = create<LocationBootstrapState>()((set) => ({
  status: "idle",
  setStatus: (status) => set({ status }),
}));
