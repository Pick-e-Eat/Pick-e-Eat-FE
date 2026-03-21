import styles from "./LoginDialog.module.scss";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoginForm, type LoginFormValues } from "@/features/auth/components/LoginForm";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: LoginFormValues) => void | Promise<void>;
}

export function LoginDialog({ open, onOpenChange, onSubmit }: LoginDialogProps) {
  const handleSuccess = () => onOpenChange(false);
  const handleSubmit = async (values: LoginFormValues) => {
    await onSubmit?.(values);
    handleSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>로그인</DialogTitle>
          <p className="text-sm text-muted-foreground">Pick-e-Eat 계정으로 로그인하세요</p>
        </DialogHeader>
        <LoginForm onSubmit={handleSubmit} onSuccess={handleSuccess} showSignupLink compact />
      </DialogContent>
    </Dialog>
  );
}
