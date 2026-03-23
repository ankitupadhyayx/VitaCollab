"use client";

import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Search, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRecordDate, getRecordStatusMeta } from "@/lib/record-formatters";
import { fetchHospitalPatients } from "@/services/hospital.service";
import { fetchRecords } from "@/services/record.service";

const PatientDirectoryRow = memo(function PatientDirectoryRow({ patient, isSelected, onSelect }) {
  const statusMeta = getRecordStatusMeta(patient.status);

  return (
    <button
      type="button"
      onClick={() => onSelect(patient.id)}
      className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border p-3 text-left transition ${
        isSelected
          ? "border-primary bg-primary/10"
          : "border-border/70 bg-background/45 hover:border-primary/40 hover:bg-primary/5"
      }`}
    >
      {patient.profileImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={patient.profileImageUrl}
          alt={patient.name}
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <div className="grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground">
          <UserRound className="h-5 w-5" />
        </div>
      )}
      <div>
        <p className="text-sm font-semibold text-foreground">{patient.name}</p>
        <p className="text-xs text-muted-foreground">{patient.email}</p>
      </div>
      <Badge status={statusMeta.key}>{statusMeta.label}</Badge>
    </button>
  );
});

export function PatientDirectory({ currentHospitalId }) {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest_activity");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [manualEmail, setManualEmail] = useState("");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const {
    data: patientsResponse,
    isLoading: patientsLoading
  } = useQuery({
    queryKey: ["hospital-patients", debouncedSearch, sortBy, page, pageSize],
    queryFn: () =>
      fetchHospitalPatients({
        search: debouncedSearch,
        sort: sortBy,
        page,
        limit: pageSize
      }),
    staleTime: 15000
  });

  const patients = useMemo(() => patientsResponse?.data?.patients || [], [patientsResponse]);
  const pagination = patientsResponse?.data?.pagination || {
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 1
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, pageSize]);

  useEffect(() => {
    if (!patients.length) {
      setSelectedPatientId(null);
      return;
    }

    setSelectedPatientId((prev) => {
      if (prev && patients.some((item) => item.id === prev)) {
        return prev;
      }
      return patients[0].id;
    });
  }, [patients]);

  const selectedPatient = useMemo(
    () => patients.find((item) => item.id === selectedPatientId) || null,
    [patients, selectedPatientId]
  );
  const onSelectPatient = useCallback((patientId) => setSelectedPatientId(patientId), []);

  const patientRows = useMemo(
    () =>
      patients.map((patient) => ({
        id: patient.id,
        patient,
        isSelected: patient.id === selectedPatientId
      })),
    [patients, selectedPatientId]
  );

  const {
    data: recordsResponse,
    isLoading: recordsLoading
  } = useQuery({
    queryKey: ["hospital-patient-records", selectedPatientId],
    queryFn: () => fetchRecords({ patientId: selectedPatientId, limit: 25 }),
    enabled: Boolean(selectedPatientId),
    staleTime: 10000
  });

  const selectedPatientRecords = useMemo(() => {
    const all = recordsResponse?.data?.records || [];
    if (!currentHospitalId) {
      return all;
    }
    return all.filter((record) => String(record.hospitalId) === String(currentHospitalId));
  }, [recordsResponse, currentHospitalId]);

  const latestRecord = selectedPatientRecords[0] || null;
  const latestStatusMeta = getRecordStatusMeta(latestRecord?.status || selectedPatient?.latestRecordStatus);

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Patient Directory</CardTitle>
          <CardDescription>View, search, and track your patients in one place.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search patient by email..."
                aria-label="Search patient by name or email"
              />
              <Search className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>

            <select
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Sort patients"
            >
              <option value="latest_activity">Latest activity</option>
              <option value="name_asc">Name A-Z</option>
              <option value="pending_first">Pending first</option>
            </select>

            <select
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
              value={String(pageSize)}
              onChange={(event) => setPageSize(Number(event.target.value))}
              aria-label="Patients per page"
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>
          </div>

          {patientsLoading ? (
            <div className="grid gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-border/70 p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="w-full space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {!patientsLoading && patients.length ? (
            <div className="grid gap-2">
              {patientRows.map((entry) => (
                <PatientDirectoryRow
                  key={entry.id}
                  patient={entry.patient}
                  isSelected={entry.isSelected}
                  onSelect={onSelectPatient}
                />
              ))}
            </div>
          ) : null}

          {!patientsLoading && !patients.length ? (
            <div className="space-y-3">
              <EmptyState title="No patients found" description="Try a different name/email or search an external patient." />
              <div className="rounded-2xl border border-dashed border-border/70 bg-background/55 p-3">
                <p className="text-sm font-semibold">Search external patient by email</p>
                <p className="mb-2 text-xs text-muted-foreground">
                  If the patient is not in your directory yet, enter an email to upload a new record manually.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={manualEmail}
                    onChange={(event) => setManualEmail(event.target.value)}
                    placeholder="patient@example.com"
                    type="email"
                  />
                  <Button asChild variant="secondary" disabled={!manualEmail.trim()}>
                    <Link href={`/upload-record?patientEmail=${encodeURIComponent(manualEmail.trim())}`}>
                      Upload for this patient
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {!patientsLoading && patients.length ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-background/40 px-3 py-2">
              <p className="text-xs text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <p className="text-xs text-muted-foreground">Page {pagination.page} / {pagination.totalPages}</p>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Selected Patient</CardTitle>
          <CardDescription>Patient details and latest record visibility.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!selectedPatient ? (
            <p className="text-sm text-muted-foreground">Select a patient to view details.</p>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-2xl bg-background/55 p-3">
                {selectedPatient.profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedPatient.profileImageUrl}
                    alt={selectedPatient.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
                    <UserRound className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">{selectedPatient.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedPatient.email}</p>
                </div>
              </div>

              <div className="grid gap-2 rounded-2xl border border-border/70 bg-background/40 p-3 text-sm">
                <p>
                  <span className="text-muted-foreground">Record count:</span> {selectedPatient.recordCount || 0}
                </p>
                <p>
                  <span className="text-muted-foreground">Latest status:</span>{" "}
                  <Badge status={latestStatusMeta.key} className="align-middle">
                    {latestStatusMeta.label}
                  </Badge>
                </p>
                <p>
                  <span className="text-muted-foreground">Latest record date:</span>{" "}
                  {formatRecordDate(latestRecord?.createdAt || selectedPatient.latestRecordDate)}
                </p>
              </div>

              {recordsLoading ? <Skeleton className="h-16 w-full" /> : null}

              {!recordsLoading && latestRecord ? (
                <div className="rounded-2xl border border-border/70 bg-background/50 p-3 text-xs text-muted-foreground">
                  Latest: <span className="font-semibold capitalize text-foreground">{latestRecord.type}</span> on {formatRecordDate(latestRecord.createdAt)}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/records?patientId=${selectedPatient.id}`}>
                    View Records <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/upload-record?patientEmail=${encodeURIComponent(selectedPatient.email)}`}>
                    Upload for this patient
                  </Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
