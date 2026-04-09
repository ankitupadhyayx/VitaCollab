import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Database,
  FileCheck2,
  FileLock2,
  ShieldCheck,
  Stethoscope,
  Workflow
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { resolveServerApiBaseUrl } from "@/lib/api";

const features = [
  {
    icon: Clock3,
    title: "Verified Health Timeline",
    description: "See one reliable timeline of reports, prescriptions, and care history in seconds."
  },
  {
    icon: FileLock2,
    title: "Secure Record Sharing",
    description: "Share records with providers through encrypted links and clear visibility controls."
  },
  {
    icon: FileCheck2,
    title: "Approval-Based Access",
    description: "Patients approve access before any cross-hospital collaboration begins."
  },
  {
    icon: Workflow,
    title: "Coordinated Care Workflow",
    description: "Hospitals, specialists, and patients stay aligned with secure updates and alerts."
  }
];

const logos = ["Northstar Care", "MediBridge", "Clarity Health", "LifeSpring Network", "Sai Hospitals"];

const securityHighlights = [
  {
    icon: ShieldCheck,
    title: "Encryption by default",
    description: "Sensitive health data is protected in transit and at rest."
  },
  {
    icon: Database,
    title: "Patient-controlled access",
    description: "Every share is consent-based and can be revoked when needed."
  },
  {
    icon: Stethoscope,
    title: "Full audit visibility",
    description: "Every view, update, and approval is time-stamped for accountability."
  }
];

const trustProofMetrics = [
  { value: "99.95%", label: "Service uptime" },
  { value: "256-bit", label: "Encryption" },
  { value: "100%", label: "Consent-gated sharing" },
  { value: "24/7", label: "Threat monitoring" }
];

const trustControlItems = [
  {
    icon: ShieldCheck,
    title: "Consent verification",
    description: "Every outbound share is blocked until patient approval is confirmed."
  },
  {
    icon: FileCheck2,
    title: "Record integrity checks",
    description: "Uploaded files are validated before becoming part of the clinical timeline."
  },
  {
    icon: Database,
    title: "Audit evidence trail",
    description: "All views, approvals, and updates are logged for governance review."
  }
];

const systemActivityFeed = [
  { label: "Hospital upload validated", time: "2 min ago" },
  { label: "Patient consent granted", time: "5 min ago" },
  { label: "Specialist access recorded", time: "9 min ago" }
];

const productMiniSnapshots = [
  {
    title: "Patient timeline",
    subtitle: "Trusted clinical history",
    points: ["Chronological records", "Approval status", "Source traceability"]
  },
  {
    title: "Hospital workflow",
    subtitle: "Secure operational flow",
    points: ["Upload checks", "Consent checkpoints", "Share-ready handoff"]
  },
  {
    title: "Security audit",
    subtitle: "Complete activity trail",
    points: ["Access trail", "Role visibility", "Compliance evidence"]
  }
];

const loadLandingTestimonials = async () => {
  try {
    const response = await fetch(`${resolveServerApiBaseUrl()}/reviews/public?random=true&count=6`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    const reviews = payload?.data?.reviews || [];

    return reviews
      .filter((item) => String(item?.comment || "").trim().length > 0)
      .map((item) => ({
        name: item.userName || "Anonymous",
        photo: item.userProfileImageUrl || null,
        rating: Number(item.rating || 0),
        text: item.comment,
        location: item.userLocation || null
      }));
  } catch (error) {
    return [];
  }
};

export default async function LandingPage() {
  const testimonials = await loadLandingTestimonials();

  return (
    <div className="min-h-screen main-shell">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:pb-28">
        <section className="premium-surface relative overflow-hidden rounded-[2rem] border border-primary/20 bg-[linear-gradient(140deg,rgba(236,253,245,0.98),rgba(255,255,255,0.96)_48%,rgba(236,254,255,0.92))] px-6 py-10 shadow-[0_34px_96px_rgba(6,95,70,0.22)] ring-1 ring-white/60 dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/70 dark:ring-emerald-300/12 sm:px-10 lg:px-12 lg:py-20">
          <div className="ambient-float absolute -top-24 right-0 h-56 w-56 rounded-full bg-teal-200/35 blur-3xl" />
          <div className="ambient-float absolute bottom-0 left-0 h-52 w-52 rounded-full bg-emerald-200/35 blur-3xl" />
          <div className="absolute inset-x-14 -top-8 h-28 rounded-full bg-gradient-to-r from-emerald-300/15 via-teal-300/15 to-cyan-300/15 blur-2xl" />

          <div className="relative grid items-center gap-11 lg:grid-cols-2 lg:gap-14">
            <div className="space-y-6 sm:space-y-7 animate-rise">
              <p className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase leading-none tracking-[0.16em] text-primary shadow-[0_0_22px_rgba(16,185,129,0.2)]">
                Trusted healthcare record layer
              </p>
              <h1 className="heading-font text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                Secure health records, verified workflows, patient control.
              </h1>
              <p className="body-font max-w-xl text-base leading-relaxed text-slate-700 dark:text-gray-300 sm:text-lg">
                VitaCollab gives patients and hospitals one secure system for records, approvals, and coordinated care.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="h-11 w-full min-w-[150px]">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-primary/85 transition hover:text-primary">
                  Explore the platform
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </div>
              <div className="flex flex-wrap gap-3 pt-1 text-sm">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Secure
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-teal-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Consent-led
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Encrypted
                </span>
              </div>
            </div>

            <Card className="animate-rise border-emerald-100/90 bg-white/92 shadow-[0_28px_62px_rgba(8,47,73,0.2)] ring-1 ring-white/60 backdrop-blur-md dark:border-white/10 dark:bg-slate-800/88 dark:backdrop-blur-lg dark:shadow-lg dark:shadow-emerald-500/25">
              <CardHeader>
                <CardTitle className="dark:text-white">Secure Record Flow</CardTitle>
                <CardDescription className="dark:text-gray-400">Records move through encrypted checkpoints with explicit patient consent.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-2xl border border-emerald-100/90 bg-emerald-50/65 p-4 shadow-inner dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-md">
                    <div className="absolute -left-8 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-emerald-300/30 blur-xl" />
                    <div className="absolute -right-8 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-teal-300/30 blur-xl" />
                    <div className="space-y-3">
                      {["Hospital Upload", "Patient Approval", "Shared With Specialist"].map((item, index) => (
                        <div key={item} className="flex items-center gap-3 rounded-xl border border-white bg-white px-3 py-2 shadow-sm dark:border-white/10 dark:bg-slate-800">
                          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {index + 1}
                          </span>
                          <p className="text-sm font-medium text-slate-700 dark:text-gray-200">{item}</p>
                          <span className="ml-auto h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[12px] leading-5 text-slate-500 dark:text-gray-300">Animated preview of record movement through secure and verified checkpoints.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-10 sm:mt-12 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-white/95 to-accent/10 dark:from-primary/18 dark:via-slate-900/75 dark:to-accent/16" hover={false}>
            <CardContent className="space-y-4 p-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {trustProofMetrics.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-border/70 bg-background/75 p-3 text-center dark:bg-white/5">
                    <p className="text-xl font-bold text-foreground">{item.value}</p>
                    <p className="mt-1 text-[12px] leading-5 text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-background/75 p-4 dark:bg-white/5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Trust controls</p>
                  <div className="mt-3 space-y-2.5">
                    {trustControlItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.title} className="flex gap-3 rounded-xl border border-border/65 bg-background/80 p-2.5 dark:bg-slate-900/40">
                          <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-foreground">{item.title}</p>
                            <p className="text-[12px] leading-5 text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/75 p-4 dark:bg-white/5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">System activity</p>
                  <div className="mt-3 space-y-2.5">
                    {systemActivityFeed.map((item) => (
                      <div key={`${item.label}-${item.time}`} className="flex items-center gap-3 rounded-xl border border-border/65 bg-background/80 px-3 py-2.5 dark:bg-slate-900/40">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-foreground">{item.label}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] leading-none text-muted-foreground">
                          <Clock3 className="h-3.5 w-3.5" />
                          {item.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-gradient-to-br from-white/95 via-background to-primary/8 dark:from-slate-900/80 dark:via-slate-900/70 dark:to-primary/15" hover={false}>
            <CardContent className="space-y-3 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Product snapshots</p>
              {productMiniSnapshots.map((item) => (
                <div key={item.title} className="rounded-xl border border-border/70 bg-background/72 p-3 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-[12px] leading-5 text-muted-foreground">{item.subtitle}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.points.map((point) => (
                      <span key={point} className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-24 sm:mt-28 rounded-3xl border border-border/70 bg-gradient-to-b from-white/88 to-emerald-50/35 p-6 text-center dark:from-slate-900/45 dark:to-teal-950/35">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-gray-400">Adopted by care teams</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {logos.map((logo) => (
              <div key={logo} className="rounded-xl border border-slate-200/90 bg-white/92 px-4 py-3 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:backdrop-blur-md">
                {logo}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24 sm:mt-28 rounded-3xl border border-border/70 bg-gradient-to-b from-white/92 to-cyan-50/30 p-6 dark:from-slate-900/35 dark:to-slate-900/10 sm:p-8">
          <div className="mb-8 space-y-2 text-center">
            <h2 className="heading-font text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Built for Trust-Centered Care</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground dark:text-gray-400">Designed to increase patient trust while giving hospitals operational clarity.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="animate-rise border-slate-200/85 bg-white/94 transition-transform duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-slate-800 dark:backdrop-blur-md">
                  <CardHeader>
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <CardTitle className="pt-3 text-xl dark:text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground dark:text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="premium-surface mt-24 sm:mt-28 rounded-[2rem] border border-slate-200/90 bg-white/94 px-6 py-10 shadow-[0_24px_60px_rgba(8,47,73,0.14)] ring-1 ring-white/45 dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 dark:ring-emerald-300/10 sm:px-10">
          <div className="mb-8 space-y-2 text-center">
            <h2 className="heading-font text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">How It Works</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground dark:text-gray-400">Three secure steps to get from upload to trusted care collaboration.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "Create account", description: "Create an account and complete identity verification." },
              { title: "Upload records", description: "Hospitals upload records with structured clinical context." },
              { title: "Approve & share", description: "Patients approve sharing with trusted providers." }
            ].map((step, index) => (
              <div key={step.title} className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-md">
                <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="premium-surface mt-24 sm:mt-28 rounded-[2rem] border border-primary/20 bg-gradient-to-br from-slate-950 via-teal-950 to-emerald-900 px-6 py-10 text-white shadow-[0_32px_78px_rgba(3,105,86,0.4)] ring-1 ring-emerald-300/24 sm:px-10">
          <div className="mb-8 space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-200">Security</p>
            <h2 className="heading-font text-3xl font-bold tracking-tight text-white sm:text-4xl">Healthcare Security You Can Trust</h2>
            <p className="max-w-2xl text-sm text-gray-200 sm:text-base">VitaCollab protects clinical integrity, patient rights, and compliance from day one.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {securityHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-md shadow-lg shadow-emerald-500/20">
                  <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-emerald-100">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-400">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <TestimonialsSection testimonials={testimonials} autoScroll />

        <section className="premium-surface mt-24 sm:mt-28 rounded-[2rem] border border-slate-200/90 bg-white/94 px-6 py-10 shadow-[0_24px_58px_rgba(8,47,73,0.14)] ring-1 ring-white/45 dark:border-white/10 dark:bg-slate-800/90 dark:ring-emerald-300/10 sm:px-10">
          <div className="flex flex-col gap-4 text-sm text-slate-600 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
            <p>Contact: contact@vitacollab.in</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="font-medium text-slate-700 hover:text-primary dark:text-gray-200">Contact</Link>
              <Link href="/privacy" className="font-medium text-slate-700 hover:text-primary dark:text-gray-200">Privacy Policy</Link>
              <Link href="/terms" className="font-medium text-slate-700 hover:text-primary dark:text-gray-200">Terms</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
