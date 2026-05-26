"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Recorder } from "@/components/recording/Recorder";
import { FileUpload } from "@/components/recording/FileUpload";
import { ProcessingUI } from "@/components/ui/processing";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/animations";
import { PageHeader } from "@/components/layout/PageHeader";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { Mic, Upload } from "lucide-react";

type Mode = "record" | "upload";
type ViewMode = "input" | "processing";

export default function RecordPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>("record");
  const [viewMode, setViewMode] = useState<ViewMode>("input");

  const handleUploadStart = () => {
    setViewMode("processing");
  };

  const handleUploadComplete = () => {
    toast.success(t("record.uploadSuccess"));
    router.push("/dashboard");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FadeIn>
        <PageHeader
          title={t("record.title")}
          description={t("record.subtitle")}
          showBack
          backHref="/dashboard"
          breadcrumbs={[
            { label: t("nav.dashboard"), href: "/dashboard" },
            { label: t("record.title") },
          ]}
        />
      </FadeIn>

      {viewMode === "input" ? (
        <>
          <FadeIn delay={0.1}>
            <div className="flex items-center gap-2 p-1 rounded-xl bg-surface-900 border border-surface-800 w-fit">
              <button
                onClick={() => setMode("record")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === "record"
                    ? "bg-surface-800 text-white shadow-sm"
                    : "text-surface-400 hover:text-surface-300"
                }`}
              >
                <Mic className="w-4 h-4" />
                {t("record.recordTab")}
              </button>
              <button
                onClick={() => setMode("upload")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === "upload"
                    ? "bg-surface-800 text-white shadow-sm"
                    : "text-surface-400 hover:text-surface-300"
                }`}
              >
                <Upload className="w-4 h-4" />
                {t("record.uploadTab")}
              </button>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Card className="p-8">
              {mode === "record" ? (
                <Recorder
                  onUploadStart={handleUploadStart}
                  onUploadComplete={handleUploadComplete}
                />
              ) : (
                <FileUpload
                  onUploadStart={handleUploadStart}
                  onUploadComplete={handleUploadComplete}
                />
              )}
            </Card>
          </FadeIn>
        </>
      ) : (
        <FadeIn>
          <ProcessingUI />
        </FadeIn>
      )}
    </div>
  );
}
