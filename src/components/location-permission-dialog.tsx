import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const DESCRIPTION_ID = "location-permission-description";

type LocationPermissionDialogProps = {
  open: boolean;
  /** [현재 위치로 찾기] — 브라우저 권한 팝업으로 이어짐 */
  onAllow: () => void;
  /** [직접 설정하기] / ESC·바깥 클릭 — 브라우저 권한을 건드리지 않음 */
  onDecline: () => void;
};

/**
 * 브라우저 위치 권한 팝업 전에 이유를 먼저 설명하는 사전 안내.
 * 권한은 한 번 거부되면 코드로 다시 요청할 수 없어, 준비되지 않은 사용자가
 * 브라우저 권한을 태우지 않고 이 단계에서만 거절할 수 있게 합니다.
 */
export function LocationPermissionDialog({
  open,
  onAllow,
  onDecline,
}: LocationPermissionDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onDecline();
      }}
    >
      <DialogContent className="sm:max-w-sm" aria-describedby={DESCRIPTION_ID}>
        <DialogHeader className="mb-3 space-y-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="size-6 text-primary" aria-hidden />
          </span>
          <DialogTitle className="text-base font-semibold leading-snug">
            내 주변 맛집을 찾아볼까요?
          </DialogTitle>
        </DialogHeader>
        <p id={DESCRIPTION_ID} className="text-sm leading-relaxed text-muted-foreground">
          현재 위치를 기준으로 가까운 음식점을 추천해 드려요. 위치 정보는 주변 맛집 검색에만
          사용됩니다.
        </p>
        <div className="mt-5 flex flex-col gap-1">
          <Button type="button" size="lg" className="w-full" onClick={onAllow}>
            현재 위치로 찾기
          </Button>
          <button
            type="button"
            onClick={onDecline}
            className="h-10 cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            직접 설정하기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
