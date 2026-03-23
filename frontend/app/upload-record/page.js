"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { ProtectedRoute } from "@/components/guards/protected-route";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { UploadZone } from "@/components/records/upload-zone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { uploadRecord } from "@/services/record.service";

export default function UploadRecordPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ patientId: "", type: "report", description: "" });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [file, setFile] = useState(null);
  const [recentUploads, setRecentUploads] = useState([]);
  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const recordTypes = ["report", "prescription", "bill", "lab", "imaging"];
  const patientSuggestions = [
    "patient1@vitacollab.in",
    "patient2@vitacollab.in",
    "pihu.mehta@vitacollab.in",
    "rahul.sharma@vitacollab.in"
  ];

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const hospitalPendingVerification = user?.role === "hospital" && user?.isHospitalVerified !== true;

  useEffect(() => {
    const patientEmail = searchParams.get("patientEmail");
    if (!patientEmail) {
      return;
    }

    setForm((prev) => (prev.patientId ? prev : { ...prev, patientId: patientEmail }));
  }, [searchParams]);

  const filteredPatients = useMemo(
    () => patientSuggestions.filter((item) => item.toLowerCase().includes(form.patientId.toLowerCase())).slice(0, 5),
    [form.patientId, patientSuggestions]
  );

  const visibleUploads = useMemo(() => {
    const filtered = recentUploads.filter((item) => {
      const byStatus = statusFilter === "all" ? true : item.status === statusFilter;
      const bySearch = query
        ? `${item.patientId} ${item.type} ${item.description}`.toLowerCase().includes(query.toLowerCase())
        : true;
      return byStatus && bySearch;
    });

    const start = (page - 1) * 5;
    return {
      rows: filtered.slice(start, start + 5),
      pages: Math.max(1, Math.ceil(filtered.length / 5))
    };
  }, [recentUploads, statusFilter, query, page]);

  const submit = async (event) => {
    event.preventDefault();

    if (!file) {
      toast.error("Please choose a file");
      return;
    }

    if (hospitalPendingVerification) {
      toast.error("Hospital is pending admin verification");
      return;
    }

    try {
      setSubmitting(true);
      await uploadRecord({ ...form, file });
      toast.success("Record uploaded for patient approval");
      setRecentUploads((prev) => [
        {
          id: Date.now(),
          patientId: form.patientId,
          type: form.type,
          description: form.description,
          status: "pending",
          fileName: file.name
        },
        ...prev
      ]);
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
          <main className="grid w-full gap-4 pb-24 lg:grid-cols-3 lg:pb-0">
            <Card className="animate-rise lg:col-span-2">
              <CardHeader>
                <CardTitle>Upload Medical Record</CardTitle>
                <CardDescription>Drag and drop files into a consent-driven approval workflow.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4" onSubmit={submit}>
                  {hospitalPendingVerification ? (
                    <div className="rounded-2xl border border-warning/35 bg-warning/10 p-3 text-sm text-warning-foreground">
                      Hospital verification is pending admin approval. Record upload is disabled until approval.
                    </div>
                  ) : null}

                  <FormField label="Patient Search" required hint="Start typing patient email for autocomplete">
                    <div className="relative">
                      <Input
                        placeholder="Patient ID or Email"
                        value={form.patientId}
                        onChange={(event) => update("patientId", event.target.value)}
                      />
                      <Search className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                    {form.patientId && filteredPatients.length ? (
                      <div className="mt-2 rounded-2xl border border-border/80 bg-background/95 p-2">
                        {filteredPatients.map((entry) => (
                          <button
                            key={entry}
                            type="button"
                            className="block w-full rounded-xl px-2 py-1 text-left text-sm hover:bg-muted"
                            onClick={() => update("patientId", entry)}
                          >
                            {entry}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </FormField>

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

                  <UploadZone file={file} onFileChange={setFile} />

                  <Button type="submit" className="w-full sm:w-fit" disabled={submitting || hospitalPendingVerification}>
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

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Record Status Tracking</CardTitle>
                <CardDescription>Search, filter, and review recently uploaded records.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input placeholder="Search uploads" value={query} onChange={(event) => setQuery(event.target.value)} />
                  <div className="flex gap-2">
                    {["all", "pending", "approved", "rejected"].map((status) => (
                      <button
                        key={status}
                        type="button"
                        className={`rounded-xl px-3 py-2 text-xs font-semibold capitalize ${statusFilter === status ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                        onClick={() => {
                          setStatusFilter(status);
                          setPage(1);
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {visibleUploads.rows.length ? (
                  <div className="space-y-2">
                    {visibleUploads.rows.map((item) => (
                      <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-background/70 p-3">
                        <div>
                          <p className="text-sm font-semibold capitalize">{item.type} • {item.fileName}</p>
                          <p className="text-xs text-muted-foreground">{item.patientId} • {item.description || "No description"}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          item.status === "approved"
                            ? "bg-success/15 text-success"
                            : item.status === "rejected"
                              ? "bg-danger/15 text-danger"
                              : "bg-warning/15 text-warning"
                        }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}

                    <div className="flex items-center justify-end gap-2">
                      <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
                      <p className="text-xs text-muted-foreground">Page {page} / {visibleUploads.pages}</p>
                      <Button variant="secondary" size="sm" disabled={page >= visibleUploads.pages} onClick={() => setPage((p) => Math.min(visibleUploads.pages, p + 1))}>Next</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No matching records yet.</p>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
