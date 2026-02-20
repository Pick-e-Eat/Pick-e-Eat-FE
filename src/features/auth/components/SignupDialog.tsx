import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SignupForm, type SignupFormValues } from "@/features/auth/components/SignupForm";

interface SignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: SignupFormValues) => void | Promise<void>;
}

export function SignupDialog({ open, onOpenChange, onSubmit }: SignupDialogProps) {
  const handleSuccess = () => onOpenChange(false);
  const handleSubmit = async (values: SignupFormValues) => {
    await onSubmit?.(values);
    handleSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>회원가입</DialogTitle>
          <p className="text-sm text-muted-foreground">Pick-e-Eat 계정을 만들어 보세요</p>
        </DialogHeader>
        <SignupForm onSubmit={handleSubmit} onSuccess={handleSuccess} showLoginLink compact showDisplayName />
      </DialogContent>
    </Dialog>
  );
}
