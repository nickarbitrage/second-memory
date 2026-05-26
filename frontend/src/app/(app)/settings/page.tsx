"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useI18n, Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { Loader2, Globe, User, Save, Camera } from "lucide-react";
import Image from "next/image";

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

export default function SettingsPage() {
  const { user, setAuth, token } = useAuthStore();
  const { t, setLanguage } = useI18n();
  const [name, setName] = useState("");
  const [language, setLanguageLocal] = useState<Language>("en");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await api.getProfile();
        setName(profile.name);
        const lang = (profile.language === "ru" ? "ru" : "en") as Language;
        setLanguageLocal(lang);
        setLanguage(lang);
        setAvatarUrl(profile.avatar_url || null);
        if (!user) {
          setAuth(profile, token || localStorage.getItem("token") || "");
        }
      } catch {
        toast.error(t("settings.loadFailed"));
      }
    };
    loadProfile();
  }, [setAuth, token, user, setLanguage, t]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.updateProfile({ name, language });
      setAuth(updated, token || localStorage.getItem("token") || "");
      setLanguage(language);
      toast.success(t("settings.saved"));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("settings.saveFailed"));
    }
    setSaving(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("settings.imageRequired"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("settings.imageTooLarge"));
      return;
    }

    setAvatarLoading(true);
    try {
      const updated = await api.uploadAvatar(file);
      setAvatarUrl(updated.avatar_url || null);
      setAuth(updated, token || localStorage.getItem("token") || "");
      toast.success(t("settings.avatarUpdated"));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("settings.avatarFailed"));
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={t("settings.title")}
        description={t("settings.subtitle")}
        showBack
        backHref="/dashboard"
        breadcrumbs={[
          { label: t("nav.dashboard"), href: "/dashboard" },
          { label: t("settings.title") },
        ]}
      />

      <div className="space-y-6">
        <div className="bg-surface-900/50 border border-surface-800/50 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500/20">
              <User className="w-4 h-4 text-primary-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">{t("settings.profile")}</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-3">
                {t("settings.avatar")}
              </label>
              <div className="flex items-center gap-4">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover border border-primary-500/30"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarLoading}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                  >
                    {avatarLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                    {avatarLoading ? t("settings.uploading") : t("settings.changeAvatar")}
                  </button>
                  <p className="text-xs text-surface-400 mt-2">{t("settings.avatarHint")}</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={avatarLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                {t("settings.displayName")}
              </label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                {t("settings.email")}
              </label>
              <div className="px-3 py-2 rounded-lg bg-surface-800/50 border border-surface-700/50 text-surface-500 text-sm">
                {user?.email}
              </div>
              <p className="text-xs text-surface-500 mt-1">{t("settings.emailCannotChange")}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-900/50 border border-surface-800/50 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-500/20">
              <Globe className="w-4 h-4 text-accent-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">{t("settings.language")}</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguageLocal(lang.code)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 ${
                  language === lang.code
                    ? "bg-primary-500/10 border-primary-500/30 text-white"
                    : "bg-surface-800/30 border-surface-700/50 text-surface-400 hover:border-surface-600"
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="font-medium text-sm">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface-900/30 border border-surface-800/30 rounded-xl p-6 border-dashed">
          <h2 className="text-sm font-medium text-surface-400">{t("settings.preferences")}</h2>
          <p className="text-xs text-surface-500 mt-1">{t("settings.preferencesDesc")}</p>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t("settings.save")}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
