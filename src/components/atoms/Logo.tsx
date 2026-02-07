// 브랜드를 나타내는 최소 단위 시각 요소
export function Logo() {
  return (
    <div className="flex items-center gap-2 text-lg font-semibold">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
        P
      </span>
      <span>Pick-e-Eat</span>
    </div>
  );
}
