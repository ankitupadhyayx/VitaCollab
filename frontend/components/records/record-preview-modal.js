"use client";

import { useCallback, useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/hooks/use-toast";
import { fetchSecureRecordFileAccess } from "@/services/record.service";

export function RecordPreviewModal({ open, record, onClose }) {
  const toast = useToast();
  const [fileUrl, setFileUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [nowTick, setNowTick] = useState(Date.now());
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const isPdf = record?.fileName?.toLowerCase().endsWith(".pdf") || record?.category?.toLowerCase().includes("pdf");

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 10000);

    return () => clearInterval(timer);
  }, [open]);

  const expiresAtTs = expiresAt ? new Date(expiresAt).getTime() : null;
  const remainingMs = expiresAtTs ? Math.max(0, expiresAtTs - nowTick) : null;
  const remainingMinutes = remainingMs === null ? null : Math.ceil(remainingMs / (60 * 1000));
  const isInFinalMinute = remainingMs !== null && remainingMs > 0 && remainingMs <= 60 * 1000;
  const expiryBadgeText = remainingMinutes === null
    ? null
    : isInFinalMinute
      ? "Expires in <1m"
      : remainingMinutes > 0
      ? `Expires in ~${remainingMinutes}m`
      : "Link expired";
  const isLinkExpired = remainingMinutes !== null && remainingMinutes <= 0;

  const loadFilePreview = useCallback(async () => {
    if (!open || !record?.id) {
      setFileUrl("");
      setExpiresAt(null);
      setPreviewError("");
      return;
    }

    try {
      setIsLoadingFile(true);
      setPreviewError("");
      const response = await fetchSecureRecordFileAccess(record.id, { download: false });
      const nextUrl = response?.data?.fileUrl || "";
      setFileUrl(nextUrl);
      setExpiresAt(response?.data?.expiresAt || null);
    } catch (error) {
      setFileUrl("");
      setExpiresAt(null);
      const message = error?.response?.data?.message || "Secure preview is unavailable. You may not have permission or the link expired.";
      setPreviewError(message);
      toast.error(message);
    } finally {
      setIsLoadingFile(false);
    }
  }, [open, record?.id, toast]);

  useEffect(() => {
    loadFilePreview();
  }, [loadFilePreview]);

  const downloadFile = async () => {
    if (!record?.id) {
      return;
    }

    try {
      setIsDownloading(true);
      const response = await fetchSecureRecordFileAccess(record.id, { download: true });
      const downloadUrl = response?.data?.fileUrl;

      if (!downloadUrl) {
        toast.error("Secure download link unavailable");
        return;
      }

      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to prepare secure download. Your session or link may have expired.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreviewMediaError = () => {
    const message = "Secure preview link expired or cannot be accessed. Click Refresh Preview.";
    setFileUrl("");
    setExpiresAt(null);
    setPreviewError(message);
  };

  if (!record) {
    return null;
  }

  return (
    <Modal open={open} onClose={onClose} title="Secure Record Preview" description={`${record.type} • version ${record.version || 1}`} className="max-w-3xl">
      <div className="space-y-4">
        <p className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
          This is a secure, patient-authorized medical record preview.
        </p>

        {expiryBadgeText ? (
          <div className="flex justify-end">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
              isLinkExpired ? "bg-danger/15 text-danger" : isInFinalMinute ? "bg-amber-500/15 text-amber-700" : "bg-primary/15 text-primary"
            }`}>
              {expiryBadgeText}
            </span>
          </div>
        ) : null}

        <div className="h-[55vh] min-h-[320px] overflow-hidden rounded-2xl border border-border/70 bg-background/60 sm:h-[420px]">
          {isLoadingFile ? (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">Loading secure preview...</div>
          ) : fileUrl ? (
            isPdf ? (
              <iframe src={fileUrl} title={record.fileName} className="h-full w-full" onError={handlePreviewMediaError} />
            ) : (
              <img src={fileUrl} alt={record.fileName} className="h-full w-full object-contain" onError={handlePreviewMediaError} />
            )
          ) : (
            <div className="grid h-full place-items-center gap-2 px-4 text-center text-sm text-muted-foreground">
              <p>{previewError || "Preview unavailable"}</p>
              <Button type="button" size="sm" variant="secondary" onClick={loadFilePreview}>
                Refresh Preview
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button className="w-full sm:w-auto" onClick={downloadFile} disabled={isDownloading}>
            <Download className="h-4 w-4" /> {isDownloading ? "Preparing..." : "Download"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
