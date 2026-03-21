import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./SignupForm.module.scss";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes } from "@/shared/constants/routes";

export interface SignupFormValues {
  email: string;
  password: string;
  passwordConfirm: string;
  displayName?: string;
}

interface SignupFormProps {
  onSubmit?: (values: SignupFormValues) => void | Promise<void>;
  onSuccess?: () => void;
  showLoginLink?: boolean;
  compact?: boolean;
  showDisplayName?: boolean;
  className?: string;
}

const MIN_PASSWORD_LENGTH = 8;

export function SignupForm({ onSubmit, onSuccess, showLoginLink = true, compact = false, showDisplayName = true, className }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("이메일을 입력해 주세요.");
      return;
    }
    if (!password) {
      setError("비밀번호를 입력해 주세요.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`);
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit?.({
        email: email.trim(),
        password,
        passwordConfirm,
        ...(showDisplayName && displayName.trim() ? { displayName: displayName.trim() } : {}),
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      {!compact && (
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-foreground">회원가입</h2>
          <p className="mt-1 text-sm text-muted-foreground">이메일과 비밀번호를 입력해 주세요</p>
        </div>
      )}
      <div className="space-y-4">
        {showDisplayName && (
          <div className="space-y-2">
            <Label htmlFor="signup-displayName">닉네임 (선택)</Label>
            <Input id="signup-displayName" type="text" placeholder="사용할 이름" autoComplete="nickname" value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={isSubmitting} />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="signup-email">이메일</Label>
          <Input id="signup-email" type="email" placeholder="example@email.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password">비밀번호</Label>
          <Input id="signup-password" type="password" placeholder={`${MIN_PASSWORD_LENGTH}자 이상`} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-passwordConfirm">비밀번호 확인</Label>
          <Input id="signup-passwordConfirm" type="password" placeholder="비밀번호 다시 입력" autoComplete="new-password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} disabled={isSubmitting} />
        </div>
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "가입 중…" : "회원가입"}
        </Button>
      </div>
      {showLoginLink && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          이미 계정이 있으신가요?{" "}
          <Link to={routes.auth.login} className="font-medium text-primary underline hover:no-underline cursor-pointer">
            로그인
          </Link>
        </p>
      )}
    </form>
  );
}
