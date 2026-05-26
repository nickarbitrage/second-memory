"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Analytics } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmartEmptyState } from "@/components/ui/smart-empty-state";
import { PageSkeleton } from "@/components/ui/skeleton";
import { FadeIn, FadeInStagger, FadeInItem } from "@/components/ui/animations";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  BarChart3,
  FileText,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";

export default function AnalyticsPage() {
  const { t, language } = useI18n();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton />;

  if (!data) return null;

  const locale = language === "ru" ? "ru-RU" : "en-US";

  if (data.total_meetings === 0) {
    return (
      <FadeIn className="max-w-5xl mx-auto space-y-8">
        <PageHeader
          title={t("analytics.title")}
          description={t("analytics.subtitle")}
          showBack
          backHref="/dashboard"
          breadcrumbs={[
            { label: t("nav.dashboard"), href: "/dashboard" },
            { label: t("analytics.title") },
          ]}
        />
        <Card className="card-premium">
          <SmartEmptyState
            icon={<BarChart3 className="w-8 h-8 text-primary-400" />}
            title={t("analytics.emptyTitle")}
            description={t("analytics.emptyDesc")}
            aiTip={t("empty.analyticsAiTip")}
            suggestions={[
              { label: t("empty.analyticsSuggestion1"), href: "/record" },
              { label: t("empty.dashboardSuggestion2"), href: "/search" },
            ]}
          />
        </Card>
      </FadeIn>
    );
  }

  return (
    <FadeInStagger className="max-w-5xl mx-auto space-y-8">
      <FadeInItem>
        <PageHeader
          title={t("analytics.title")}
          description={t("analytics.subtitle")}
          showBack
          backHref="/dashboard"
          breadcrumbs={[
            { label: t("nav.dashboard"), href: "/dashboard" },
            { label: t("analytics.title") },
          ]}
        />
      </FadeInItem>

      <FadeInStagger className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("analytics.totalMeetings"), value: data.total_meetings, icon: FileText, color: "text-primary-400 bg-primary-500/10" },
          { label: t("analytics.totalTasks"), value: data.total_tasks, icon: CheckCircle2, color: "text-accent-400 bg-accent-500/10" },
          { label: t("analytics.completedTasks"), value: data.completed_tasks, icon: TrendingUp, color: "text-green-400 bg-green-500/10" },
          { label: t("analytics.hoursRecorded"), value: `${Math.round(data.total_duration_minutes / 60)}h`, icon: Clock, color: "text-purple-400 bg-purple-500/10" },
        ].map((stat, i) => (
          <FadeInItem key={stat.label} delay={i * 0.05}>
            <Card hover className="hover:border-surface-700/50 transition-colors duration-200 card-premium">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-surface-400">{stat.label}</p>
                </div>
              </div>
            </Card>
          </FadeInItem>
        ))}
      </FadeInStagger>

      <FadeInItem className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">{t("analytics.weeklyActivity")}</h2>
          <div className="flex items-end gap-2 h-40">
            {data.weekly_activity.map((day, i) => {
              const maxCount = Math.max(...data.weekly_activity.map((d) => d.count), 1);
              const height = (day.count / maxCount) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-surface-500">{day.count}</span>
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-primary-600 to-primary-400 transition-all duration-500"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <span className="text-xs text-surface-500">
                    {new Date(day.date).toLocaleDateString(locale, { weekday: "short" })}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">{t("analytics.categories")}</h2>
          <div className="space-y-3">
            {data.category_distribution.map((cat) => {
              const total = data.category_distribution.reduce((s, c) => s + c.count, 0);
              const pct = total > 0 ? (cat.count / total) * 100 : 0;
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <Badge category={cat.category} />
                    <span className="text-sm text-surface-400">{cat.count}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </FadeInItem>

      {data.top_speakers.length > 0 && (
        <FadeInItem>
          <Card>
            <h2 className="text-lg font-semibold text-white mb-4">{t("analytics.topSpeakers")}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.top_speakers.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-900/50 border border-surface-800/50 hover:border-surface-700/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 text-sm font-bold">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-200">{s.name}</p>
                    <p className="text-xs text-surface-500">
                      {s.count} {t("analytics.meetings")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </FadeInItem>
      )}
    </FadeInStagger>
  );
}
