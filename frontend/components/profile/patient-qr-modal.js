"use client";

import { Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function PatientQrModal({ open, onClose, value }) {
  const onDownload = () => {
    const canvas = document.getElementById("patient-qr-canvas");
    if (!canvas) {
      return;
    }
    const link = document.createElement("a");
    link.download = "vitacollab-patient-identity.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="My healthcare QR identity"
      description="Includes patient ID and secure one-time token for trusted handoffs."
      className="max-w-md"
    >
      <div className="space-y-4 text-center">
        <div className="mx-auto inline-flex rounded-2xl bg-white p-3">
          <QRCodeCanvas id="patient-qr-canvas" value={value} size={220} includeMargin />
        </div>
        <p className="text-xs text-muted-foreground break-all">{value}</p>
        <div className="flex justify-center">
          <Button type="button" onClick={onDownload}><Download className="h-4 w-4" /> Download QR</Button>
        </div>
      </div>
    </Modal>
  );
}
