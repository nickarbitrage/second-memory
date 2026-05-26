"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Upload,
  Brain,
  Users,
  FileText,
  Sparkles,
  GitBranch,
  CheckCircle2,
  Network,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const PROCESSING_STAGE_ICONS: LucideIcon[] = [
  Upload,
  Users,
  FileText,
  Brain,
  Sparkles,
  GitBranch,
  Network,
  CheckCircle2,
];

export function useProcessingStages() {
  const { t } = useI18n();
  return [
    t("processing.stage1"),
    t("processing.stage2"),
    t("processing.stage3"),
    t("processing.stage4"),
    t("processing.stage5"),
    t("processing.stage6"),
    t("processing.stage7"),
    t("processing.stage8"),
  ];
}

export interface AIProcessingPanelProps {
  stage: number;
  stages: string[];
  progress: number;
  typedHint: string;
  showStageList?: boolean;
  transcriptLines?: string[];
}

export function AIProcessingPanel({
  stage,
  stages,
  progress,
  typedHint,
  showStageList = true,
  transcriptLines,
}: AIProcessingPanelProps) {
  const { t } = useI18n();
  const safeStage = Math.min(stage, stages.length - 1);
  const CurrentIcon = PROCESSING_STAGE_ICONS[safeStage % PROCESSING_STAGE_ICONS.length];

  return (
    <motion.div
      className="rounded-xl border border-primary-500/20 bg-gradient-to-br from-[#0c0c14]/95 via-primary-500/5 to-transparent backdrop-blur-xl p-6 sm:p-8 card-premium relative overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-500/5 pointer-events-none"
        animate={{ opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div className="relative flex items-center gap-4 mb-6">
        <motion.div className="relative">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-500/15 border border-primary-500/30"
          >
            <CurrentIcon className="w-6 h-6 text-primary-400" />
          </motion.div>
          <motion.span
            className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent-400 shadow-lg shadow-accent-400/50"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
        <motion.div className="flex-1 min-w-0">
          <p className="text-xs text-primary-400/90 font-medium uppercase tracking-wider mb-1">
            {t("processing.badge")}
          </p>
          <AnimatePresence mode="wait">
            <motion.h3
              key={safeStage}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-lg font-semibold text-white"
            >
              {stages[safeStage]}
            </motion.h3>
          </AnimatePresence>
          <p className="text-sm text-surface-500 mt-1 font-mono min-h-[1.25rem]">
            {typedHint}
            <span className="inline-block w-0.5 h-3.5 bg-primary-400 ml-0.5 animate-pulse align-middle" />
          </p>
        </motion.div>
      </motion.div>

      <motion.div className="relative space-y-4">
        <motion.div className="w-full h-2 rounded-full bg-surface-800/80 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary-600 via-primary-400 to-accent-400"
            style={{ width: `${Math.min(progress, 100)}%` }}
            layout
          />
        </motion.div>
        <p className="text-xs text-surface-500 text-right">
          {safeStage + 1} / {stages.length}
        </p>

        {transcriptLines && transcriptLines.length > 0 && (
          <motion.div className="rounded-lg bg-surface-950/60 border border-surface-800/50 p-3 min-h-[72px]">
            <p className="text-[10px] uppercase tracking-wider text-surface-600 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {t("meetings.liveTranscript")}
            </p>
            <motion.div className="space-y-1.5 font-mono text-xs text-surface-400 max-h-28 overflow-y-auto">
              {transcriptLines.map((line, i) => (
                <motion.p
                  key={`${i}-${line.slice(0, 16)}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {line}
                </motion.p>
              ))}
              <motion.span
                className="inline-block w-1.5 h-3 bg-primary-400/80"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        )}

        {showStageList && (
          <motion.div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {stages.map((label, i) => {
              const Icon = PROCESSING_STAGE_ICONS[i % PROCESSING_STAGE_ICONS.length];
              const isCompleted = i < safeStage;
              const isCurrent = i === safeStage;

              return (
                <motion.div
                  key={label}
                  initial={false}
                  animate={{
                    opacity: isCompleted || isCurrent ? 1 : 0.45,
                    x: isCurrent ? 4 : 0,
                  }}
                  className={`flex items-center gap-3 text-sm transition-colors ${
                    isCompleted
                      ? "text-accent-400"
                      : isCurrent
                      ? "text-white"
                      : "text-surface-600"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin shrink-0 text-primary-400" />
                  ) : (
                    <Icon className="w-4 h-4 shrink-0" />
                  )}
                  <span>{label}</span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
