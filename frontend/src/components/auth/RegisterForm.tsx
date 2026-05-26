"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Sparkles, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export function RegisterForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;
    const confirm = form.get("confirmPassword") as string;

    if (password !== confirm) {
      setError(t("auth.passwordsNoMatch"));
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError(t("auth.passwordMin8"));
      setLoading(false);
      return;
    }

    try {
      const data = await api.register(
        form.get("email") as string,
        form.get("name") as string,
        password
      );
      api.setToken(data.access_token);
      setAuth(data.user, data.access_token);
      toast.success(t("auth.accountCreated"));
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("auth.registerFailed");
      toast.error(msg);
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 mb-4">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">{t("auth.createYourAccount")}</h1>
        <p className="text-surface-400 mt-1">{t("auth.createSubtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="name" label={t("auth.name")} placeholder={t("auth.enterName")} required />
        <Input
          name="email"
          type="email"
          label={t("auth.email")}
          placeholder={t("auth.enterEmail")}
          required
        />
        <div className="relative">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            label={t("auth.password")}
            placeholder={t("auth.enterPassword")}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-surface-500 hover:text-surface-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <Input
          name="confirmPassword"
          type="password"
          label={t("auth.confirmPassword")}
          placeholder={t("auth.enterPassword")}
          required
          autoComplete="new-password"
        />

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            t("auth.createAccount")
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-surface-400 mt-6">
        {t("auth.haveAccount")}{" "}
        <Link
          href="/login"
          className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
        >
          {t("auth.signIn")}
        </Link>
      </p>
    </div>
  );
}
