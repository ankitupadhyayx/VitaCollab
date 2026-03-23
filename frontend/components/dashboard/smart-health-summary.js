"use client";

import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export default function SmartHealthSummary({ summary }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>Last report uploaded</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-bold">{summary.lastReportDate}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Pending approvals</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{summary.pendingApprovals}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Connected hospitals</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{summary.connectedHospitals}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Missing reports</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-warning">
            <AlertTriangle className="h-4 w-4" /> {summary.missingImportantReports}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
