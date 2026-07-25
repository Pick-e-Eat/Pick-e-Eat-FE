import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components";
import { routes } from "@/shared/constants/routes";
import styles from "./LoginPage.module.css";

export function LoginPage() {
  const handleSubmit = async (values: { email: string; password: string }) => {
    console.log("Login submit", values);
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
            <p className={styles.cardDescription}>로그인하여 맞춤 음식점을 추천받으세요</p>
          </CardHeader>
          <CardContent>
            <LoginForm onSubmit={handleSubmit} showSignupLink compact={false} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
