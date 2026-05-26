import { Analytics, MeetingListItem } from "@/types";

export interface CockpitInsight {
  id: string;
  label: string;
  value: string;
  quote?: string;
  quoteSource?: string;
  tone: "neutral" | "urgent" | "positive" | "info";
}

const RISK_WORDS = ["deadline", "blocker", "concern", "risk", "delay", "uncertain", "uncertainty"];

function truncate(text: string, max = 128): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function extractQuote(meeting: MeetingListItem): string | null {
  const summary = meeting.summary?.trim();
  if (!summary) return null;

  const riskSentence = summary.match(/[^.!?]*(?:concern|risk|uncertain|deadline|blocker)[^.!?]*[.!?]/i);
  if (riskSentence) return truncate(riskSentence[0]);

  const authSentence = summary.match(/[^.!?]*(?:auth|oauth|middleware)[^.!?]*[.!?]/i);
  if (authSentence) return truncate(authSentence[0]);

  const parts = summary.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (parts.length > 0) return truncate(parts[0]);

  return truncate(summary);
}

function pickMeeting(
  meetings: MeetingListItem[],
  predicate: (m: MeetingListItem) => boolean
): MeetingListItem | undefined {
  return [...meetings]
    .filter((m) => m.is_processed && predicate(m))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
}

function withQuote(
  insight: Omit<CockpitInsight, "quote" | "quoteSource">,
  meeting?: MeetingListItem
): CockpitInsight {
  if (!meeting) return insight;
  const quote = extractQuote(meeting);
  if (!quote) return insight;
  return {
    ...insight,
    quote,
    quoteSource: meeting.title || undefined,
  };
}

export function buildCockpitInsights(
  analytics: Analytics,
  meetings: MeetingListItem[],
  locale: "en" | "ru"
): CockpitInsight[] {
  const insights: CockpitInsight[] = [];
  const processed = meetings
    .filter((m) => m.is_processed)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const pending = analytics.recent_tasks?.filter((t) => t.status === "pending") ?? [];
  const inProgress = analytics.recent_tasks?.filter((t) => t.status === "in_progress") ?? [];

  const weekCount = analytics.weekly_activity.reduce((s, d) => s + d.count, 0);
  const prevWeek = analytics.weekly_activity.slice(0, 3).reduce((s, d) => s + d.count, 0);
  const momentum = weekCount - prevWeek;
  const latest = processed[0];

  insights.push(
    withQuote(
      {
        id: "week",
        label: locale === "ru" ? "Изменения за неделю" : "What changed this week",
        value:
          momentum > 0
            ? locale === "ru"
              ? `+${momentum} встреч vs начало недели — Nova Labs набирает темп`
              : `+${momentum} meetings vs early week — Nova Labs momentum building`
            : locale === "ru"
            ? `${weekCount} встреч в памяти — стабильный ритм команды`
            : `${weekCount} meetings in memory — steady team rhythm`,
        tone: momentum > 0 ? "positive" : "neutral",
      },
      latest
    )
  );

  const topCat = analytics.category_distribution[0];
  const topicMeeting = topCat
    ? pickMeeting(processed, (m) => m.category === topCat.category)
  : undefined;
  if (topCat) {
    insights.push(
      withQuote(
        {
          id: "topic",
          label: locale === "ru" ? "Тема на подъёме" : "Topic gaining momentum",
          value:
            locale === "ru"
              ? `«${topCat.category}» — ${topCat.count} встреч в Nova Labs workspace`
              : `"${topCat.category}" — ${topCat.count} meetings across Nova Labs`,
          tone: "info",
        },
        topicMeeting
      )
    );
  }

  if (pending.length + inProgress.length > 0) {
    const followMeeting = pickMeeting(processed, (m) =>
      (m.summary || "").toLowerCase().includes("launch")
    );
    insights.push(
      withQuote(
        {
          id: "followup",
          label: locale === "ru" ? "Нужен follow-up" : "Follow-up required",
          value:
            locale === "ru"
              ? `${pending.length + inProgress.length} открытых задач — launch и auth в фокусе`
              : `${pending.length + inProgress.length} open items — launch & auth still active`,
          tone: "urgent",
        },
        followMeeting
      )
    );
  }

  const riskMeeting = pickMeeting(processed, (m) =>
    RISK_WORDS.some((w) => (m.summary || "").toLowerCase().includes(w))
  );
  if (riskMeeting) {
    insights.push(
      withQuote(
        {
          id: "uncertainty",
          label: locale === "ru" ? "Сигнал неопределённости" : "Team uncertainty signal",
          value:
            locale === "ru"
              ? `Команда обсуждала риски сроков и инфраструктуры на launch readiness`
              : `Team discussed deadline and infra risk in launch readiness`,
          tone: "urgent",
        },
        riskMeeting
      )
    );
  }

  const authMeeting = pickMeeting(processed, (m) =>
    /auth|oauth|middleware/i.test(m.summary || m.title || "")
  );
  if (authMeeting) {
    insights.push(
      withQuote(
        {
          id: "auth",
          label: locale === "ru" ? "Память о решении" : "Memory across conversations",
          value:
            locale === "ru"
              ? `Тема аутентификации тянется от API planning до post-launch`
              : `Authentication thread runs from API planning through post-launch`,
          tone: "positive",
        },
        authMeeting
      )
    );
  }

  insights.push(
    withQuote(
      {
        id: "memory",
        label: locale === "ru" ? "Связи памяти" : "Memory connections",
        value:
          locale === "ru"
            ? `${processed.length} узлов — API → architecture → scaling → launch`
            : `${processed.length} nodes — API → architecture → scaling → launch arc`,
        tone: "info",
      },
      pickMeeting(processed, (m) => (m.title || "").includes("Architecture"))
    )
  );

  return insights.slice(0, 6);
}
