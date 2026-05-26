"use client";

import { FileText, Download, CheckCircle2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { MeetingIntelligence } from "@/lib/meeting-intelligence";

interface ExecutiveReportCardProps {
  meetingTitle: string;
  intelligence: MeetingIntelligence;
  onExport: () => void;
  exporting?: boolean;
}

export function ExecutiveReportCard({
  meetingTitle,
  intelligence,
  onExport,
  exporting = false,
}: ExecutiveReportCardProps) {
  const { t } = useI18n();
  const ready =
    intelligence.decisions.length > 0 ||
    intelligence.actionItems.length > 0 ||
    Boolean(intelligence.tldr);

  return (
    <Card className="card-premium border-accent-500/15 bg-gradient-to-br from-surface-950/90 via-primary-500/5 to-accent-500/5 overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent-500/15 border border-accent-500/25">
              <FileText className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{t("report.executiveTitle")}</h2>
              <p className="text-xs text-surface-500">{t("report.executiveSubtitle")}</p>
            </div>
          </div>

          <div className="rounded-xl border border-surface-800/60 bg-[#0a0a12]/80 p-4 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-surface-500">
              {t("report.previewLabel")}
            </p>
            <p className="text-sm font-medium text-white line-clamp-1">{meetingTitle}</p>
            <p className="text-sm text-surface-400 line-clamp-3 leading-relaxed">
              {intelligence.tldr || t("report.previewFallback")}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs px-2 py-1 rounded-full bg-surface-800/80 text-surface-400">
                {intelligence.decisions.length} {t("meetingResult.decisions").toLowerCase()}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-surface-800/80 text-surface-400">
                {intelligence.actionItems.length} {t("meetingResult.actionItems").toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="sm:w-44 flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-surface-800/50 bg-surface-950/50">
          {ready ? (
            <>
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-accent-500/15 border border-accent-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-accent-400" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent-400 animate-pulse" />
              </div>
              <p className="text-xs font-medium text-accent-300 text-center">
                {t("report.exportReady")}
              </p>
            </>
          ) : (
            <>
              <Sparkles className="w-8 h-8 text-surface-600" />
              <p className="text-xs text-surface-500 text-center">{t("report.processing")}</p>
            </>
          )}
          <Button
            className="w-full gap-2"
            onClick={onExport}
            disabled={!ready || exporting}
            variant={ready ? "primary" : "secondary"}
          >
            <Download className="w-4 h-4" />
            {exporting ? t("commandPalette.exporting") : t("meetings.exportPdf")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
