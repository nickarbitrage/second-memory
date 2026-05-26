"use client";

import Link from "next/link";
import { MeetingListItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { formatDate, formatDuration, truncate } from "@/lib/utils";
import { Clock, Users, Sparkles, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

const sentimentConfig = {
  positive: { color: "bg-emerald-500", icon: ThumbsUp },
  neutral: { color: "bg-amber-500", icon: Minus },
  negative: { color: "bg-red-500", icon: ThumbsDown },
} as const;

interface MeetingCardProps {
  meeting: MeetingListItem;
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  const { t } = useI18n();
  const sentimentOverall = meeting.sentiment?.overall as string | undefined;
  const sentimentStyle = sentimentConfig[sentimentOverall as keyof typeof sentimentConfig];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/meetings/${meeting.id}`}>
        <div className="group relative rounded-xl border border-surface-800/50 bg-[#0c0c14]/80 backdrop-blur-xl p-5 hover:bg-surface-900/80 hover:border-surface-700/50 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-200 cursor-pointer card-premium">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge category={meeting.category} />
                {meeting.is_processed && sentimentStyle && (
                  <span className={`flex items-center gap-1 text-xs ${sentimentStyle.color}/20 ${sentimentStyle.color} px-1.5 py-0.5 rounded-full`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sentimentStyle.color}`} />
                    {t(`meetings.${sentimentOverall}`)}
                  </span>
                )}
                {meeting.is_processed ? (
                  <span className="flex items-center gap-1 text-xs text-accent-400">
                    <Sparkles className="w-3 h-3" />
                    {t("meetings.aiReady")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-yellow-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                    {t("meetings.processingShort")}
                  </span>
                )}
              </div>
              <h3 className="text-base font-semibold text-white group-hover:text-primary-400 transition-colors truncate">
                {meeting.title || t("meetings.untitled")}
              </h3>
              {meeting.summary && (
                <p className="text-sm text-surface-400 mt-1 line-clamp-2">
                  {truncate(meeting.summary, 120)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-surface-500 mt-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(meeting.duration)}
            </span>
            {meeting.speakers && meeting.speakers.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {meeting.speakers.length}
              </span>
            )}
            <span className="ml-auto">{formatDate(meeting.created_at)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
