"use client";

import { useEffect, useState, useMemo } from "react";
import {
  AIProcessingPanel,
  useProcessingStages,
} from "@/components/ui/ai-processing-panel";
import { useI18n } from "@/lib/i18n";
import { Meeting } from "@/types";

interface MeetingProcessingLiveProps {
  meeting: Meeting;
  onProcessed: (meeting: Meeting) => void;
  poll: () => Promise<Meeting>;
}

const NOVA_PLACEHOLDER_LINES = [
  "Alex Chen: We're aligning on the API v2 surface before engineering splits…",
  "Sarah Kim: Auth middleware needs to land before launch — same concern as planning.",
  "Mia Patel: Architecture review deferred sharding until we see beta QPS…",
  "Daniel Ross: Connection pool risk at 3x traffic — flagging launch readiness.",
  "Emma Carter: Cache layer cut p95 latency by 22% in staging.",
];

export function MeetingProcessingLive({ meeting, onProcessed, poll }: MeetingProcessingLiveProps) {
  const { t } = useI18n();
  const stages = useProcessingStages();
  const hints = useMemo(() => t("processing.liveHints").split("|"), [t]);

  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(12);
  const [hintIndex, setHintIndex] = useState(0);
  const [typedHint, setTypedHint] = useState("");
  const [transcriptLines, setTranscriptLines] = useState<string[]>([]);

  useEffect(() => {
    const id = setInterval(() => {
      void poll().then((m) => {
        if (m.is_processed) onProcessed(m);
      });
    }, 3500);
    return () => clearInterval(id);
  }, [poll, onProcessed]);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setStage((s) => (s + 1) % stages.length);
          return 8;
        }
        return p + 2 + Math.random() * 3;
      });
    }, 200);
    return () => clearInterval(id);
  }, [stages.length]);

  useEffect(() => {
    const id = setInterval(() => setHintIndex((i) => (i + 1) % hints.length), 5000);
    return () => clearInterval(id);
  }, [hints.length]);

  useEffect(() => {
    const hint = hints[hintIndex] ?? "";
    setTypedHint("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTypedHint(hint.slice(0, i));
      if (i >= hint.length) clearInterval(id);
    }, 24);
    return () => clearInterval(id);
  }, [hintIndex, hints]);

  useEffect(() => {
    const seed =
      meeting.transcript?.split("\n").filter((l) => l.trim().length > 0).slice(0, 8) ??
      [];
    const source = seed.length > 0 ? seed : NOVA_PLACEHOLDER_LINES;
    let line = 0;
    const id = setInterval(() => {
      setTranscriptLines((prev) => {
        if (line >= source.length) return prev;
        const next = [...prev, source[line]];
        line += 1;
        return next;
      });
    }, 2000);
    return () => clearInterval(id);
  }, [meeting.transcript]);

  return (
    <AIProcessingPanel
      stage={stage}
      stages={stages}
      progress={progress}
      typedHint={typedHint}
      showStageList
      transcriptLines={transcriptLines}
    />
  );
}
