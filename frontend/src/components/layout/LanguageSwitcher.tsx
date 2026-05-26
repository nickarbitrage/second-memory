"use client";

import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  const handleChange = async (lang: "en" | "ru") => {
    setLanguage(lang);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      api.setToken(token);
      try {
        await api.updateProfile({ language: lang });
      } catch {
        // Local preference still applied
      }
    }
  };

  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-surface-800/40 border border-surface-700/40">
      <Globe className="w-3.5 h-3.5 text-surface-400" />
      <select
        value={language}
        onChange={(e) => handleChange(e.target.value as "en" | "ru")}
        className="bg-transparent text-xs text-surface-300 border-0 p-0 pr-4 cursor-pointer hover:text-white transition-colors focus:outline-none"
      >
        <option value="en" className="bg-surface-900">EN</option>
        <option value="ru" className="bg-surface-900">RU</option>
      </select>
    </div>
  );
}
