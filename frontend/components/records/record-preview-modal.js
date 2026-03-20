"use client";

import { Download, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/hooks/use-toast";

export function RecordPreviewModal({ open, record, onClose }) {
  const toast = useToast();

  if (!record) {
    return null;
  }

  const isPdf = record.fileName?.toLowerCase().endsWith(".pdf") || record.category?.toLowerCase().includes("pdf");

  const copyShareLink = async () => {
    if (!record.fileLink) {
      toast.error("No secure link available");
      return;
    }

    await navigator.clipboard.writeText(record.fileLink);
    toast.success("Secure link copied");
  };

  return (
    <Modal open={open} onClose={onClose} title="Record Preview" description={`${record.type} • version ${record.version || 1}`} className="max-w-3xl">
      <div className="space-y-4">
        <div className="h-[420px] overflow-hidden rounded-2xl border border-border/70 bg-background/60">
          {record.fileLink ? (
            isPdf ? (
              <iframe src={record.fileLink} title={record.fileName} className="h-full w-full" />
            ) : (
              <img src={record.fileLink} alt={record.fileName} className="h-full w-full object-contain" />
            )
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">Preview unavailable</div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={copyShareLink}><Link2 className="h-4 w-4" /> Share secure link</Button>
          {record.fileLink ? (
            <a href={record.fileLink} download={record.fileName} target="_blank" rel="noreferrer">
              <Button><Download className="h-4 w-4" /> Download</Button>
            </a>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
