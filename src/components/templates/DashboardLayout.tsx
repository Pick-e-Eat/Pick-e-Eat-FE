// 사이드바가 필요한 대시보드형 레이아웃 템플릿
import type { ReactNode } from "react";
import { Header } from "@/components/organisms/Header";
import { Sidebar } from "@/components/organisms/Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-8">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
