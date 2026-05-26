"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
}

export function BackButton({ fallbackHref = "/dashboard", label }: BackButtonProps) {
  const router = useRouter();
  const { t } = useI18n();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1.5 -ml-2">
      <ArrowLeft className="w-4 h-4" />
      <span className="hidden sm:inline">{label ?? t("common.back")}</span>
    </Button>
  );
}
