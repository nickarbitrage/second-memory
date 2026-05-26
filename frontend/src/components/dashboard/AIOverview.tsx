"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Calendar, MessageSquare, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { DashboardInsights } from "@/lib/dashboard-insights";

interface AIOverviewProps {
  insights: DashboardInsights;
}

export function AIOverview({ insights }: AIOverviewProps) {
  const { t } = useI18n();

  return (
    <section id="ai-overview" className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-primary-500/20 border border-primary-500/20">
          <Sparkles className="w-4 h-4 text-primary-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">{t("aiOverview.title")}</h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Card className="card-premium h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-surface-500 uppercase tracking-wider">
                {t("aiOverview.productivity")}
              </span>
              <Zap className="w-4 h-4 text-accent-400" />
            </div>
            <p className="text-3xl font-bold text-gradient">{insights.productivityScore}</p>
            <div className="mt-2 h-1.5 rounded-full bg-surface-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${insights.productivityScore}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
              />
            </div>
            <p className="text-xs text-surface-500 mt-2">
              {insights.completionRate}% {t("aiOverview.tasksDone")}
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <Card className="card-premium h-full">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary-400" />
              <span className="text-xs text-surface-500 uppercase tracking-wider">
                {t("aiOverview.meetingsThisWeek")}
              </span>
            </div>
            <p className="text-3xl font-bold text-white">{insights.meetingsThisWeek}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-surface-500">
              <TrendingUp className="w-3 h-3 text-accent-400" />
              {t("aiOverview.processedByAI")}
            </div>
            {insights.peakDayCount > 0 && (
              <p className="text-xs text-surface-500 mt-2 pt-2 border-t border-surface-800/50">
                {insights.peakDayLabel} · {insights.peakDayCount}
              </p>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="sm:col-span-2 lg:col-span-1"
        >
          <Card className="card-premium h-full border-primary-500/15 bg-gradient-to-br from-primary-500/8 via-transparent to-accent-500/5">
            <p className="text-xs text-surface-500 uppercase tracking-wider mb-2">
              {t("aiOverview.weeklyInsight")}
            </p>
            <p className="text-sm text-surface-300 leading-relaxed line-clamp-4">
              {insights.weeklyInsight}
            </p>
          </Card>
        </motion.div>
      </div>

      {insights.topTopics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12 }}
        >
          <Card className="card-premium">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-accent-400" />
              <span className="text-sm font-medium text-white">{t("aiOverview.topTopics")}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {insights.topTopics.map((topic) => (
                <div
                  key={topic.category}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-900/60 border border-surface-800/50 hover:border-surface-700/50 transition-colors"
                >
                  <Badge category={topic.category} />
                  <span className="text-xs text-surface-500">
                    {topic.count} · {topic.pct}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </section>
  );
}
