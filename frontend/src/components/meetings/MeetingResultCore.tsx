"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ListTodo,
  Lightbulb,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { MeetingIntelligence } from "@/lib/meeting-intelligence";

interface MeetingResultCoreProps {
  intelligence: MeetingIntelligence;
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative flex flex-col items-center justify-center p-6 rounded-xl border border-surface-800/60 bg-surface-950/40"
    >
      <svg width="88" height="88" className="-rotate-90">
        <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <motion.circle
          cx="44"
          cy="44"
          r="36"
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-white">{score}</span>
        <span className="text-[10px] text-surface-500 uppercase tracking-wider">/ 100</span>
      </div>
      <p className="text-xs text-surface-400 mt-3 text-center">{label}</p>
    </motion.div>
  );
}

function ResultBlock({
  title,
  icon: Icon,
  items,
  emptyText,
  accent = "primary",
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
  emptyText: string;
  accent?: "primary" | "accent" | "amber" | "red";
}) {
  const colors = {
    primary: "text-primary-400 bg-primary-500/10 border-primary-500/20",
    accent: "text-accent-400 bg-accent-500/10 border-accent-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  return (
    <Card className="card-premium h-full">
      <div className="h-full flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-4"
        >
          <div className={`p-1.5 rounded-lg border ${colors[accent]}`}>
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </motion.div>
        {items.length === 0 ? (
          <p className="text-xs text-surface-500">{emptyText}</p>
        ) : (
          <ul className="space-y-2 flex-1">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                <span className="w-1 h-1 rounded-full bg-surface-600 mt-2 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

export function MeetingResultCore({ intelligence }: MeetingResultCoreProps) {
  const { t } = useI18n();

  const scoreLabels = {
    excellent: t("meetingResult.scoreExcellent"),
    good: t("meetingResult.scoreGood"),
    fair: t("meetingResult.scoreFair"),
    needs_attention: t("meetingResult.scoreNeedsAttention"),
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary-400" />
        <h2 className="text-lg font-semibold text-white">{t("meetingResult.title")}</h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 card-premium border-primary-500/15 bg-gradient-to-br from-primary-500/8 via-transparent to-transparent">
          <p className="text-xs font-medium text-primary-300/80 uppercase tracking-wider mb-2">
            {t("meetingResult.tldr")}
          </p>
          <p className="text-base text-surface-200 leading-relaxed">
            {intelligence.tldr || t("meetingResult.noTldr")}
          </p>
        </Card>

        <ScoreRing
          score={intelligence.effectivenessScore}
          label={scoreLabels[intelligence.effectivenessLabel]}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <ResultBlock
          title={t("meetingResult.decisions")}
          icon={CheckCircle2}
          items={intelligence.decisions}
          emptyText={t("meetingResult.noDecisions")}
          accent="accent"
        />
        <ResultBlock
          title={t("meetingResult.actionItems")}
          icon={ListTodo}
          items={intelligence.actionItems}
          emptyText={t("meetingResult.noActions")}
          accent="primary"
        />
        <ResultBlock
          title={t("meetingResult.risks")}
          icon={AlertTriangle}
          items={intelligence.risks}
          emptyText={t("meetingResult.noRisks")}
          accent="amber"
        />
        <Card className="card-premium">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg border border-surface-700/50 bg-surface-800/30">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">{t("meetingResult.aiInsight")}</h3>
          </div>
          <div className="space-y-3">
            {intelligence.positives.length > 0 && (
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                <p className="text-xs text-emerald-400/90 font-medium mb-1 flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" /> {t("meetingResult.wentWell")}
                </p>
                <ul className="space-y-1">
                  {intelligence.positives.slice(0, 3).map((p, i) => (
                    <li key={i} className="text-xs text-surface-400">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {intelligence.concerns.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
                <p className="text-xs text-amber-400/90 font-medium mb-1 flex items-center gap-1">
                  <ThumbsDown className="w-3 h-3" /> {t("meetingResult.watchOut")}
                </p>
                <ul className="space-y-1">
                  {intelligence.concerns.slice(0, 3).map((c, i) => (
                    <li key={i} className="text-xs text-surface-400">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {intelligence.positives.length === 0 && intelligence.concerns.length === 0 && (
              <p className="text-xs text-surface-500 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {t("meetingResult.noInsights")}
              </p>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
