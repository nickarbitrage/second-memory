"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { TopBar } from "@/components/layout/TopBar";
import { CommandPalette } from "@/components/search/CommandPalette";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { CinematicAtmosphere } from "@/components/layout/CinematicAtmosphere";
import { CursorGlow } from "@/components/layout/CursorGlow";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { Loader2 } from "lucide-react";

const Sidebar = dynamic(
  () => import("@/components/layout/Sidebar").then((mod) => ({ default: mod.Sidebar })),
  {
    ssr: false,
    loading: () => (
      <aside className="w-60 h-full flex items-center justify-center bg-[#0c0c14]/75 border-r border-surface-800/60">
        <Loader2 className="w-5 h-5 animate-spin text-surface-500" />
      </aside>
    ),
  }
);

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { setLanguage } = useI18n();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    api.setToken(token);

    api
      .getMe()
      .then((user) => {
        setAuth(user, token);
        if (user.language === "en" || user.language === "ru") {
          setLanguage(user.language);
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/login");
      });
  }, [router, setAuth, setLanguage]);

  return (
    <div className="flex h-screen overflow-hidden workspace-bg">
      <CinematicAtmosphere variant="workspace" />
      <CursorGlow />
      <div className="noise-overlay" aria-hidden />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative z-10">
        <TopBar />
        <main className="flex-1 overflow-y-auto scroll-smooth p-4 sm:p-5 lg:p-6 xl:p-8 relative">
          {children}
        </main>
      </div>
      <CommandPalette />
      <OnboardingModal />
    </div>
  );
}
