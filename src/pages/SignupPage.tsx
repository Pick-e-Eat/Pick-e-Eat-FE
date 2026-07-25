import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SignupForm } from "@/features/auth/components";
import { routes } from "@/shared/constants/routes";
import styles from "./SignupPage.module.css";

export function SignupPage() {
  const handleSubmit = async (values: {
    email: string;
    password: string;
    passwordConfirm: string;
    displayName?: string;
  }) => {
    // TODO: 실제 API 연동 (예: POST /api/v1/auth/signup)
    console.log("Signup submit", values);
  };

  return (
    <main className={styles.mainContainer}>
      <div className={styles.contentWrapper}>
        <Button variant="outline" size="sm" asChild>
          <Link to={routes.home} className={styles.backButton}>
            <ArrowLeft className="size-4" />
            홈으로
          </Link>
        </Button>
        <Card>
          <CardHeader className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>Pick-e-Eat</h1>
            <p className={styles.cardDescription}>회원가입하고 맞춤 음식점을 추천받으세요</p>
          </CardHeader>
          <CardContent>
            <SignupForm onSubmit={handleSubmit} showLoginLink compact={false} showDisplayName />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
