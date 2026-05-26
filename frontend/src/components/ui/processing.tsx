"use client";

import { useState, useEffect } from "react";
import { AIProcessingPanel, useProcessingStages } from "@/components/ui/ai-processing-panel";
import { useI18n } from "@/lib/i18n";

interface ProcessingUIProps {
  onComplete?: () => void;
}

export function ProcessingUI({ onComplete }: ProcessingUIProps) {
  const { t } = useI18n();
  const stages = useProcessingStages();
  const hints = t("processing.liveHints").split("|");

  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [typedHint, setTypedHint] = useState("");

  const liveHint = hints[stage % hints.length] ?? "";

  useEffect(() => {
    if (!liveHint) return;
    setTypedHint("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTypedHint(liveHint.slice(0, i));
      if (i >= liveHint.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [liveHint, stage]);

  useEffect(() => {
    if (stage >= stages.length) {
      onComplete?.();
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setStage((s) => s + 1);
          return 0;
        }
        return prev + 1.5 + Math.random() * 2.5;
      });
    }, 180);

    return () => clearInterval(interval);
  }, [stage, stages.length, onComplete]);

  if (stage >= stages.length) return null;

  return (
    <AIProcessingPanel
      stage={stage}
      stages={stages}
      progress={progress}
      typedHint={typedHint}
      showStageList
    />
  );
}
