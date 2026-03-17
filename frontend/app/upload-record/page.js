"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/guards/protected-route";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { uploadRecord } from "@/services/record.service";

export default function UploadRecordPage() {
  const [form, setForm] = useState({ patientId: "", type: "report", description: "" });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const recordTypes = ["report", "prescription", "bill", "lab", "imaging"];

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();

    if (!file) {
      toast.error("Please choose a file");
      return;
    }

    try {
      setSubmitting(true);
      await uploadRecord({ ...form, file });
      toast.success("Record uploaded for patient approval");
      setForm({ patientId: "", type: "report", description: "" });
      setFile(null);
    } catch (error) {
      const firstValidationError = error?.response?.data?.errors?.[0]?.message;
      toast.error(firstValidationError || error?.response?.data?.message || "Failed to upload record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute roles={["hospital", "admin"]}>
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
          <Sidebar />
          <main className="grid w-full gap-4 lg:grid-cols-3">
            <Card className="animate-rise lg:col-span-2">
              <CardHeader>
                <CardTitle>Upload Medical Record</CardTitle>
                <CardDescription>Add a patient document for approval workflow.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4" onSubmit={submit}>
                  <Input
                    placeholder="Patient ID or Email"
                    value={form.patientId}
                    onChange={(event) => update("patientId", event.target.value)}
                  />

                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Record Type</p>
                    <div className="flex flex-wrap gap-2">
                      {recordTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => update("type", type)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition ${
                            form.type === type
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/80 bg-background/70 text-foreground hover:border-primary/60"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Textarea
                    placeholder="Clinical summary"
                    value={form.description}
                    onChange={(event) => update("description", event.target.value)}
                  />

                  <div className="rounded-xl border border-dashed border-border/80 bg-background/60 p-3">
                    <Input type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {file ? `Selected file: ${file.name}` : "Accepted: PDF, image scans, discharge docs"}
                    </p>
                  </div>

                  <Button type="submit" className="w-full sm:w-fit" disabled={submitting}>
                    {submitting ? "Uploading..." : "Upload Record"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="animate-rise bg-gradient-to-br from-primary/10 to-accent/10">
              <CardHeader>
                <CardTitle>Submission Checklist</CardTitle>
                <CardDescription>Reduce back-and-forth before patient review.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>- Use the correct patient identifier.</p>
                <p>- Keep clinical notes concise and clear.</p>
                <p>- Upload readable files with complete pages.</p>
                <p>- Double-check record type for faster approval.</p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
