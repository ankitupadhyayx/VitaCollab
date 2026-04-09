"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  Calendar,
  Clock3,
  Copy,
  Download,
  Link2,
  Mail,
  MessageCircle,
  RefreshCcw,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { fetchSharedRecord } from "@/services/record.service";
import { formatRecordDate, getRecordStatusMeta } from "@/lib/record-formatters";

const classifyShareError = (error) => {
  const message = String(error?.response?.data?.message || "Unable to open secure share link.");
  const normalized = message.toLowerCase();
  const status = Number(error?.response?.status || 0);

  if (status === 401 || normalized.includes("expired")) {
    return {
      kind: "expired",
      title: "This secure link has expired",
      description: "For your safety, shared health record links expire automatically. Please request a new link from the sender."
    };
  }

  if (normalized.includes("already used") || normalized.includes("usage") || normalized.includes("revoked")) {
    return {
      kind: "expired",
      title: "This secure link is no longer active",
      description: "The usage limit has been reached or the sender revoked access. Please request a new secure link."
    };
  }

  if (status === 403 || normalized.includes("recipient")) {
    return {
      kind: "invalid",
      title: "Access restricted",
      description: "This shared link is recipient-bound and cannot be opened from this account or device."
    };
  }

  return {
    kind: "invalid",
    title: "Unable to open shared record",
    description: "This secure link is invalid or unavailable. Please verify the link and try again."
  };
};

const formatMinutesRemaining = (expiresAt, nowTick) => {
  if (!expiresAt) {
    return null;
  }

  const remainingMs = Math.max(0, new Date(expiresAt).getTime() - nowTick);
  if (remainingMs <= 0) {
    return "Expired";
  }

  if (remainingMs <= 60 * 1000) {
    return "Expires in <1m";
  }

  const minutes = Math.ceil(remainingMs / (60 * 1000));
  return `Expires in ~${minutes}m`;
};

const LoadingSkeleton = () => {
  return (
    <div className="mx-auto w-full max-w-3xl rounded-3xl border border-border/70 bg-card/80 p-4 shadow-xl shadow-slate-900/5 sm:p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">Encrypting records...</p>
        </div>
        <div className="grid gap-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

const ErrorState = ({ title, description }) => {
  return (
    <div className="mx-auto w-full max-w-xl rounded-3xl border border-border/70 bg-card/90 p-6 text-center shadow-xl shadow-slate-900/5 sm:p-8">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-danger/15 text-danger">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h1 className="heading-font text-2xl font-semibold text-foreground">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <p className="mt-5 rounded-xl border border-border/70 bg-muted/55 px-4 py-3 text-xs text-muted-foreground">
        This link is protected and automatically expires to keep medical records secure.
      </p>
    </div>
  );
};

export default function SharedRecordPage({ params }) {
  const searchParams = useSearchParams();
  const token = params?.token;
  const toast = useToast();

  const [status, setStatus] = useState("loading");
  const [errorInfo, setErrorInfo] = useState(null);
  const [payload, setPayload] = useState(null);
  const [filePreviewError, setFilePreviewError] = useState("");
  const [nowTick, setNowTick] = useState(Date.now());

  const loadSharedRecord = useCallback(async () => {
    if (!token) {
      setStatus("error");
      setErrorInfo({
        kind: "invalid",
        title: "Invalid secure link",
        description: "The shared record token is missing or malformed."
      });
      return;
    }

    try {
      setStatus("loading");
      setErrorInfo(null);
      setFilePreviewError("");

      const recipientEmail = searchParams?.get("email");
      const response = await fetchSharedRecord(token, recipientEmail ? { email: recipientEmail } : {});
      const data = response?.data || null;

      if (!data?.record) {
        throw new Error("Shared record payload is missing.");
      }

      setPayload(data);
      setStatus("ready");
    } catch (error) {
      const classified = classifyShareError(error);
      setErrorInfo(classified);
      setStatus(classified.kind === "expired" ? "expired" : "error");
    }
  }, [searchParams, token]);

  useEffect(() => {
    loadSharedRecord();
  }, [loadSharedRecord]);

  useEffect(() => {
    if (status !== "ready") {
      return undefined;
    }

    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 10000);

    return () => clearInterval(timer);
  }, [status]);

  const share = payload?.share || {};
  const record = payload?.record || {};
  const statusMeta = getRecordStatusMeta(record?.status);

  const shareExpiryLabel = useMemo(() => formatMinutesRemaining(share?.expiresAt, nowTick), [share?.expiresAt, nowTick]);
  const fileExpiryLabel = useMemo(() => formatMinutesRemaining(record?.fileUrlExpiresAt, nowTick), [record?.fileUrlExpiresAt, nowTick]);
  const isPdf = String(record?.fileMimeType || "").toLowerCase().includes("pdf");
  const hasPreview = Boolean(record?.fileUrl) && !filePreviewError;

  const handleFilePreviewError = () => {
    setFilePreviewError("Secure preview is unavailable right now. Please refresh this page to request a new preview.");
  };

  const sharePageUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = async () => {
    if (!sharePageUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(sharePageUrl);
      toast.success("Secure link copied");
    } catch {
      toast.error("Unable to copy link");
    }
  };

  if (status === "loading") {
    return (
      <main className="main-shell min-h-screen px-4 py-8 sm:px-6 sm:py-10">
        <LoadingSkeleton />
      </main>
    );
  }

  if (status === "expired" || status === "error") {
    return (
      <main className="main-shell min-h-screen px-4 py-8 sm:px-6 sm:py-10">
        <ErrorState
          title={errorInfo?.title || "Unable to open secure link"}
          description={errorInfo?.description || "Please request a fresh secure link from the sender."}
        />
      </main>
    );
  }

  return (
    <main className="main-shell min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-border/70 bg-card/90 p-4 shadow-[0_24px_64px_rgba(15,23,42,0.12)] sm:p-6">
        <div className="space-y-2">
          <h1 className="heading-font text-3xl font-semibold leading-tight text-foreground">{record?.type || "Medical"} record details</h1>
          <p className="text-sm text-muted-foreground">Shared securely for authorized access only.</p>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            This link is secure and expires automatically
          </p>
          <p className="text-xs text-muted-foreground">Encrypted transfer • Patient-authorized access • Verified activity logs</p>
        </div>

        <section className="mt-5 grid gap-3">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-3.5">
            <p className="text-xs text-muted-foreground">Record title</p>
            <p className="mt-1 text-lg font-semibold capitalize text-foreground">{`${record?.type || "Medical"} report`}</p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/70 p-3.5">
            <p className="text-xs text-muted-foreground">Issued by Hospital</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-primary">
                <Building2 className="h-4 w-4" />
              </span>
              <p className="text-base font-semibold text-foreground">{record?.hospitalName || "Hospital"}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/70 p-3.5">
            <p className="text-xs text-muted-foreground">Issued on</p>
            <p className="mt-1 inline-flex items-center gap-2 text-base font-semibold text-foreground">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {formatRecordDate(record?.recordDate)}
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/70 p-3.5">
            <p className="text-xs text-muted-foreground">Approval status</p>
            <p className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}>
              <BadgeCheck className="h-3.5 w-3.5" />
              {statusMeta.label}
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/70 p-3.5">
            <p className="text-xs text-muted-foreground">Doctor Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{record?.description || "No additional notes provided."}</p>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-border/70 bg-muted/25 p-3.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
              <Clock3 className="h-3.5 w-3.5" />
              {shareExpiryLabel || "Expiry active"}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-1 font-semibold">
              Remaining uses: {Number.isFinite(Number(share?.remainingUses)) ? share.remainingUses : "--"}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-1 font-semibold">
              Usage policy: {share?.oneTimeUse ? "One-time" : "Multi-use"}
            </span>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-border/70 bg-background/70 p-3.5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="heading-font text-lg font-semibold text-foreground">Record preview</h2>
            {fileExpiryLabel ? (
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{fileExpiryLabel}</span>
            ) : null}
          </div>

          {hasPreview ? (
            <div className="overflow-hidden rounded-xl border border-border/70 bg-black/[0.03]">
              {isPdf ? (
                <iframe
                  src={record.fileUrl}
                  title="Shared record preview"
                  className="h-[65vh] min-h-[340px] w-full"
                  onError={handleFilePreviewError}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={record.fileUrl}
                  alt="Shared medical record"
                  className="h-auto max-h-[65vh] w-full object-contain"
                  onError={handleFilePreviewError}
                />
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/35 p-4 text-sm text-muted-foreground">
              {filePreviewError || "Preview not available for this file type at the moment."}
            </div>
          )}

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {record?.fileUrl ? (
              <a href={record.fileUrl} target="_blank" rel="noreferrer" className="w-full">
                <Button variant="secondary" className="w-full">
                  <Download className="h-4 w-4" />
                  Download Record
                </Button>
              </a>
            ) : null}
            <Button variant="secondary" className="w-full" onClick={copyLink}>
              <Copy className="h-4 w-4" />
              Copy Secure Link
            </Button>
            <a href={`mailto:?subject=${encodeURIComponent("Secure medical record")}&body=${encodeURIComponent(sharePageUrl)}`} className="w-full">
              <Button variant="secondary" className="w-full">
                <Mail className="h-4 w-4" />
                Share by Email
              </Button>
            </a>
            <a href={`https://wa.me/?text=${encodeURIComponent(sharePageUrl)}`} target="_blank" rel="noreferrer" className="w-full">
              <Button variant="secondary" className="w-full">
                <MessageCircle className="h-4 w-4" />
                Share on WhatsApp
              </Button>
            </a>
            <Button variant="secondary" className="w-full" onClick={loadSharedRecord}>
              <RefreshCcw className="h-4 w-4" />
              Refresh Secure View
            </Button>
          </div>

          <p className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Link2 className="h-3.5 w-3.5" />
            This is a secure, patient-authorized medical record.
          </p>
        </section>
      </div>
    </main>
  );
}
