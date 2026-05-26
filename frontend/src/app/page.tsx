"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { CinematicAtmosphere } from "@/components/layout/CinematicAtmosphere";
import { HeroMemoryPreview } from "@/components/landing/HeroMemoryPreview";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import {
  Mic,
  Brain,
  Search,
  FileText,
  BarChart3,
  ArrowRight,
  Users,
  Command,
  GitBranch,
  Sparkles,
  Clock,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const { t } = useI18n();

  const pillars = [
    { icon: Brain, title: t("landing.pillar1Title"), description: t("landing.pillar1Desc") },
    { icon: Clock, title: t("landing.pillar2Title"), description: t("landing.pillar2Desc") },
    { icon: Sparkles, title: t("landing.pillar3Title"), description: t("landing.pillar3Desc") },
    { icon: Search, title: t("landing.pillar4Title"), description: t("landing.pillar4Desc") },
    { icon: GitBranch, title: t("landing.pillar5Title"), description: t("landing.pillar5Desc") },
    { icon: Zap, title: t("landing.pillar6Title"), description: t("landing.pillar6Desc") },
  ];

  const features = [
    { icon: Mic, title: t("landing.feature1Title"), description: t("landing.feature1Desc") },
    { icon: Brain, title: t("landing.feature2Title"), description: t("landing.feature2Desc") },
    { icon: Search, title: t("landing.feature3Title"), description: t("landing.feature3Desc") },
    { icon: FileText, title: t("landing.feature4Title"), description: t("landing.feature4Desc") },
    { icon: BarChart3, title: t("landing.feature5Title"), description: t("landing.feature5Desc") },
    { icon: Users, title: t("landing.feature6Title"), description: t("landing.feature6Desc") },
  ];

  const stats = [
    { value: t("landing.stat1Value"), label: t("landing.stat1Label") },
    { value: t("landing.stat2Value"), label: t("landing.stat2Label") },
    { value: t("landing.stat3Value"), label: t("landing.stat3Label") },
  ];

  return (
    <div className="min-h-screen landing-bg overflow-hidden relative">
      <CinematicAtmosphere variant="landing" />
      <div className="noise-overlay absolute inset-0 z-[1]" aria-hidden />

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative border-b border-surface-800/50 backdrop-blur-xl bg-[#08080d]/60 z-20"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost">{t("landing.signIn")}</Button>
            </Link>
            <Link href="/login">
              <Button>{t("landing.getStarted")}</Button>
            </Link>
          </div>
        </div>
      </motion.header>

      <main className="relative z-10">
        <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8 glow">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-primary-300">{t("landing.badge")}</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-white leading-[1.08] mb-5 tracking-tight"
          >
            {t("landing.heroTitle1")}
            <br />
            <span className="text-gradient">{t("landing.heroTitle2")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-primary-300/90 font-medium mb-4"
          >
            {t("landing.tagline")}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-xl text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t("landing.heroDesc")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/login">
              <Button size="lg" className="gap-2 text-base px-8 py-3 glow">
                {t("landing.startFree")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="secondary" size="lg" className="text-base px-8 py-3">
                {t("landing.tryDemo")}
              </Button>
            </Link>
          </motion.div>

          <HeroMemoryPreview />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.58 }}
            className="mt-8 inline-flex items-center gap-2 text-sm text-surface-500"
          >
            <Command className="w-3.5 h-3.5" />
            <span>{t("landing.cmdHint")}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mt-16 pt-12 border-t border-surface-800/30"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center min-w-[100px]">
                <p className="text-3xl font-bold text-gradient">{stat.value}</p>
                <p className="text-sm text-surface-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </section>

        <section className="relative max-w-6xl mx-auto px-6 py-20 border-t border-surface-800/20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-bold text-white mb-3">{t("landing.whyFailTitle")}</h2>
            <p className="text-surface-400 max-w-2xl mx-auto leading-relaxed">{t("landing.whyFailDesc")}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-4 mb-20"
          >
            {[t("landing.whyFail1"), t("landing.whyFail2"), t("landing.whyFail3")].map((item, i) => (
              <div key={i} className="glass card-premium p-5 rounded-xl text-sm text-surface-400">
                {item}
              </div>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-bold text-white mb-3">{t("landing.howTitle")}</h2>
            <p className="text-surface-400 max-w-xl mx-auto">{t("landing.howDesc")}</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-4 mb-20">
            {[
              { step: "01", text: t("landing.howStep1") },
              { step: "02", text: t("landing.howStep2") },
              { step: "03", text: t("landing.howStep3") },
              { step: "04", text: t("landing.howStep4") },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="card-premium p-5 rounded-xl border border-surface-800/50"
              >
                <span className="text-xs font-mono text-primary-400">{s.step}</span>
                <p className="text-sm text-surface-300 mt-2">{s.text}</p>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-bold text-white mb-3">{t("landing.pillarsTitle")}</h2>
            <p className="text-surface-400 max-w-xl mx-auto">{t("landing.pillarsDesc")}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                className="card-premium glass p-6 rounded-xl"
              >
                <pillar.icon className="w-5 h-5 text-accent-400 mb-3" />
                <h3 className="text-base font-semibold text-white mb-2">{pillar.title}</h3>
                <p className="text-sm text-surface-400 leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="relative max-w-6xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-bold text-white mb-3">{t("landing.featuresTitle")}</h2>
            <p className="text-surface-400 max-w-xl mx-auto">{t("landing.featuresDesc")}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="glass card-hover p-6 cursor-default rounded-xl"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-500/10 mb-4">
                  <feature.icon className="w-5 h-5 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-surface-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="relative max-w-4xl mx-auto px-6 py-20 border-t border-surface-800/30 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-10 glow-accent card-premium"
          >
            <h2 className="text-3xl font-bold text-white mb-4">{t("landing.ctaTitle")}</h2>
            <p className="text-surface-400 mb-8">{t("landing.ctaDesc")}</p>
            <Link href="/login">
              <Button size="lg" className="gap-2 text-base px-8 py-3">
                {t("landing.ctaButton")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </section>
      </main>

      <footer className="relative border-t border-surface-800/30 py-8 text-center text-sm text-surface-500 z-10">
        {t("landing.footer")}
      </footer>
    </div>
  );
}
