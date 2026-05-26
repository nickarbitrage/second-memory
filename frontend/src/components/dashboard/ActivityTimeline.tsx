"use client";

import Link from "next/link";
import { MeetingListItem } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import { Clock } from "lucide-react";

interface ActivityTimelineProps {
  meetings: MeetingListItem[];
}

export function ActivityTimeline({ meetings }: ActivityTimelineProps) {
  const { t } = useI18n();

  if (meetings.length === 0) return null;

  return (
    <Card className="card-premium">
      <h2 className="text-lg font-semibold text-white mb-4">{t("activity.title")}</h2>
      <div className="relative space-y-0">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-surface-800" />
        {meetings.slice(0, 5).map((m) => (
          <Link
            key={m.id}
            href={`/meetings/${m.id}`}
            className="relative flex gap-4 pl-6 py-3 group rounded-lg hover:bg-surface-900/40 transition-colors -mx-2 px-2"
          >
            <div className="absolute left-0 top-4 w-[15px] h-[15px] rounded-full border-2 border-primary-500/50 bg-[#0c0c14] group-hover:border-primary-400 group-hover:shadow-[0_0_8px_rgba(99,102,241,0.4)] transition-all" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-200 truncate group-hover:text-primary-300 transition-colors">
                {m.title || t("meetings.untitled")}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge category={m.category} />
                <span className="text-xs text-surface-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(m.created_at)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
