"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BellDot, FileHeart, Hospital } from "lucide-react";
import { ProtectedRoute } from "@/components/guards/protected-route";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import ActionableNotifications from "@/components/dashboard/actionable-notifications";
import AdminAnalyticsPanel from "@/components/dashboard/admin-analytics-panel";
import ConnectedHospitals from "@/components/dashboard/connected-hospitals";
import HospitalWorkflowQueue from "@/components/dashboard/hospital-workflow-queue";
import { PatientDirectory } from "@/components/dashboard/patient-directory";
import QuickActionBar from "@/components/dashboard/quick-action-bar";
import RecentReportsPreview from "@/components/dashboard/recent-reports-preview";
import SmartHealthSummary from "@/components/dashboard/smart-health-summary";
import FeedbackSection from "@/components/reviews/feedback-section";
import HospitalReviewWidget from "@/components/dashboard/hospital-review-widget";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useDashboardState from "@/hooks/use-dashboard-state";
import { generateRecordShareLink } from "@/services/record.service";
import { useToast } from "@/hooks/use-toast";

const PatientTimelineGrouped = dynamic(() => import("@/components/dashboard/patient-timeline-grouped"), {
  loading: () => <Card><CardContent className="p-4"><Skeleton className="h-64 w-full" /></CardContent></Card>
});
const AiHealthInsights = dynamic(() => import("@/components/dashboard/ai-health-insights"), {
  loading: () => <Card><CardContent className="p-4"><Skeleton className="h-40 w-full" /></CardContent></Card>
});
const RecordDetailModal = dynamic(() => import("@/components/dashboard/record-detail-modal"), {
  ssr: false
});

export default function DashboardPage() {
  const toast = useToast();
  const {
    role,
    loading,
    records,
    cards,
    user,
    isPending,
    quickDecision,
    patientSummary,
    patientInsights,
    recordsByMonth,
    analyticsData,
    heatmapDays,
    connectedHospitals,
    actionableNotifications,
    markNotificationAsRead,
    healthScore
  } = useDashboardState({ toast });

  const [recordDetail, setRecordDetail] = useState({ open: false, record: null });
  const [shareState, setShareState] = useState({ loading: false, link: "" });
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const key = "vitacollab-onboarding-complete";
    const completed = window.localStorage.getItem(key);
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    window.localStorage.setItem("vitacollab-onboarding-complete", "yes");
    setShowOnboarding(false);
  };


  const renderMetricCards = () => (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardDescription>{item.label}</CardDescription>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.change}</p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </section>
  );

  const renderSkeletonCards = () => (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} hover={false}>
          <CardHeader>
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="mt-3 h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </section>
  );

  const openRecordDetail = useCallback((record) => {
    setRecordDetail({ open: true, record });
    setShareState({ loading: false, link: "" });
  }, []);

  const createShareLink = useCallback(async (record) => {
    try {
      setShareState({ loading: true, link: "" });
      const response = await generateRecordShareLink(record.id);
      setShareState({ loading: false, link: response?.data?.shareUrl || "" });
    } catch (error) {
      setShareState({ loading: false, link: "" });
      toast.error(error?.response?.data?.message || "Unable to generate secure share link");
    }
  }, [toast]);

  const copyShareLink = useCallback(async () => {
    if (!shareState.link) {
      return;
    }

    await navigator.clipboard.writeText(shareState.link);
    toast.success("Secure share link copied");
  }, [shareState.link, toast]);

  const renderPatientView = () => (
    <>
      <QuickActionBar
        onUpload={() => window.location.assign("/upload-record")}
        onTimeline={() => window.location.assign("/timeline")}
        onShare={() => {
          const latest = records[0];
          if (!latest) {
            toast.info("Upload a record first to share");
            return;
          }
          openRecordDetail(latest);
          createShareLink(latest);
        }}
        onRequestReview={() => window.location.assign("/chat")}
      />

      <SmartHealthSummary summary={patientSummary} />

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PatientTimelineGrouped
            recordsByMonth={recordsByMonth}
            records={records}
            heatmapDays={heatmapDays}
            healthScore={healthScore}
            onOpenRecord={openRecordDetail}
          />
        </div>
        <AiHealthInsights insights={patientInsights} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <ActionableNotifications
          notifications={actionableNotifications}
          onMarkRead={markNotificationAsRead}
          onOpenTimeline={() => window.location.assign("/timeline")}
        />
        <ConnectedHospitals hospitals={connectedHospitals} />
      </section>

      <FeedbackSection role="patient" records={records} />
    </>
  );

  const renderHospitalView = () => {
    return (
      <>
        <HospitalWorkflowQueue records={records} onDecision={quickDecision} isPending={isPending} />

        <PatientDirectory currentHospitalId={user?.id} />

        <HospitalReviewWidget hospitalId={user?.id} />

        <FeedbackSection role="hospital" records={records} />
      </>
    );
  };

  const renderAdminView = () => <AdminAnalyticsPanel analyticsData={analyticsData} />;

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
          <Sidebar />
          <main className="w-full space-y-6 pb-24 lg:pb-0">
            <motion.section className="animate-rise" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold tracking-tight">
                {role === "hospital" ? "Hospital Command Center" : role === "admin" ? "Admin Intelligence Board" : "Patient Dashboard"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {role === "hospital"
                  ? "Manage uploads, track approvals, and optimize care workflows."
                  : role === "admin"
                    ? "Monitor platform health, usage trends, and trust operations."
                    : "Overview of your records, approvals, health score, and smart insights."}
              </p>
            </motion.section>

            {showOnboarding ? (
              <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-success/10">
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">Welcome to VitaCollab</p>
                    <p className="text-xs text-muted-foreground">Your dashboard is ready. Complete your profile and upload your first record to unlock full collaboration.</p>
                  </div>
                  <button type="button" onClick={completeOnboarding} className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                    Continue
                  </button>
                </CardContent>
              </Card>
            ) : null}

            {loading ? renderSkeletonCards() : role === "patient" ? null : renderMetricCards()}

            {!loading && role === "patient" ? renderPatientView() : null}
            {!loading && role === "hospital" ? renderHospitalView() : null}
            {!loading && role === "admin" ? renderAdminView() : null}

            <RecentReportsPreview records={records} />
          </main>
        </div>

        <RecordDetailModal
          open={recordDetail.open}
          record={recordDetail.record}
          shareState={shareState}
          onClose={() => setRecordDetail({ open: false, record: null })}
          onGenerateLink={createShareLink}
          onCopyLink={copyShareLink}
        />
      </div>
    </ProtectedRoute>
  );
}
