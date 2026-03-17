"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ApprovalModal({ open, mode = "approve", onClose, onSubmit }) {
  const [reason, setReason] = useState("");

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === "approve" ? "Approve this record?" : "Reject this record?"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === "reject" ? (
            <Input
              placeholder="Reason for rejection"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Approved records become part of the verified timeline and are visible across providers.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button
              variant={mode === "approve" ? "default" : "danger"}
              onClick={() => onSubmit?.(reason)}
            >
              {mode === "approve" ? "Confirm Approval" : "Confirm Rejection"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
