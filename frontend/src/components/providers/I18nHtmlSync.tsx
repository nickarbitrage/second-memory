"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";

export function I18nHtmlSync() {
  const language = useI18n((s) => s.language);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}
