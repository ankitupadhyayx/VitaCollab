"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Link2, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatRecordDate, getRecordStatusMeta } from "@/lib/record-formatters";
import { fetchSecureRecordFileAccess } from "@/services/record.service";
import { useToast } from "@/hooks/use-toast";

export default function RecordDetailModal({ open, record, shareState, onClose, onGenerateLink, onCopyLink }) {
  const toast = useToast();
  const statusMeta = getRecordStatusMeta(record?.status);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewExpiresAt, setPreviewExpiresAt] = useState(null);
  const [nowTick, setNowTick] = useState(Date.now());
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [shareMode, setShareMode] = useState("default");
  const [expiresInMinutes, setExpiresInMinutes] = useState(20);
  const [maxUses, setMaxUses] = useState(3);
  const [oneTimeUse, setOneTimeUse] = useState(false);
  const [recipientUserId, setRecipientUserId] = useState("");

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 10000);

    return () => clearInterval(timer);
  }, [open]);

  const previewExpiresAtTs = previewExpiresAt ? new Date(previewExpiresAt).getTime() : null;
  const previewRemainingMs = previewExpiresAtTs ? Math.max(0, previewExpiresAtTs - nowTick) : null;
  const previewRemainingMinutes = previewRemainingMs === null ? null : Math.ceil(previewRemainingMs / (60 * 1000));
  const isPreviewInFinalMinute = previewRemainingMs !== null && previewRemainingMs > 0 && previewRemainingMs <= 60 * 1000;
  const previewExpiryBadgeText = previewRemainingMinutes === null
    ? null
    : isPreviewInFinalMinute
      ? "Expires in <1m"
      : previewRemainingMinutes > 0
      ? `Expires in ~${previewRemainingMinutes}m`
      : "Link expired";
  const isPreviewLinkExpired = previewRemainingMinutes !== null && previewRemainingMinutes <= 0;

  const loadPreviewUrl = useCallback(async () => {
    if (!open || !record?.id) {
      setPreviewUrl("");
      setPreviewExpiresAt(null);
      setPreviewError("");
      return;
    }

    try {
      setIsPreviewLoading(true);
      setPreviewError("");
      const response = await fetchSecureRecordFileAccess(record.id, { download: false });
      setPreviewUrl(response?.data?.fileUrl || "");
      setPreviewExpiresAt(response?.data?.expiresAt || null);
    } catch (error) {
      setPreviewUrl("");
      setPreviewExpiresAt(null);
      const message = error?.response?.data?.message || "Secure preview is unavailable. You may not have permission or the link expired.";
      setPreviewError(message);
      toast.error(message);
    } finally {
      setIsPreviewLoading(false);
    }
  }, [open, record?.id, toast]);

  useEffect(() => {
    loadPreviewUrl();
  }, [loadPreviewUrl]);

  const handlePreviewMediaError = () => {
    setPreviewUrl("");
    setPreviewExpiresAt(null);
    setPreviewError("Secure preview link expired or cannot be accessed. Please refresh preview.");
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    setShareMode("default");
    setExpiresInMinutes(20);
    setMaxUses(3);
    setOneTimeUse(false);
    setRecipientUserId("");
  }, [open, record?.id]);

  const generateShareLink = () => {
    if (!record) {
      return;
    }

    if (shareMode === "recipient" && !recipientUserId.trim()) {
      toast.error("Recipient user ID is required for recipient-bound sharing");
      return;
    }

    const payload = {
      expiresInMinutes,
      oneTimeUse,
      maxUses: oneTimeUse ? 1 : maxUses
    };

    if (shareMode === "recipient") {
      payload.recipientBound = true;
      payload.recipientUserId = recipientUserId.trim();
    }

    onGenerateLink(record, payload);
  };

  const generatedExpiryLabel = shareState?.expiresAt
    ? new Date(shareState.expiresAt).toLocaleString()
    : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={record ? `${record.type} record details` : "Record details"}
      description={record ? `${record.hospitalName} • ${formatRecordDate(record.createdAt || record.recordDate)}` : ""}
      className="max-w-3xl"
    >
      {record ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-background/55 p-3">
              <p className="text-xs text-muted-foreground">Title</p>
              <p className="font-semibold capitalize text-foreground">{record.type} report</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/55 p-3">
              <p className="text-xs text-muted-foreground">Approval status</p>
              <p className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}>{statusMeta.label}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/55 p-3">
              <p className="text-xs text-muted-foreground">Hospital</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">{(record.hospitalName || "H").slice(0, 1).toUpperCase()}</span>
                <p className="font-semibold text-foreground">{record.hospitalName}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/55 p-3">
              <p className="text-xs text-muted-foreground">Uploaded date</p>
              <p className="font-semibold text-foreground">{formatRecordDate(record.createdAt || record.recordDate)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/60 p-3">
            <p className="text-xs text-muted-foreground">Notes</p>
            <p className="text-sm text-foreground">{record.description || "No notes provided."}</p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/60 p-2">
            {previewExpiryBadgeText ? (
              <div className="mb-2 flex justify-end">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                  isPreviewLinkExpired
                    ? "bg-danger/15 text-danger"
                    : isPreviewInFinalMinute
                      ? "bg-amber-500/15 text-amber-700"
                      : "bg-primary/15 text-primary"
                }`}>
                  {previewExpiryBadgeText}
                </span>
              </div>
            ) : null}

            {isPreviewLoading ? (
              <div className="grid h-72 w-full place-items-center rounded-xl text-sm text-muted-foreground">Loading secure preview...</div>
            ) : previewUrl && String(record.fileMimeType || "").includes("pdf") ? (
              <iframe src={previewUrl} title="Record file preview" className="h-72 w-full rounded-xl" onError={handlePreviewMediaError} />
            ) : previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Record preview" className="h-72 w-full rounded-xl object-contain" onError={handlePreviewMediaError} />
            ) : (
              <div className="grid h-72 w-full place-items-center gap-2 rounded-xl px-4 text-center text-sm text-muted-foreground">
                <p>{previewError || "Preview unavailable"}</p>
                <Button type="button" size="sm" variant="secondary" onClick={loadPreviewUrl}>
                  Refresh Preview
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/55 p-3">
            <p className="mb-1 text-xs text-muted-foreground">Version history</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>v1 created at {formatRecordDate(record.createdAt || record.recordDate)}</li>
              <li>Last updated at {formatRecordDate(record.updatedAt || record.createdAt || record.recordDate)}</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/55 p-3">
            <p className="text-xs text-muted-foreground">Sharing mode</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShareMode("default")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  shareMode === "default" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Default
              </button>
              <button
                type="button"
                onClick={() => setShareMode("recipient")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  shareMode === "recipient" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Recipient-bound
              </button>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Expiry (minutes)</span>
                <input
                  type="number"
                  min={15}
                  max={30}
                  value={expiresInMinutes}
                  onChange={(event) => {
                    const value = Number(event.target.value || 20);
                    setExpiresInMinutes(Math.max(15, Math.min(30, value)));
                  }}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Usage limit</span>
                <input
                  type="number"
                  min={1}
                  max={3}
                  value={oneTimeUse ? 1 : maxUses}
                  disabled={oneTimeUse}
                  onChange={(event) => {
                    const value = Number(event.target.value || 3);
                    setMaxUses(Math.max(1, Math.min(3, value)));
                  }}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-70"
                />
              </label>
            </div>

            <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={oneTimeUse}
                onChange={(event) => setOneTimeUse(event.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              One-time use only
            </label>

            {shareMode === "recipient" ? (
              <label className="mt-3 block space-y-1">
                <span className="text-xs text-muted-foreground">Recipient user ID</span>
                <input
                  type="text"
                  value={recipientUserId}
                  onChange={(event) => setRecipientUserId(event.target.value)}
                  placeholder="Enter recipient user ID"
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
                />
                <span className="block text-[11px] text-muted-foreground">
                  Recipient-bound links require this user to be authenticated before access.
                </span>
              </label>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={generateShareLink}
              disabled={shareState.loading}
            >
              <Link2 className="h-4 w-4" /> {shareState.loading ? "Generating..." : "Generate secure link"}
            </Button>
            <Button size="sm" variant="secondary" onClick={onCopyLink} disabled={!shareState.link}>
              <Copy className="h-4 w-4" /> Copy link
            </Button>
            {shareState.link ? (
              <a href={`mailto:?subject=${encodeURIComponent("Medical record share")}&body=${encodeURIComponent(shareState.link)}`}>
                <Button size="sm" variant="secondary"><Mail className="h-4 w-4" /> Email</Button>
              </a>
            ) : null}
            {shareState.link ? (
              <a href={`https://wa.me/?text=${encodeURIComponent(shareState.link)}`} target="_blank" rel="noreferrer">
                <Button size="sm" variant="secondary"><MessageCircle className="h-4 w-4" /> WhatsApp</Button>
              </a>
            ) : null}
          </div>

          {shareState.link ? (
            <p className="text-xs text-muted-foreground">
              Generated as <span className="font-semibold text-foreground">{shareState.mode || "default"}</span>
              {generatedExpiryLabel ? ` • Expires: ${generatedExpiryLabel}` : ""}
              {Number.isFinite(Number(shareState.maxUses)) ? ` • Usage limit: ${shareState.maxUses}` : ""}
            </p>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
