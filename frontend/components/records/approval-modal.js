"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export function ApprovalModal({ open, mode = "approve", onClose, onSubmit }) {
  const [reason, setReason] = useState("");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "approve" ? "Approve this record?" : "Reject this record?"}
      description={
        mode === "approve"
          ? "Approved records become part of the verified timeline and are visible across providers."
          : "Please provide a short reason so the hospital can quickly correct it."
      }
    >
      <div className="space-y-4">
        {mode === "reject" ? (
          <Input
            placeholder="Reason for rejection"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        ) : null}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variant={mode === "approve" ? "default" : "danger"}
            onClick={() => onSubmit?.(reason)}
          >
            {mode === "approve" ? "Confirm Approval" : "Confirm Rejection"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
