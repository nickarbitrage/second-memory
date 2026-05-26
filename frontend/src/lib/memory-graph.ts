import { MeetingListItem } from "@/types";

export interface MemoryGraphNode {
  id: string;
  label: string;
  category: string;
  x: number;
  y: number;
  size: number;
  daysAgo: number;
}

export interface MemoryGraphEdge {
  id: string;
  from: string;
  to: string;
  strength: number;
  label?: string;
}

export interface MemoryGraphInsight {
  text: string;
  type: "evolution" | "recurrence" | "link";
}

const TOPIC_TERMS = [
  "api",
  "architecture",
  "onboarding",
  "launch",
  "scaling",
  "roadmap",
  "q1",
  "q2",
  "auth",
  "product",
  "design",
  "sprint",
];

function daysAgo(dateStr: string): number {
  const d = new Date(dateStr).getTime();
  return Math.floor((Date.now() - d) / (1000 * 60 * 60 * 24));
}

function extractTopics(meeting: MeetingListItem): string[] {
  const blob = `${meeting.title || ""} ${meeting.summary || ""}`.toLowerCase();
  return TOPIC_TERMS.filter((t) => blob.includes(t));
}

function sharedTopics(a: MeetingListItem, b: MeetingListItem): string[] {
  const ta = new Set(extractTopics(a));
  return extractTopics(b).filter((t) => ta.has(t));
}

export function buildMemoryGraph(meetings: MeetingListItem[], locale: "en" | "ru") {
  const processed = meetings.filter((m) => m.is_processed).slice(0, 12);
  if (processed.length === 0) {
    return { nodes: [] as MemoryGraphNode[], edges: [] as MemoryGraphEdge[], insights: [] as MemoryGraphInsight[] };
  }

  const sorted = [...processed].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const cx = 50;
  const cy = 50;
  const radius = 38;

  const nodes: MemoryGraphNode[] = sorted.map((m, i) => {
    const angle = (i / sorted.length) * Math.PI * 2 - Math.PI / 2;
    return {
      id: m.id,
      label: (m.title || "Untitled").slice(0, 28),
      category: m.category,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      size: 6 + Math.min(4, (m.summary?.length || 0) / 120),
      daysAgo: daysAgo(m.created_at),
    };
  });

  const edges: MemoryGraphEdge[] = [];
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const shared = sharedTopics(sorted[i], sorted[j]);
      const catMatch = sorted[i].category === sorted[j].category;
      let strength = shared.length * 0.25 + (catMatch ? 0.2 : 0);
      if (sorted[i].speakers?.length && sorted[j].speakers?.length) {
        const sa = new Set(sorted[i].speakers);
        if (sorted[j].speakers.some((s) => sa.has(s))) strength += 0.15;
      }
      if (strength >= 0.35) {
        edges.push({
          id: `${sorted[i].id}-${sorted[j].id}`,
          from: sorted[i].id,
          to: sorted[j].id,
          strength: Math.min(1, strength),
          label: shared[0],
        });
      }
    }
  }

  const insights: MemoryGraphInsight[] = [];
  const apiMeetings = sorted.filter((m) => extractTopics(m).includes("api"));
  if (apiMeetings.length >= 2) {
    const span = daysAgo(apiMeetings[0].created_at) - daysAgo(apiMeetings[apiMeetings.length - 1].created_at);
    insights.push({
      type: "evolution",
      text:
        locale === "ru"
          ? `Тема API развивалась в ${apiMeetings.length} встречах за ${Math.abs(span) || 1} дн.`
          : `API discussions evolved across ${apiMeetings.length} meetings over ${Math.abs(span) || 1} days.`,
    });
  }

  if (edges.length >= 2) {
    insights.push({
      type: "link",
      text:
        locale === "ru"
          ? `${edges.length} связей между разговорами в памяти workspace.`
          : `${edges.length} memory connections link conversations in your workspace.`,
    });
  }

  const topicCounts: Record<string, number> = {};
  sorted.forEach((m) => {
    extractTopics(m).forEach((t) => {
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    });
  });
  const topTopic = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0];
  if (topTopic && topTopic[1] >= 2) {
    insights.push({
      type: "recurrence",
      text:
        locale === "ru"
          ? `«${topTopic[0].toUpperCase()}» повторяется в ${topTopic[1]} встречах.`
          : `"${topTopic[0]}" recurred across ${topTopic[1]} meetings.`,
    });
  }

  return { nodes, edges, insights };
}
