"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { CinematicAtmosphere } from "@/components/layout/CinematicAtmosphere";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";
import { markOnboardingComplete } from "@/lib/onboarding";

export default function DemoPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const enterWorkspace = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.login("demo@meetmind.ai", "demo1234");
      api.setToken(data.access_token);
      setAuth(data.user, data.access_token);
      markOnboardingComplete({ name: data.user?.name });
      router.push("/dashboard");
    } catch {
      setError(t("auth.demoFailed"));
    }
    setLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.setToken(token);
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen landing-bg relative overflow-hidden flex flex-col">
      <CinematicAtmosphere variant="landing" />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg space-y-8"
        >
          <BrandLogo size="lg" className="justify-center" />
          <div>
            <p className="text-sm text-primary-400 font-medium uppercase tracking-widest mb-3">
              {t("demo.badge")}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("demo.title")}</h1>
            <p className="text-surface-400 leading-relaxed">{t("demo.desc")}</p>
          </div>
          <ul className="text-left text-sm text-surface-400 space-y-2 max-w-sm mx-auto">
            {[t("demo.feature1"), t("demo.feature2"), t("demo.feature3"), t("demo.feature4")].map(
              (f) => (
                <li key={f} className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent-400 shrink-0" />
                  {f}
                </li>
              )
            )}
          </ul>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button size="lg" className="gap-2 px-10 glow" onClick={enterWorkspace} disabled={loading}>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {t("demo.enter")}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
          <p className="text-xs text-surface-600">{t("demo.noSignup")}</p>
        </motion.div>
      </div>
    </div>
  );
}
