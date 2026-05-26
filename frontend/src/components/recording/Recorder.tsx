"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { Mic, Square, Loader2, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { WaveformVisualizer } from "@/components/recording/WaveformVisualizer";

interface RecorderProps {
  onUploadStart?: () => void;
  onUploadComplete: () => void;
}

export function Recorder({ onUploadStart, onUploadComplete }: RecorderProps) {
  const { t } = useI18n();
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const uploadRecording = useCallback(
    async (blob: Blob) => {
      onUploadStart?.();
      try {
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        await api.uploadMeeting(file);
        setStatus("success");
        setUploading(false);
        setDuration(0);
        toast.success(t("record.uploadSuccessShort"));
        setTimeout(() => {
          setStatus("idle");
          onUploadComplete();
        }, 2000);
      } catch {
        setStatus("error");
        setUploading(false);
        toast.error(t("record.uploadFailed"));
      }
    },
    [onUploadStart, onUploadComplete, t]
  );

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorder.current = recorder;
      chunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        await uploadRecording(blob);
      };

      recorder.start(100);
      setRecording(true);
      setStatus("idle");
      toast.info(t("record.recordingStarted"));

      let secs = 0;
      timerRef.current = setInterval(() => {
        secs++;
        setDuration(secs);
      }, 1000);
    } catch {
      setStatus("error");
      toast.error(t("record.micError"));
    }
  }, [t, uploadRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
    setUploading(true);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30 mb-4">
          <Mic className="w-8 h-8 text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {recording ? t("record.recording") : t("record.recordMeeting")}
        </h2>
        <p className="text-surface-400">
          {recording ? `${t("record.recording")} · ${formatTime(duration)}` : t("record.recordHint")}
        </p>
      </div>

            {recording && (
        <div className="space-y-4">
          <WaveformVisualizer active intensity={0.45 + Math.min(duration / 120, 0.45)} />
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 text-sm font-medium">{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 flex-wrap">
        {!recording && !uploading && status === "idle" && (
          <>
            <Button onClick={startRecording} size="lg" className="gap-2">
              <Mic className="w-4 h-4" />
              {t("record.startRecording")}
            </Button>
            <label className="cursor-pointer">
              <div className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-surface-800 text-surface-200 font-medium text-sm hover:bg-surface-700 border border-surface-700 transition-all gap-2">
                <Upload className="w-4 h-4" />
                {t("record.uploadFile")}
              </div>
              <input
                type="file"
                accept=".mp3,.wav,.mp4,.m4a,.ogg,.webm"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  onUploadStart?.();
                  try {
                    await api.uploadMeeting(file);
                    setStatus("success");
                    setUploading(false);
                    toast.success(t("record.uploadSuccessShort"));
                    setTimeout(() => {
                      setStatus("idle");
                      onUploadComplete();
                    }, 2000);
                  } catch {
                    setStatus("error");
                    setUploading(false);
                    toast.error(t("record.uploadFailed"));
                  }
                }}
                className="hidden"
              />
            </label>
          </>
        )}

        {recording && (
          <Button onClick={stopRecording} variant="danger" size="lg" className="gap-2">
            <Square className="w-4 h-4" />
            {t("record.stopRecording")}
          </Button>
        )}

        {uploading && (
          <div className="flex items-center gap-2 text-surface-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{t("record.uploading")}</span>
          </div>
        )}

        {status === "success" && (
          <div className="flex items-center gap-2 text-accent-400">
            <CheckCircle className="w-5 h-5" />
            <span>{t("record.uploadedProcessing")}</span>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{t("record.somethingWrong")}</span>
          </div>
        )}
      </div>

      <div className="max-w-md mx-auto">
        <div className="rounded-xl border border-surface-800/50 bg-surface-900/50 p-4">
          <h4 className="text-sm font-medium text-surface-300 mb-2">{t("record.supportedFormats")}</h4>
          <div className="flex flex-wrap gap-2">
            {["MP3", "WAV", "MP4", "M4A", "OGG", "WebM"].map((fmt) => (
              <span key={fmt} className="px-2 py-1 rounded-md bg-surface-800 text-surface-400 text-xs">
                {fmt}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
