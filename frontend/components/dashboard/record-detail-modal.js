"use client";

import { Copy, Link2, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatRecordDate, getRecordStatusMeta } from "@/lib/record-formatters";
import { toAbsoluteApiUrl } from "@/services/api";

export default function RecordDetailModal({ open, record, shareState, onClose, onGenerateLink, onCopyLink }) {
  const statusMeta = getRecordStatusMeta(record?.status);

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
            {String(record.fileMimeType || "").includes("pdf") ? (
              <iframe src={record.fileUrl || toAbsoluteApiUrl(record.filePath)} title="Record file preview" className="h-72 w-full rounded-xl" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={record.fileUrl || toAbsoluteApiUrl(record.filePath)} alt="Record preview" className="h-72 w-full rounded-xl object-contain" />
            )}
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/55 p-3">
            <p className="mb-1 text-xs text-muted-foreground">Version history</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>v1 created at {formatRecordDate(record.createdAt || record.recordDate)}</li>
              <li>Last updated at {formatRecordDate(record.updatedAt || record.createdAt || record.recordDate)}</li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onGenerateLink(record)}
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
        </div>
      ) : null}
    </Modal>
  );
}
