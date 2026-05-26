"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { buildMeetingIntelligence } from "@/lib/meeting-intelligence";
import { Meeting } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SentimentCard } from "@/components/ui/sentiment-card";
import { AINextStepsCard } from "@/components/ui/ai-next-steps-card";
import { PageSkeleton } from "@/components/ui/skeleton";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { MeetingResultCore } from "@/components/meetings/MeetingResultCore";
import { MeetingMemoryTimeline } from "@/components/meetings/MeetingMemoryTimeline";
import { ExecutiveReportCard } from "@/components/meetings/ExecutiveReportCard";
import { RelatedMeetings } from "@/components/meetings/RelatedMeetings";
import { MeetingProcessingLive } from "@/components/meetings/MeetingProcessingLive";
import { FadeInStagger, FadeInItem } from "@/components/ui/animations";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate, formatDuration } from "@/lib/utils";
import { toast } from "sonner";
import {
  Clock,
  Users,
  CheckCircle2,
  Download,
  Trash2,
  FileText,
} from "lucide-react";

export default function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadMeeting();
  }, [id]);

  const intelligence = useMemo(
    () => (meeting ? buildMeetingIntelligence(meeting) : null),
    [meeting]
  );

  const loadMeeting = async () => {
    try {
      const data = await api.getMeeting(id);
      setMeeting(data);
    } catch {
      toast.error(t("meetings.loadFailed"));
      router.push("/dashboard");
    }
    setLoading(false);
  };

  const pollMeeting = useCallback(() => api.getMeeting(id), [id]);

  const handleDelete = async () => {
    if (!confirm(t("meetings.deleteConfirm"))) return;
    await api.deleteMeeting(id);
    toast.success(t("common.success"));
    router.push("/dashboard");
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await api.downloadReport(id);
      toast.success(t("meetings.reportDownloaded"));
    } catch {
      toast.error(t("meetings.exportFailed"));
    }
    setExporting(false);
  };

  if (loading) return <PageSkeleton />;
  if (!meeting) return null;

  return (
    <FadeInStagger className="page-container max-w-4xl space-y-6">
      <FadeInItem>
        <PageHeader
          showBack
          backHref="/dashboard"
          breadcrumbs={[
            { label: t("nav.dashboard"), href: "/dashboard" },
            { label: t("meetings.title"), href: "/search" },
            { label: meeting.title || t("meetings.untitled") },
          ]}
          title={meeting.title || t("meetings.untitled")}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={handleExport} className="gap-1.5">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{t("meetings.exportPdf")}</span>
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete} className="gap-1.5">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          }
        />
        <div className="flex items-center gap-3 mt-2">
          <Badge category={meeting.category} />
          <span className="text-sm text-surface-400">{formatDate(meeting.created_at)}</span>
          <span className="text-sm text-surface-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(meeting.duration)}
          </span>
        </div>
      </FadeInItem>

      {!meeting.is_processed && (
        <FadeInItem>
          <MeetingProcessingLive
            meeting={meeting}
            poll={pollMeeting}
            onProcessed={(m) => {
              setMeeting(m);
              toast.success(t("meetings.aiReady"));
            }}
          />
        </FadeInItem>
      )}

      {meeting.is_processed && intelligence && (
        <>
          <FadeInItem>
            <MeetingResultCore intelligence={intelligence} />
          </FadeInItem>
          <FadeInItem>
            <ExecutiveReportCard
              meetingTitle={meeting.title || t("meetings.untitled")}
              intelligence={intelligence}
              onExport={handleExport}
              exporting={exporting}
            />
          </FadeInItem>
          <FadeInItem>
            <MeetingMemoryTimeline meeting={meeting} />
          </FadeInItem>
        </>
      )}

      {meeting.is_processed && (
        <FadeInStagger className="grid md:grid-cols-2 gap-6">
          {meeting.sentiment && Object.keys(meeting.sentiment).length > 0 && (
            <FadeInItem>
              <SentimentCard sentiment={meeting.sentiment} />
            </FadeInItem>
          )}
          {meeting.next_steps && meeting.next_steps.length > 0 && (
            <FadeInItem
              delay={
                meeting.sentiment && Object.keys(meeting.sentiment).length > 0 ? 0.05 : 0
              }
            >
              <AINextStepsCard nextSteps={meeting.next_steps} />
            </FadeInItem>
          )}
        </FadeInStagger>
      )}

      {meeting.speakers && meeting.speakers.length > 0 && (
        <FadeInItem>
          <Card className="card-premium">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-primary-400" />
              <h2 className="text-lg font-semibold text-white">{t("meetings.speakers")}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {meeting.speakers.map((s, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-surface-800 text-surface-300 text-sm"
                >
                  {s}
                </span>
              ))}
            </div>
          </Card>
        </FadeInItem>
      )}

      {meeting.tasks && meeting.tasks.length > 0 && (
        <FadeInItem>
          <Card className="card-premium">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-primary-400" />
              <h2 className="text-lg font-semibold text-white">
                {t("meetings.tasks")} ({meeting.tasks.length})
              </h2>
            </div>
            <div className="space-y-2">
              {meeting.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-900/50 border border-surface-800/50 hover:border-surface-700/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={task.status === "done"}
                    onChange={async () => {
                      const newStatus = task.status === "done" ? "pending" : "done";
                      await api.updateTask(task.id, newStatus);
                      toast.success(
                        newStatus === "done"
                          ? t("meetings.taskCompleted")
                          : t("meetings.taskReopened")
                      );
                      loadMeeting();
                    }}
                    className="w-4 h-4 rounded border-surface-600 bg-surface-800 accent-primary-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p
                      className={`text-sm ${
                        task.status === "done"
                          ? "line-through text-surface-500"
                          : "text-surface-200"
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.assigned_to && (
                      <p className="text-xs text-surface-500">
                        {t("meetings.assignedTo")}: {task.assigned_to}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </FadeInItem>
      )}

      {meeting.is_processed && (
        <FadeInItem>
          <RelatedMeetings meetingId={id} />
        </FadeInItem>
      )}

      <FadeInItem className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setShowTranscript(!showTranscript)}>
            {showTranscript ? t("meetings.hideTranscript") : t("meetings.showTranscript")}
          </Button>
          <Button
            variant={showChat ? "primary" : "secondary"}
            onClick={() => setShowChat(!showChat)}
          >
            {showChat ? t("meetings.hideChat") : t("meetings.aiChat")}
          </Button>
        </div>

        {showTranscript && meeting.transcript && (
          <Card className="card-premium">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-surface-400" />
              <h2 className="text-lg font-semibold text-white">{t("meetings.transcript")}</h2>
            </div>
            <div className="text-sm text-surface-300 whitespace-pre-wrap leading-relaxed font-mono bg-surface-900/50 rounded-lg p-4 border border-surface-800/50">
              {meeting.transcript}
            </div>
          </Card>
        )}

        {showChat && (
          <Card className="h-[500px] flex flex-col p-0 overflow-hidden card-premium">
            <div className="px-4 py-3 border-b border-surface-800/50">
              <h2 className="text-sm font-semibold text-white">{t("meetings.aiChatTitle")}</h2>
              <p className="text-xs text-surface-500">{t("meetings.aiChatDesc")}</p>
            </div>
            <ChatPanel meetingId={id} />
          </Card>
        )}
      </FadeInItem>
    </FadeInStagger>
  );
}
