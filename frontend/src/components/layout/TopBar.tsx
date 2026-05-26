"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { openCommandPalette } from "@/components/search/CommandPalette";
import { useI18n } from "@/lib/i18n";
import { Settings, Search } from "lucide-react";

export function TopBar() {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const pathname = usePathname();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  const shortcutKey = isMac ? "⌘K" : "Ctrl+K";

  return (
    <header className="h-16 border-b border-surface-800/50 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-[#0c0c14]/70 backdrop-blur-xl relative z-20">
      <div className="flex items-center gap-3 pl-10 lg:pl-0">
        <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse-slow" />
        <span className="text-sm text-surface-400">{t("copilot.demoCompany")}</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => openCommandPalette()}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800/50 border border-surface-700/50 hover:border-primary-500/30 hover:bg-surface-800/80 transition-all duration-200 text-surface-400 hover:text-surface-200 active:scale-[0.98]"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="text-xs">{t("commandPalette.searchMeetings")}</span>
          <kbd className="text-[10px] bg-surface-900/80 px-1.5 py-0.5 rounded border border-surface-700/60 text-surface-500">
            {shortcutKey}
          </kbd>
        </button>
        <button
          type="button"
          onClick={() => openCommandPalette()}
          className="sm:hidden p-2 rounded-lg bg-surface-800/50 border border-surface-700/50 text-surface-400"
          aria-label={t("commandPalette.title")}
        >
          <Search className="w-4 h-4" />
        </button>
        {pathname === "/search" && (
          <span className="hidden md:inline text-xs text-accent-400/90 px-2 py-1 rounded-md bg-accent-500/10 border border-accent-500/20">
            {t("analyst.modeAnalyst")}
          </span>
        )}
        <LanguageSwitcher />
        {user && (
          <Link
            href="/settings"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800/50 border border-surface-700/50 hover:border-surface-600/50 transition-colors"
          >
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-sm text-surface-300 font-medium hidden sm:inline max-w-[120px] truncate">
              {user.name}
            </span>
            <Settings className="w-3.5 h-3.5 text-surface-500 sm:hidden" />
          </Link>
        )}
      </div>
    </header>
  );
}
