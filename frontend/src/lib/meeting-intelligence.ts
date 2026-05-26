import { Meeting } from "@/types";

export interface MeetingIntelligence {
  tldr: string;
  decisions: string[];
  actionItems: string[];
  risks: string[];
  positives: string[];
  concerns: string[];
  effectivenessScore: number;
  effectivenessLabel: "excellent" | "good" | "fair" | "needs_attention";
}

const RISK_KEYWORDS = [
  "risk",
  "blocker",
  "blocked",
  "delay",
  "concern",
  "issue",
  "problem",
  "deadline",
  "urgent",
  "блокер",
  "риск",
  "проблем",
  "срок",
  "задерж",
];

const POSITIVE_KEYWORDS = [
  "aligned",
  "success",
  "great",
  "achieved",
  "progress",
  "agreed",
  "positive",
  "улучш",
  "успех",
  "соглас",
];

function toTldr(summary: string | null): string {
  if (!summary?.trim()) return "";
  const sentences = summary.match(/[^.!?]+[.!?]+/g) || [summary];
  return sentences.slice(0, 3).join(" ").trim();
}

function classifyInsights(insights: string[]) {
  const risks: string[] = [];
  const positives: string[] = [];
  const concerns: string[] = [];

  for (const line of insights) {
    const lower = line.toLowerCase();
    if (RISK_KEYWORDS.some((k) => lower.includes(k))) {
      risks.push(line);
    } else if (POSITIVE_KEYWORDS.some((k) => lower.includes(k))) {
      positives.push(line);
    } else {
      concerns.push(line);
    }
  }

  return { risks, positives, concerns };
}

export function buildMeetingIntelligence(meeting: Meeting): MeetingIntelligence {
  const sentiment = meeting.sentiment as {
    overall?: string;
    confidence?: number;
    collaboration?: number;
  };

  const tasks = meeting.tasks || [];
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const taskRatio = tasks.length > 0 ? doneCount / tasks.length : 0.5;

  const confidence = sentiment?.confidence ?? 70;
  const collaboration = sentiment?.collaboration ?? 70;
  const sentimentBoost =
    sentiment?.overall === "positive" ? 12 : sentiment?.overall === "negative" ? -12 : 0;

  const effectivenessScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(confidence * 0.35 + collaboration * 0.35 + taskRatio * 30 + sentimentBoost)
    )
  );

  let effectivenessLabel: MeetingIntelligence["effectivenessLabel"] = "fair";
  if (effectivenessScore >= 85) effectivenessLabel = "excellent";
  else if (effectivenessScore >= 70) effectivenessLabel = "good";
  else if (effectivenessScore < 55) effectivenessLabel = "needs_attention";

  const actionFromTasks = tasks.map((t) =>
    t.assigned_to ? `${t.title} → ${t.assigned_to}` : t.title
  );
  const actionItems = [
    ...(meeting.action_items || []),
    ...actionFromTasks.filter((t) => !(meeting.action_items || []).includes(t)),
  ];

  const { risks, positives, concerns } = classifyInsights(meeting.insights || []);

  return {
    tldr: toTldr(meeting.summary) || meeting.summary || "",
    decisions: meeting.key_decisions || [],
    actionItems,
    risks: risks.length > 0 ? risks : concerns.slice(0, 2),
    positives,
    concerns: concerns.filter((c) => !risks.includes(c)),
    effectivenessScore,
    effectivenessLabel,
  };
}
