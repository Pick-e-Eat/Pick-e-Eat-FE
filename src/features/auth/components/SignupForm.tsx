import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes } from "@/shared/constants/routes";
import styles from "./SignupForm.module.css";

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

export function SignupForm({
  onSubmit,
  onSuccess,
  showLoginLink = true,
  compact = false,
  showDisplayName = true,
  className,
}: SignupFormProps) {
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
        <div className={styles.headerContainer}>
          <h2 className={styles.headerTitle}>회원가입</h2>
          <p className={styles.headerDescription}>이메일과 비밀번호를 입력해 주세요</p>
        </div>
      )}
      <div className={styles.inputGroup}>
        {showDisplayName && (
          <div className={styles.inputWrapper}>
            <Label htmlFor="signup-displayName">닉네임 (선택)</Label>
            <Input
              id="signup-displayName"
              type="text"
              placeholder="사용할 이름"
              autoComplete="nickname"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        )}
        <div className={styles.inputWrapper}>
          <Label htmlFor="signup-email">이메일</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="example@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className={styles.inputWrapper}>
          <Label htmlFor="signup-password">비밀번호</Label>
          <Input
            id="signup-password"
            type="password"
            placeholder={`${MIN_PASSWORD_LENGTH}자 이상`}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className={styles.inputWrapper}>
          <Label htmlFor="signup-passwordConfirm">비밀번호 확인</Label>
          <Input
            id="signup-passwordConfirm"
            type="password"
            placeholder="비밀번호 다시 입력"
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        {error && (
          <p className={styles.errorMessage} role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? "가입 중…" : "회원가입"}
        </Button>
      </div>
      {showLoginLink && (
        <p className={styles.loginLinkContainer}>
          이미 계정이 있으신가요?{" "}
          <Link to={routes.auth.login} className={styles.loginLink}>
            로그인
          </Link>
        </p>
      )}
    </form>
  );
}
