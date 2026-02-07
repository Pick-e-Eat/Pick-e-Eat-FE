// 날짜/텍스트 표기를 공통 규칙으로 맞추기 위한 유틸
export function formatDate(isoString: string) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
