"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { BrandLogo } from "@/components/layout/BrandLogo";
import {
  LayoutDashboard,
  Mic,
  Search,
  BarChart3,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Settings,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/record", label: t("nav.record"), icon: Mic },
    { href: "/search", label: t("nav.search"), icon: Search },
    { href: "/analytics", label: t("nav.analytics"), icon: BarChart3 },
  ];

  const bottomNavItems = [
    { href: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    toast.info(t("common.loggedOut"));
    router.push("/");
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface-900 border border-surface-800 text-surface-400 hover:text-white"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static top-0 left-0 h-full z-40 flex flex-col border-r border-surface-800/60 bg-[#0c0c14]/75 backdrop-blur-xl transition-all duration-300",
          collapsed ? "lg:w-16" : "lg:w-60",
          "w-60",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center gap-3 px-4 h-16 border-b border-surface-800/50">
          {collapsed ? (
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 mx-auto">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          ) : (
            <BrandLogo size="sm" />
          )}
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary-500/12 text-primary-300 border border-primary-500/25 shadow-sm shadow-primary-500/5"
                    : "text-surface-400 hover:text-surface-200 hover:bg-surface-800/50 border border-transparent"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1 h-4 rounded-full bg-primary-500" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 pb-2 space-y-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary-500/12 text-primary-300 border border-primary-500/25 shadow-sm shadow-primary-500/5"
                    : "text-surface-400 hover:text-surface-200 hover:bg-surface-800/50 border border-transparent"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        <div className="px-2 pb-4 space-y-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-surface-400 hover:text-surface-200 hover:bg-surface-800/50 transition-all duration-150"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>{t("settings.logout")}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
