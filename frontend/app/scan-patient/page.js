"use client";

import { useEffect, useRef, useState } from "react";
import { ScanLine } from "lucide-react";
import { ProtectedRoute } from "@/components/guards/protected-route";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { resolvePatientQrToken } from "@/services/qr.service";

export default function ScanPatientPage() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const frameLoopRef = useRef(null);
  const detectorRef = useRef(null);
  const [manualToken, setManualToken] = useState("");
  const [scannerError, setScannerError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [patient, setPatient] = useState(null);
  const toast = useToast();

  const stopScanner = () => {
    if (frameLoopRef.current) {
      window.clearInterval(frameLoopRef.current);
      frameLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const handleResolvedPayload = async (rawValue) => {
    try {
      const parsed = JSON.parse(rawValue);
      if (!parsed?.token) {
        throw new Error("Invalid QR payload");
      }

      const response = await resolvePatientQrToken(parsed.token);
      setPatient(response?.data?.patient || null);
      setScannerError("");
      stopScanner();
      toast.success("Patient identity verified");
    } catch (error) {
      setScannerError(error?.response?.data?.message || error?.message || "Invalid QR code");
      setPatient(null);
    }
  };

  const startScanner = async () => {
    try {
      setScannerError("");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      if ("BarcodeDetector" in window) {
        detectorRef.current = new window.BarcodeDetector({ formats: ["qr_code"] });
        frameLoopRef.current = window.setInterval(async () => {
          if (!videoRef.current || !detectorRef.current) {
            return;
          }
          const barcodes = await detectorRef.current.detect(videoRef.current).catch(() => []);
          const first = barcodes?.[0]?.rawValue;
          if (first) {
            await handleResolvedPayload(first);
          }
        }, 650);
      } else {
        setScannerError("BarcodeDetector is not supported in this browser. Use manual token input below.");
      }

      setScanning(true);
    } catch (error) {
      setScannerError(error?.message || "Unable to access camera scanner");
      stopScanner();
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <ProtectedRoute roles={["hospital", "admin"]}>
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
          <Sidebar />
          <main className="w-full space-y-4 pb-24 lg:pb-0">
            <header>
              <h1 className="text-3xl font-bold tracking-tight">Scan Patient QR</h1>
              <p className="text-sm text-muted-foreground">Securely resolve patient identity from hospital-side scanner.</p>
            </header>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ScanLine className="h-5 w-5 text-primary" /> Camera Scanner</CardTitle>
                <CardDescription>Point camera at patient QR to extract secure token.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="overflow-hidden rounded-2xl border border-border/80 bg-black/80">
                  <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
                </div>

                <div className="flex gap-2">
                  {!scanning ? (
                    <Button type="button" onClick={startScanner}>Start Scanner</Button>
                  ) : (
                    <Button type="button" variant="secondary" onClick={stopScanner}>Stop Scanner</Button>
                  )}
                </div>

                <div className="space-y-2 rounded-2xl bg-background/65 p-3">
                  <p className="text-xs text-muted-foreground">Manual token fallback</p>
                  <div className="flex gap-2">
                    <input
                      value={manualToken}
                      onChange={(event) => setManualToken(event.target.value)}
                      placeholder='Paste QR JSON payload here'
                      className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm"
                    />
                    <Button type="button" variant="secondary" onClick={() => handleResolvedPayload(manualToken)}>Resolve</Button>
                  </div>
                </div>

                {scannerError ? <p className="text-sm text-danger">{scannerError}</p> : null}
              </CardContent>
            </Card>

            {patient ? (
              <Card>
                <CardHeader>
                  <CardTitle>Patient Verified</CardTitle>
                  <CardDescription>Identity resolved successfully.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><span className="font-semibold">Name:</span> {patient.name}</p>
                  <p><span className="font-semibold">Email:</span> {patient.email}</p>
                  <p><span className="font-semibold">Blood Group:</span> {patient?.patientProfile?.bloodGroup || "-"}</p>
                  <p><span className="font-semibold">Phone:</span> {patient?.patientProfile?.phone || "-"}</p>
                </CardContent>
              </Card>
            ) : null}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
