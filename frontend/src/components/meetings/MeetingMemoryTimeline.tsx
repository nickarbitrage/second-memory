"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Lightbulb,
  ListTodo,
  GitBranch,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { Meeting } from "@/types";
import { buildMeetingIntelligence } from "@/lib/meeting-intelligence";

interface MeetingMemoryTimelineProps {
  meeting: Meeting;
}

type TimelineKind = "decision" | "insight" | "task" | "topic";

interface TimelineEvent {
  id: string;
  kind: TimelineKind;
  title: string;
  body?: string;
  meta?: string;
}

function buildTimelineEvents(meeting: Meeting): TimelineEvent[] {
  const intel = buildMeetingIntelligence(meeting);
  const events: TimelineEvent[] = [];

  meeting.key_decisions?.forEach((d, i) => {
    events.push({ id: `d-${i}`, kind: "decision", title: d });
  });

  intel.positives.slice(0, 2).forEach((p, i) => {
    events.push({ id: `p-${i}`, kind: "insight", title: p, meta: "positive" });
  });

  intel.concerns.slice(0, 2).forEach((c, i) => {
    events.push({ id: `c-${i}`, kind: "insight", title: c, meta: "watch" });
  });

  intel.risks.slice(0, 2).forEach((r, i) => {
    events.push({ id: `r-${i}`, kind: "topic", title: r });
  });

  const actions = intel.actionItems.slice(0, 4);
  actions.forEach((a, i) => {
    events.push({ id: `a-${i}`, kind: "task", title: a });
  });

  meeting.tasks?.slice(0, 3).forEach((t, i) => {
    if (!actions.includes(t.title)) {
      events.push({
        id: `t-${i}`,
        kind: "task",
        title: t.title,
        body: t.assigned_to ? `→ ${t.assigned_to}` : undefined,
      });
    }
  });

  return events.slice(0, 12);
}

const kindStyles: Record<TimelineKind, { dot: string; icon: typeof CheckCircle2 }> = {
  decision: { dot: "bg-accent-400 shadow-accent-400/40", icon: CheckCircle2 },
  insight: { dot: "bg-yellow-400 shadow-yellow-400/40", icon: Lightbulb },
  task: { dot: "bg-primary-400 shadow-primary-400/40", icon: ListTodo },
  topic: { dot: "bg-purple-400 shadow-purple-400/40", icon: GitBranch },
};

export function MeetingMemoryTimeline({ meeting }: MeetingMemoryTimelineProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(true);
  const events = buildTimelineEvents(meeting);

  if (events.length === 0) return null;

  return (
    <Card className="card-premium overflow-hidden border-primary-500/10">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-400" />
          <div>
            <h2 className="text-lg font-semibold text-white">{t("timeline.title")}</h2>
            <p className="text-xs text-surface-500">{t("timeline.subtitle")}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-surface-500 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-6 relative pl-2">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-primary-500/50 via-surface-700/80 to-transparent" />

              <ul className="space-y-5">
                {events.map((event, index) => {
                  const style = kindStyles[event.kind];
                  const Icon = style.icon;
                      const labelKey = `timeline.kind.${event.kind}`;
                      return (
                    <motion.li
                      key={event.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.35 }}
                      className="relative flex gap-4 pl-6"
                    >
                      <div
                        className={`absolute left-0 top-1.5 w-[22px] h-[22px] rounded-full border-2 border-[#08080d] ${style.dot} shadow-lg flex items-center justify-center`}
                      >
                        <Icon className="w-3 h-3 text-[#08080d]" />
                      </div>
                      <div className="flex-1 min-w-0 rounded-xl border border-surface-800/50 bg-surface-950/40 px-4 py-3 hover:border-surface-700/60 transition-colors">
                        <p className="text-[10px] uppercase tracking-wider text-surface-500 mb-1">
                          {t(labelKey)}
                        </p>
                        <p className="text-sm text-surface-200 leading-relaxed">{event.title}</p>
                        {event.body && (
                          <p className="text-xs text-surface-500 mt-1">{event.body}</p>
                        )}
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
