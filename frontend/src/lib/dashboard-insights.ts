import { Analytics, MeetingListItem } from "@/types";
import { getCategoryLabel } from "@/lib/utils";

export interface DashboardInsights {
  todaySummary: string;
  weeklyInsight: string;
  meetingsThisWeek: number;
  completionRate: number;
  productivityScore: number;
  topTopics: { category: string; label: string; count: number; pct: number }[];
  peakDayLabel: string;
  peakDayCount: number;
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function buildDashboardInsights(
  analytics: Analytics,
  meetings: MeetingListItem[],
  locale: "en" | "ru"
): DashboardInsights {
  const meetingsThisWeek = analytics.weekly_activity.reduce((s, d) => s + d.count, 0);
  const completionRate =
    analytics.total_tasks > 0
      ? Math.round((analytics.completed_tasks / analytics.total_tasks) * 100)
      : 0;

  const todayMeetings = meetings.filter((m) => isToday(m.created_at));
  const source = todayMeetings[0] ?? meetings[0];
  const todaySummary =
    source?.summary?.trim() ||
    (locale === "ru"
      ? "Запишите встречу сегодня — AI создаст резюме автоматически."
      : "Record a meeting today — AI will generate a summary automatically.");

  const peak = [...analytics.weekly_activity].sort((a, b) => b.count - a.count)[0];
  const peakDate = peak ? new Date(peak.date) : new Date();
  const peakDayLabel = peakDate.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
    weekday: "long",
  });
  const peakDayCount = peak?.count ?? 0;

  const totalCats = analytics.category_distribution.reduce((s, c) => s + c.count, 0);
  const topTopics = analytics.category_distribution.slice(0, 4).map((c) => ({
    category: c.category,
    label: getCategoryLabel(c.category),
    count: c.count,
    pct: totalCats > 0 ? Math.round((c.count / totalCats) * 100) : 0,
  }));

  const hoursScore = Math.min(Math.round(analytics.total_duration_minutes / 60) * 8, 40);
  const meetingScore = Math.min(analytics.total_meetings * 4, 30);
  const taskScore = Math.min(Math.round(completionRate * 0.3), 30);
  const productivityScore = Math.min(hoursScore + meetingScore + taskScore, 100);

  let weeklyInsight: string;
  if (meetingsThisWeek === 0) {
    weeklyInsight =
      locale === "ru"
        ? "На этой неделе встреч пока нет. Начните с записи или загрузки аудио."
        : "No meetings this week yet. Start by recording or uploading audio.";
  } else if (completionRate >= 70) {
    weeklyInsight =
      locale === "ru"
        ? `Отличная неделя: ${meetingsThisWeek} встреч, ${completionRate}% задач выполнено. Команда держит темп.`
        : `Strong week: ${meetingsThisWeek} meetings, ${completionRate}% tasks done. Team momentum is high.`;
  } else if (peakDayCount >= 2) {
    weeklyInsight =
      locale === "ru"
        ? `Пик активности — ${peakDayLabel} (${peakDayCount} встреч). ${meetingsThisWeek} встреч за неделю.`
        : `Peak activity on ${peakDayLabel} (${peakDayCount} meetings). ${meetingsThisWeek} meetings this week.`;
  } else {
    weeklyInsight =
      locale === "ru"
        ? `${meetingsThisWeek} встреч за неделю. ${analytics.completed_tasks} из ${analytics.total_tasks} задач закрыто.`
        : `${meetingsThisWeek} meetings this week. ${analytics.completed_tasks} of ${analytics.total_tasks} tasks completed.`;
  }

  return {
    todaySummary,
    weeklyInsight,
    meetingsThisWeek,
    completionRate,
    productivityScore,
    topTopics,
    peakDayLabel,
    peakDayCount,
  };
}
