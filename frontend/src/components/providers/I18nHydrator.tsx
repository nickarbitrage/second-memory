"use client";

import { useEffect } from "react";
import { useI18n, Language } from "@/lib/i18n";

export function I18nHydrator() {
  const setLanguage = useI18n((s) => s.setLanguage);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("secondmemory-language") as Language | null;
      if (saved === "en" || saved === "ru") {
        setLanguage(saved);
      }
    } catch {}
  }, [setLanguage]);

  return null;
}
