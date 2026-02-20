import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components";
import { routes } from "@/shared/constants/routes";
import { ArrowLeft } from "lucide-react";

export function LoginPage() {
  const handleSubmit = async (values: { email: string; password: string }) => {
    console.log("Login submit", values);
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-[400px] space-y-6">
        <Button variant="outline" size="sm" asChild>
          <Link to={routes.home} className="gap-2">
            <ArrowLeft className="size-4" />
            홈으로
          </Link>
        </Button>
        <Card>
          <CardHeader className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Pick-e-Eat</h1>
            <p className="text-muted-foreground">로그인하여 맞춤 음식점을 추천받으세요</p>
          </CardHeader>
          <CardContent>
            <LoginForm onSubmit={handleSubmit} showSignupLink compact={false} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
