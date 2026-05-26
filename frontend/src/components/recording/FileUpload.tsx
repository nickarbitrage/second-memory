"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { Upload, FileAudio, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface FileUploadProps {
  onUploadStart?: () => void;
  onUploadComplete: () => void;
}

export function FileUpload({ onUploadStart, onUploadComplete }: FileUploadProps) {
  const { t } = useI18n();
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    setUploading(true);
    onUploadStart?.();
    try {
      await api.uploadMeeting(f);
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
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`relative rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
        dragOver
          ? "border-primary-500/50 bg-primary-500/5"
          : "border-surface-700 hover:border-surface-600"
      }`}
    >
      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary-400" />
          <p className="text-surface-400">{t("record.uploading")}</p>
        </div>
      ) : status === "success" ? (
        <div className="flex flex-col items-center gap-3">
          <CheckCircle className="w-10 h-10 text-accent-400" />
          <p className="text-accent-400 font-medium">{t("record.uploadedProcessing")}</p>
        </div>
      ) : status === "error" ? (
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-red-400">{t("record.uploadFailed")}</p>
          <Button onClick={() => setStatus("idle")}>{t("record.tryAgain")}</Button>
        </div>
      ) : (
        <>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/10 mb-4">
            <FileAudio className="w-8 h-8 text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{t("record.uploadTitle")}</h3>
          <p className="text-surface-400 mb-4">{t("record.uploadHint")}</p>
          <Button onClick={() => inputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            {t("record.selectFile")}
          </Button>
          <p className="text-xs text-surface-500 mt-4">{t("record.formatsHint")}</p>
          <input
            ref={inputRef}
            type="file"
            accept=".mp3,.wav,.mp4,.m4a,.ogg,.webm"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
            className="hidden"
          />
        </>
      )}
    </div>
  );
}
