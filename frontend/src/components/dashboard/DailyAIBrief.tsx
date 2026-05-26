"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, AlertCircle, CheckCircle2, Lightbulb, TrendingUp, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { Analytics, MeetingListItem } from "@/types";
import { DashboardInsights } from "@/lib/dashboard-insights";

interface DailyAIBriefProps {
  analytics: Analytics;
  meetings: MeetingListItem[];
  insights: DashboardInsights;
}

export function DailyAIBrief({ analytics, meetings, insights }: DailyAIBriefProps) {
  const { t } = useI18n();

  const pendingTasks = (analytics.recent_tasks || []).filter((task) => task.status === "pending");
  const inProgressTasks = (analytics.recent_tasks || []).filter(
    (task) => task.status === "in_progress"
  );
  const urgent = [...inProgressTasks, ...pendingTasks].slice(0, 4);

  const recentMeetings = meetings.filter((m) => m.is_processed).slice(0, 2);

  const suggestion =
    insights.completionRate < 50
      ? insights.weeklyInsight
      : insights.meetingsThisWeek === 0
      ? insights.todaySummary
      : insights.weeklyInsight;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
      <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-1.5 rounded-lg bg-accent-500/15 border border-accent-500/20"
        >
          <Sparkles className="w-4 h-4 text-accent-400" />
        </motion.div>
        <h2 className="text-lg font-semibold text-white">{t("dailyBrief.title")}</h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-premium md:col-span-2 lg:col-span-2 border-accent-500/15 bg-gradient-to-br from-accent-500/8 via-transparent to-primary-500/5">
          <p className="text-xs font-medium text-accent-300 uppercase tracking-wider mb-2">
            {t("dailyBrief.recentSummary")}
          </p>
          {recentMeetings.length > 0 ? (
            <ul className="space-y-2">
              {recentMeetings.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/meetings/${m.id}`}
                    className="text-sm text-surface-300 hover:text-primary-300 line-clamp-2 transition-colors"
                  >
                    <span className="font-medium text-surface-200">{m.title || "Untitled"}</span>
                    {m.summary ? ` — ${m.summary.slice(0, 120)}…` : ""}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-surface-400">{insights.todaySummary}</p>
          )}
        </Card>

        <Card className="card-premium">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-medium text-surface-400 uppercase tracking-wider">
              {t("dailyBrief.urgentTasks")}
            </span>
          </div>
          {urgent.length > 0 ? (
            <ul className="space-y-2">
              {urgent.map((task, i) => (
                <li key={i} className="text-sm text-surface-300 truncate flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                  {task.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-surface-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent-400 shrink-0" />
              {t("dailyBrief.noUrgent")}
            </p>
          )}
        </Card>

        <Card className="card-premium">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary-400" />
              <span className="text-xs font-medium text-surface-400 uppercase tracking-wider">
                {t("dailyBrief.suggestion")}
              </span>
            </div>
            <p className="text-sm text-surface-300 leading-relaxed">{suggestion}</p>
            <div className="pt-2 border-t border-surface-800/50">
              <div className="flex items-center gap-2 text-xs text-surface-500 mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {t("dailyBrief.weeklyInsight")}
              </div>
              <p className="text-xs text-surface-400 line-clamp-3">{insights.weeklyInsight}</p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
            >
              {t("analyst.modeAnalyst")} <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>
        </Card>
      </div>
    </section>
  );
}
