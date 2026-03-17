import { CalendarDays, FileText, Hospital, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function RecordCard({ record, onApprove, onReject, showActions = false }) {
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
            <span>{record.hospital}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            {record.fileLink ? (
              <a
                href={record.fileLink}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary hover:underline"
              >
                {record.fileName}
              </a>
            ) : (
              <span>{record.fileName}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span>{record.category}</span>
          </div>
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
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => onApprove?.(record)}>
              Approve
            </Button>
            <Button variant="danger" className="flex-1" onClick={() => onReject?.(record)}>
              Reject
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
