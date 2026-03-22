import styles from "./SignupDialog.module.css";
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
      <DialogContent className={styles.dialogContent}>
        <DialogHeader className={styles.dialogHeader}>
          <DialogTitle className={styles.dialogTitle}>회원가입</DialogTitle>
          <p className={styles.dialogDescription}>Pick-e-Eat 계정을 만들어 보세요</p>
        </DialogHeader>
        <SignupForm onSubmit={handleSubmit} onSuccess={handleSuccess} showLoginLink compact showDisplayName />
      </DialogContent>
    </Dialog>
  );
}
