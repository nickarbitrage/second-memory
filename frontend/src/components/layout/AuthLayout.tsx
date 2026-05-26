"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { CinematicAtmosphere } from "@/components/layout/CinematicAtmosphere";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen landing-bg flex flex-col relative overflow-hidden">
      <CinematicAtmosphere variant="landing" />
      <div className="noise-overlay" aria-hidden />
      <header className="flex items-center justify-between px-6 h-16 border-b border-surface-800/40 backdrop-blur-md relative z-20">
        <Link href="/">
          <BrandLogo size="sm" />
        </Link>
        <LanguageSwitcher />
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">{children}</div>
    </div>
  );
}
