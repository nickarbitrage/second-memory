"use client";

import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface SentimentData {
  overall?: "positive" | "neutral" | "negative";
  confidence?: number;
  intensity?: "low" | "medium" | "high";
  collaboration?: number;
}

interface SentimentCardProps {
  sentiment?: SentimentData | Record<string, unknown>;
}

export function SentimentCard({ sentiment }: SentimentCardProps) {
  const { t } = useI18n();
  const data = sentiment as SentimentData;

  if (!data || !data.overall) {
    return null;
  }

  const confidencePercentage = data.confidence || 0;
  const collaborationPercentage = data.collaboration || 0;

  const sentimentColors = {
    positive: {
      bg: "from-emerald-500/10 to-emerald-600/5",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
      bar: "from-emerald-400",
      icon: ThumbsUp,
      label: t("meetings.positive"),
    },
    neutral: {
      bg: "from-amber-500/10 to-amber-600/5",
      border: "border-amber-500/20",
      text: "text-amber-400",
      bar: "from-amber-400",
      icon: Minus,
      label: t("meetings.neutral"),
    },
    negative: {
      bg: "from-red-500/10 to-red-600/5",
      border: "border-red-500/20",
      text: "text-red-400",
      bar: "from-red-400",
      icon: ThumbsDown,
      label: t("meetings.negative"),
    },
  };

  const intensityDisplay = {
    low: t("meetings.lowEngagement"),
    medium: t("meetings.mediumEngagement"),
    high: t("meetings.highEngagement"),
  };

  const colors = sentimentColors[data.overall];
  const Icon = colors.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-xl p-6 backdrop-blur-sm`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg bg-surface-900/50 border ${colors.border}`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-surface-300">{t("meetings.sentiment")}</h3>
          <p className={`text-lg font-semibold ${colors.text}`}>{colors.label}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-surface-400">
              {t("meetings.confidenceScore")}
            </span>
            <span className="text-sm font-semibold text-white">{confidencePercentage}%</span>
          </div>
          <div className="h-2 bg-surface-800/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidencePercentage}%` }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className={`h-full bg-gradient-to-r ${colors.bar} to-transparent`}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-surface-400">
              {t("meetings.teamCollaboration")}
            </span>
            <span className="text-sm font-semibold text-white">{collaborationPercentage}%</span>
          </div>
          <div className="h-2 bg-surface-800/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${collaborationPercentage}%` }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-400 to-transparent"
            />
          </div>
        </div>

        <div className="pt-2">
          <span className="text-xs font-medium text-surface-400 block mb-2">
            {t("meetings.discussionIntensity")}
          </span>
          <div className="inline-block px-3 py-1 bg-surface-800/50 rounded-full">
            <span className="text-sm font-medium text-surface-300">
              {intensityDisplay[data.intensity || "medium"]}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
