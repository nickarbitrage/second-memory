"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  CheckSquare,
  FileText,
  Users,
  MessageSquare,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface AINextStepsCardProps {
  nextSteps?: string[];
}

function getIconForStep(step: string) {
  const lowerStep = step.toLowerCase();
  if (
    lowerStep.includes("schedule") ||
    lowerStep.includes("meeting") ||
    lowerStep.includes("review")
  ) {
    return Calendar;
  } else if (lowerStep.includes("confirm") || lowerStep.includes("decide")) {
    return CheckSquare;
  } else if (lowerStep.includes("prepare") || lowerStep.includes("document")) {
    return FileText;
  } else if (lowerStep.includes("discuss") || lowerStep.includes("talk")) {
    return Users;
  } else if (lowerStep.includes("follow") || lowerStep.includes("send")) {
    return MessageSquare;
  }
  return Lightbulb;
}

export function AINextStepsCard({ nextSteps }: AINextStepsCardProps) {
  const { t } = useI18n();

  if (!nextSteps || nextSteps.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="relative border border-primary-500/30 bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-primary-600/5 rounded-xl p-6 backdrop-blur-sm overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-transparent to-accent-600/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary-500/20 border border-primary-500/20">
            <Sparkles className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-surface-300">
              {t("meetings.aiRecommendations")}
            </h3>
            <p className="text-lg font-semibold text-primary-400">{t("meetings.nextSteps")}</p>
          </div>
        </div>

        <div className="space-y-3">
          {nextSteps.map((step, index) => {
            const Icon = getIconForStep(step);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: 0.3 + index * 0.05,
                }}
                className="flex items-start gap-3 p-3 rounded-lg bg-surface-800/30 border border-surface-700/50 hover:border-primary-500/20 transition-colors duration-200"
              >
                <Icon className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-surface-200 leading-relaxed">{step}</span>
              </motion.div>
            );
          })}
        </div>

        <p className="text-xs text-surface-500 mt-4 flex items-center gap-2">
          <Sparkles className="w-3 h-3" />
          {t("meetings.aiSuggestionsNote")}
        </p>
      </div>
    </motion.div>
  );
}
