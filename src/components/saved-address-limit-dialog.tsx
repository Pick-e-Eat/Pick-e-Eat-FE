import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const MESSAGE = "저장되는 주소는 최대 3개까지입니다.";

type SavedAddressLimitDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 다이얼로그가 닫힌 뒤 호출 (위치 피커에서 뒤로가기 등) */
  onCloseComplete?: () => void;
};

export function SavedAddressLimitDialog({
  open,
  onOpenChange,
  onCloseComplete,
}: SavedAddressLimitDialogProps) {
  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      onCloseComplete?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-center text-base font-medium leading-snug">
            {MESSAGE}
          </DialogTitle>
        </DialogHeader>
        <div className="flex justify-center pt-2">
          <Button type="button" className="min-w-24" onClick={() => handleOpenChange(false)}>
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
