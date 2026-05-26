"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { MeetingListItem, Analytics } from "@/types";
import { MeetingCard } from "@/components/meetings/MeetingCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SmartEmptyState } from "@/components/ui/smart-empty-state";
import { PageSkeleton } from "@/components/ui/skeleton";
import { FadeInStagger, FadeInItem } from "@/components/ui/animations";
import { PageHeader } from "@/components/layout/PageHeader";
import { DailyAIBrief } from "@/components/dashboard/DailyAIBrief";
import { AIOverview } from "@/components/dashboard/AIOverview";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { AICockpit } from "@/components/dashboard/AICockpit";
import { openCommandPalette } from "@/components/search/CommandPalette";
import { buildDashboardInsights } from "@/lib/dashboard-insights";
import { toast } from "sonner";
import {
  Plus,
  Mic,
  FileText,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, setAuth } = useAuthStore();
  const { t, language } = useI18n();
  const [recentMeetings, setRecentMeetings] = useState<MeetingListItem[]>([]);
  const [allMeetings, setAllMeetings] = useState<MeetingListItem[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem("token")!;
      const [recentData, allData, analyticsData, userData] = await Promise.all([
        api.getMeetings(5),
        api.getMeetings(20),
        api.getAnalytics(),
        api.getMe(),
      ]);
      setRecentMeetings(recentData);
      setAllMeetings(allData);
      setAnalytics(analyticsData);
      setAuth(userData, token);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("common.error"));
    }
    setLoading(false);
  };

  const insights = useMemo(() => {
    if (!analytics) return null;
    return buildDashboardInsights(analytics, allMeetings, language);
  }, [analytics, allMeetings, language]);

  if (loading) return <PageSkeleton />;

  const statCards = [
    {
      label: t("dashboard.totalMeetings"),
      value: analytics?.total_meetings || 0,
      icon: FileText,
      color: "text-primary-400 bg-primary-500/10",
    },
    {
      label: t("dashboard.totalTasks"),
      value: analytics?.total_tasks || 0,
      icon: CheckCircle2,
      color: "text-accent-400 bg-accent-500/10",
    },
    {
      label: t("dashboard.completed"),
      value: analytics?.completed_tasks || 0,
      icon: TrendingUp,
      color: "text-green-400 bg-green-500/10",
    },
    {
      label: t("dashboard.hoursRecorded"),
      value: `${Math.round((analytics?.total_duration_minutes || 0) / 60)}h`,
      icon: Clock,
      color: "text-purple-400 bg-purple-500/10",
    },
  ];

  const hasData = (analytics?.total_meetings ?? 0) > 0;
  const isNovaDemo = user?.email === "demo@meetmind.ai";

  return (
    <FadeInStagger className="page-container space-y-8">
      <FadeInItem>
        <PageHeader
          title={`${t("dashboard.welcome")}${user ? `, ${user.name.split(" ")[0]}` : ""}`}
          description={
            isNovaDemo
              ? `${t("cockpit.workspace")} · ${analytics?.total_meetings ?? 0} ${t("cockpit.conversationsInMemory")}`
              : t("dashboard.subtitle")
          }
          actions={
            <Link href="/record">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                {t("dashboard.newMeeting")}
              </Button>
            </Link>
          }
        />
      </FadeInItem>

      {hasData && insights && (
        <>
          <FadeInItem>
            <DailyAIBrief analytics={analytics!} meetings={allMeetings} insights={insights} />
          </FadeInItem>
          <FadeInItem>
            <AIOverview insights={insights} />
          </FadeInItem>
          <FadeInItem>
            <AICockpit analytics={analytics!} meetings={allMeetings} />
          </FadeInItem>
        </>
      )}

      <FadeInStagger className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <FadeInItem key={stat.label} delay={i * 0.05}>
            <Card hover className="card-premium">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-surface-400">{stat.label}</p>
                </div>
              </div>
            </Card>
          </FadeInItem>
        ))}
      </FadeInStagger>

      {!hasData && (
        <FadeInItem>
          <Card className="card-premium">
            <SmartEmptyState
              icon={<Mic className="w-8 h-8 text-primary-400" />}
              title={t("dashboard.noMeetings")}
              description={t("dashboard.recordYourFirst")}
              aiTip={t("empty.dashboardAiTip")}
              suggestions={[
                { label: t("empty.dashboardSuggestion1"), href: "/record" },
                { label: t("empty.dashboardSuggestion2"), onClick: () => openCommandPalette() },
                { label: t("empty.dashboardSuggestion3"), href: "/analytics" },
              ]}
              action={
                <Link href="/record">
                  <Button className="gap-2">
                    <Mic className="w-4 h-4" />
                    {t("dashboard.recordMeeting")}
                  </Button>
                </Link>
              }
            />
          </Card>
        </FadeInItem>
      )}

      {hasData && (
        <FadeInItem>
          <ActivityTimeline meetings={allMeetings} />
        </FadeInItem>
      )}

      <FadeInItem className="grid lg:grid-cols-2 gap-6">
        <Card className="card-premium">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">{t("dashboard.recentMeetings")}</h2>
            <Link
              href="/search"
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
            >
              {t("dashboard.viewAll")} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentMeetings.length === 0 ? (
              <SmartEmptyState
                compact
                icon={<Mic className="w-8 h-8 text-primary-400" />}
                title={t("dashboard.noMeetings")}
                description={t("dashboard.recordYourFirst")}
                aiTip={t("empty.dashboardAiTip")}
                suggestions={[
                  { label: t("empty.dashboardSuggestion1"), href: "/record" },
                ]}
              />
            ) : (
              recentMeetings.map((m) => <MeetingCard key={m.id} meeting={m} />)
            )}
          </div>
        </Card>

        <Card className="card-premium">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">{t("dashboard.recentTasks")}</h2>
          </div>
          <div className="space-y-2">
            {analytics?.recent_tasks && analytics.recent_tasks.length > 0 ? (
              analytics.recent_tasks.map((task, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-900/50 border border-surface-800/50 hover:border-surface-700/50 hover:bg-surface-900/70 transition-all duration-200"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      task.status === "done"
                        ? "bg-accent-500"
                        : task.status === "in_progress"
                        ? "bg-yellow-500"
                        : "bg-surface-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-300 truncate">{task.title}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      task.status === "done"
                        ? "bg-accent-500/10 text-accent-400"
                        : task.status === "in_progress"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-surface-700 text-surface-400"
                    }`}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              ))
            ) : (
              <SmartEmptyState
                compact
                icon={<CheckCircle2 className="w-8 h-8 text-surface-600" />}
                title={t("dashboard.noTasks")}
                description={t("dashboard.tasksAppear")}
                aiTip={t("empty.meetingAiTip")}
              />
            )}
          </div>
        </Card>
      </FadeInItem>
    </FadeInStagger>
  );
}
