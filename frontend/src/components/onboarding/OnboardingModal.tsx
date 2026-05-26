"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Sparkles, User, Briefcase, Target } from "lucide-react";

import {
  markOnboardingComplete,
  readOnboarding,
  shouldSkipOnboarding,
  type OnboardingData,
} from "@/lib/onboarding";

export function OnboardingModal() {
  const { t } = useI18n();
  const { user, setAuth } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [goal, setGoal] = useState("");

  useEffect(() => {
    if (shouldSkipOnboarding(user?.email)) {
      markOnboardingComplete();
      return;
    }
    const saved = readOnboarding();
    if (saved?.completed) return;
    const timer = setTimeout(() => {
      setName(user?.name || "");
      setOpen(true);
    }, 600);
    return () => clearTimeout(timer);
  }, [user?.email, user?.name]);

  const finish = async (skipped = false) => {
    markOnboardingComplete({
      name: name.trim() || user?.name,
      role: role || undefined,
      goal: goal || undefined,
    });
    if (!skipped && name.trim() && name.trim() !== user?.name) {
      try {
        const updated = await api.updateProfile({ name: name.trim() });
        const token = localStorage.getItem("token");
        if (token) setAuth(updated, token);
      } catch {
        /* profile update optional */
      }
    }
    setOpen(false);
  };

  const roles = [
    { id: "dev", label: t("onboarding.roleDev"), icon: User },
    { id: "manager", label: t("onboarding.roleManager"), icon: Briefcase },
    { id: "founder", label: t("onboarding.roleFounder"), icon: Target },
  ];

  const goals = [
    { id: "productivity", label: t("onboarding.goalProductivity") },
    { id: "meetings", label: t("onboarding.goalMeetings") },
    { id: "teams", label: t("onboarding.goalTeams") },
  ];

  const titles = [t("onboarding.step1Title"), t("onboarding.step2Title"), t("onboarding.step3Title")];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="w-full max-w-md rounded-2xl border border-surface-700/80 bg-surface-950/95 shadow-2xl p-6 card-premium"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-xl bg-primary-500/20 border border-primary-500/30">
                <Sparkles className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{t("onboarding.welcome")}</h2>
                <p className="text-xs text-surface-500">{titles[step]}</p>
              </div>
            </div>

            <div className="flex gap-1.5 mb-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= step ? "bg-primary-500" : "bg-surface-800"
                  }`}
                />
              ))}
            </div>

            {step === 0 && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("onboarding.step1Title")}
                className="w-full px-4 py-3 rounded-xl bg-surface-900 border border-surface-700 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                autoFocus
              />
            )}

            {step === 1 && (
              <div className="grid gap-2">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      role === r.id
                        ? "border-primary-500/50 bg-primary-500/10 text-primary-200"
                        : "border-surface-800 bg-surface-900/50 text-surface-300 hover:border-surface-700"
                    }`}
                  >
                    <r.icon className="w-5 h-5 shrink-0" />
                    {r.label}
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-2">
                {goals.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id)}
                    className={`p-3 rounded-xl border text-sm text-left transition-all ${
                      goal === g.id
                        ? "border-accent-500/50 bg-accent-500/10 text-accent-200"
                        : "border-surface-800 bg-surface-900/50 text-surface-300 hover:border-surface-700"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-8 gap-3">
              <button
                type="button"
                onClick={() => finish(true)}
                className="text-sm text-surface-500 hover:text-surface-300 transition-colors"
              >
                {t("onboarding.skip")}
              </button>
              <div className="flex gap-2">
                {step > 0 && (
                  <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
                    Back
                  </Button>
                )}
                <Button
                  onClick={() => {
                    if (step < 2) setStep((s) => s + 1);
                    else finish(false);
                  }}
                  disabled={step === 0 && !name.trim()}
                >
                  {step < 2 ? t("onboarding.continue") : t("onboarding.finish")}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
