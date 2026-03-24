import { CalendarDays, FileText, Hospital, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function RecordCard({ record, onApprove, onReject, onPreview, onAudit, showActions = false, actionPending = false }) {
  return (
    <Card className="animate-rise overflow-hidden">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{record.date}</p>
            <h3 className="text-base font-semibold capitalize">{record.type} Record</h3>
          </div>
          <Badge status={record.status} />
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{record.description}</p>

        <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <Hospital className="h-4 w-4 text-primary" />
            <span className="break-all">{record.hospital}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            {record.fileLink ? (
              <a
                href={record.fileLink}
                target="_blank"
                rel="noreferrer"
                className="break-all font-medium text-primary hover:underline"
              >
                {record.fileName}
              </a>
            ) : (
              <span className="break-all">{record.fileName}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span>{record.category}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span className="rounded-full bg-muted px-2 py-1 font-semibold text-muted-foreground">Updated report v{record.version || 1}</span>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="font-semibold text-primary" onClick={() => onAudit?.(record)}>
              Audit Trail
            </button>
            <button type="button" className="font-semibold text-primary" onClick={() => onPreview?.(record)}>
              Preview / Share
            </button>
          </div>
        </div>

        <div className="grid gap-2 rounded-2xl bg-background/60 p-3 text-xs text-muted-foreground sm:grid-cols-3">
          <p>Uploaded by: <span className="font-semibold text-foreground">{record.uploadedBy || record.hospital}</span></p>
          <p>Approved by: <span className="font-semibold text-foreground">{record.approvedBy || "-"}</span></p>
          <p>Updated: <span className="font-semibold text-foreground">{new Date(record.updatedAt || record.createdAt || Date.now()).toLocaleString()}</span></p>
        </div>

        {record.status === "rejected" && record.reason ? (
          <div className="rounded-xl border border-danger/25 bg-danger/10 p-3 text-xs text-danger">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="h-4 w-4" />
              Rejection note
            </div>
            <p className="mt-1">{record.reason}</p>
          </div>
        ) : null}

        {showActions && record.status === "pending" ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="w-full flex-1" onClick={() => onApprove?.(record)}>
              {actionPending ? "Approving..." : "Approve"}
            </Button>
            <Button variant="danger" className="w-full flex-1" onClick={() => onReject?.(record)} disabled={actionPending}>
              {actionPending ? "Updating..." : "Reject"}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
