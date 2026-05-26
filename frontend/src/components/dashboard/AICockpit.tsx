"use client";

import { motion } from "framer-motion";
import { Gauge, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { Analytics, MeetingListItem } from "@/types";
import { buildCockpitInsights } from "@/lib/cockpit-insights";
import { MemoryGraph } from "@/components/memory/MemoryGraph";

interface AICockpitProps {
  analytics: Analytics;
  meetings: MeetingListItem[];
}

const toneStyles = {
  neutral: "border-surface-800/60 bg-surface-950/40",
  urgent: "border-yellow-500/25 bg-yellow-500/5",
  positive: "border-accent-500/25 bg-accent-500/5",
  info: "border-primary-500/25 bg-primary-500/5",
};

export function AICockpit({ analytics, meetings }: AICockpitProps) {
  const { t, language } = useI18n();
  const items = buildCockpitInsights(analytics, meetings, language);

  return (
    <section className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <Gauge className="w-5 h-5 text-accent-400" />
        <div>
          <h2 className="text-lg font-semibold text-white">{t("cockpit.title")}</h2>
          <p className="text-xs text-surface-500">{t("cockpit.subtitle")}</p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <Card className={`card-premium h-full ${toneStyles[item.tone]}`}>
                <p className="text-[10px] uppercase tracking-wider text-surface-500 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary-400" />
                  {item.label}
                </p>
                <p className="text-sm text-surface-300 leading-relaxed">{item.value}</p>
                {item.quote && (
                  <blockquote className="mt-3 pt-3 border-t border-surface-800/60">
                    <p className="text-xs text-surface-400 italic leading-relaxed">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                    {item.quoteSource && (
                      <p className="text-[10px] text-surface-600 mt-1.5 truncate">
                        {item.quoteSource}
                      </p>
                    )}
                  </blockquote>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
        <MemoryGraph meetings={meetings} compact />
      </div>
    </section>
  );
}
