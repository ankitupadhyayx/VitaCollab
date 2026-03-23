"use client";

import { Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRecordShortDate } from "@/lib/record-formatters";

export default function ConnectedHospitals({ hospitals }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Connected Hospitals
        </CardTitle>
        <CardDescription>Recent interaction status across care providers.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {hospitals.length ? (
          hospitals.slice(0, 6).map((entry) => (
            <div key={`${entry.name}-${entry.lastInteraction}`} className="rounded-2xl border border-border/70 bg-background/55 p-3">
              <p className="font-semibold text-foreground">{entry.name}</p>
              <p className="text-xs text-muted-foreground">Last interaction: {formatRecordShortDate(entry.lastInteraction)}</p>
              <p className={`text-xs font-semibold capitalize ${entry.status === "active" ? "text-success" : "text-muted-foreground"}`}>{entry.status}</p>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">No connected hospitals yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
