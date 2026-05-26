"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { MeetingListItem } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import { Link2, ArrowRight } from "lucide-react";

interface RelatedMeetingsProps {
  meetingId: string;
}

export function RelatedMeetings({ meetingId }: RelatedMeetingsProps) {
  const { t } = useI18n();
  const [related, setRelated] = useState<MeetingListItem[]>([]);

  useEffect(() => {
    api.getRelatedMeetings(meetingId).then(setRelated).catch(() => setRelated([]));
  }, [meetingId]);

  if (related.length === 0) return null;

  return (
    <Card className="card-premium">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-accent-400" />
          <div>
            <h2 className="text-lg font-semibold text-white">{t("related.title")}</h2>
            <p className="text-xs text-surface-500">{t("related.subtitle")}</p>
          </div>
        </div>
        <div className="space-y-2">
          {related.map((m) => (
            <Link
              key={m.id}
              href={`/meetings/${m.id}`}
              className="flex items-center justify-between p-3 rounded-lg bg-surface-900/40 border border-surface-800/50 hover:border-primary-500/25 hover:bg-surface-900/60 transition-all group"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-surface-200 truncate group-hover:text-primary-300">
                  {m.title || t("meetings.untitled")}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge category={m.category} />
                  <span className="text-xs text-surface-500">{formatDate(m.created_at)}</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-surface-600 group-hover:text-primary-400 shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
}
