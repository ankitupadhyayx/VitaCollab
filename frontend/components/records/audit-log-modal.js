"use client";

import { Clock3, ShieldCheck, UploadCloud, UserRoundCheck } from "lucide-react";
import { Modal } from "@/components/ui/modal";

const iconMap = {
  upload: UploadCloud,
  approved: ShieldCheck,
  rejected: UserRoundCheck,
  updated: Clock3
};

export function AuditLogModal({ open, onClose, record }) {
  if (!record) {
    return null;
  }

  const events = [
    {
      type: "upload",
      by: record.uploadedBy || record.hospital,
      action: "Record uploaded",
      at: record.createdAt || record.dateRaw
    },
    ...(record.status === "approved"
      ? [
          {
            type: "approved",
            by: record.approvedBy || "Patient",
            action: "Record approved",
            at: record.approvedAt || record.updatedAt
          }
        ]
      : []),
    ...(record.status === "rejected"
      ? [
          {
            type: "rejected",
            by: record.approvedBy || "Patient",
            action: "Record rejected",
            at: record.rejectedAt || record.updatedAt,
            note: record.reason || "No reason provided"
          }
        ]
      : []),
    {
      type: "updated",
      by: "System",
      action: "Latest version synchronized",
      at: record.updatedAt || record.createdAt || record.dateRaw
    }
  ].filter((item) => item.at);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record audit trail"
      description="Chronological trust log for healthcare-grade traceability."
      className="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="rounded-2xl bg-background/60 p-3 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground capitalize">{record.type} • v{record.version || 1}</p>
          <p className="text-xs">Uploaded by {record.uploadedBy || record.hospital}</p>
        </div>

        <div className="relative space-y-3 border-l border-border/80 pl-4">
          {events.map((entry, index) => {
            const Icon = iconMap[entry.type] || Clock3;
            return (
              <div key={`${entry.action}-${index}`} className="relative rounded-2xl bg-background/60 p-3">
                <span className="absolute -left-[22px] top-4 grid h-3 w-3 place-items-center rounded-full bg-primary" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className="h-4 w-4 text-primary" />
                  <span>{new Date(entry.at).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-foreground">{entry.action}</p>
                <p className="text-xs text-muted-foreground">By {entry.by}</p>
                {entry.note ? <p className="mt-1 text-xs text-danger">{entry.note}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
