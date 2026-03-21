import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./LoginForm.module.scss";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes } from "@/shared/constants/routes";

export interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSubmit?: (values: LoginFormValues) => void | Promise<void>;
  onSuccess?: () => void;
  showSignupLink?: boolean;
  compact?: boolean;
  className?: string;
}

export function LoginForm({ onSubmit, onSuccess, showSignupLink = true, compact = false, className }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    setIsSubmitting(true);
    try {
      await onSubmit?.({ email: email.trim(), password });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      {!compact && (
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-foreground">로그인</h2>
          <p className="mt-1 text-sm text-muted-foreground">이메일과 비밀번호를 입력해 주세요</p>
        </div>
      )}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email">이메일</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="example@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password">비밀번호</Label>
          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "로그인 중…" : "로그인"}
        </Button>
      </div>
      {showSignupLink && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          계정이 없으신가요?{" "}
          <Link to={routes.auth.signup} className="font-medium text-primary underline hover:no-underline cursor-pointer">
            회원가입
          </Link>
        </p>
      )}
    </form>
  );
}
