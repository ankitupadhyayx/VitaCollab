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
    title: "Digital Health Timeline",
    description: "A complete and verified timeline of reports, prescriptions, and treatment history."
  },
  {
    icon: FileLock2,
    title: "Secure Record Sharing",
    description: "Share records safely across providers with encrypted transfer and controlled visibility."
  },
  {
    icon: FileCheck2,
    title: "Approval-Based Access",
    description: "Patients approve who can access records before any cross-institution collaboration."
  },
  {
    icon: Workflow,
    title: "Real-Time Collaboration",
    description: "Hospitals, specialists, and patients coordinate quickly with live updates and alerts."
  }
];

const logos = ["Northstar Care", "MediBridge", "Clarity Health", "LifeSpring Network", "Nova Hospitals"];

const securityHighlights = [
  {
    icon: ShieldCheck,
    title: "End-to-end encrypted",
    description: "Sensitive medical data is encrypted in transit and at rest."
  },
  {
    icon: Database,
    title: "You control access",
    description: "Every sharing action is consent-based and reversible by the patient."
  },
  {
    icon: Stethoscope,
    title: "Audit logs for every action",
    description: "Every update, view, and approval is time-stamped for trust and compliance."
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

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6">
        <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-sky-50 via-white to-cyan-50 px-6 py-10 shadow-[0_24px_70px_rgba(16,72,131,0.12)] dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 sm:px-10 lg:px-12 lg:py-14">
          <div className="absolute -top-24 right-0 h-56 w-56 rounded-full bg-cyan-200/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-52 w-52 rounded-full bg-blue-200/30 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div className="space-y-6 animate-rise">
              <p className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Trusted healthcare collaboration
              </p>
              <h1 className="heading-font text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                Your Medical Records. Secure. Verified. In Your Control.
              </h1>
              <p className="body-font max-w-xl text-base leading-relaxed text-slate-600 dark:text-gray-400 sm:text-lg">
                VitaCollab helps patients and hospitals manage medical records with strong security, transparent approvals, and reliable real-time coordination.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="h-11 w-full min-w-[150px] dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 dark:shadow-lg dark:shadow-blue-500/20">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="h-11 w-full min-w-[150px] dark:border-white/10 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/20">
                    View Demo
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Secure
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Patient Controlled
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-cyan-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Encrypted
                </span>
              </div>
            </div>

            <Card className="animate-rise border-sky-100 bg-white/90 shadow-xl backdrop-blur-sm dark:border-white/10 dark:bg-slate-800/90 dark:backdrop-blur-md dark:shadow-lg dark:shadow-blue-500/20">
              <CardHeader>
                <CardTitle className="dark:text-white">Secure Health Data Flow</CardTitle>
                <CardDescription className="dark:text-gray-400">Live records move through encrypted checkpoints with explicit patient approval.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-sky-50/60 p-4 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-md">
                    <div className="absolute -left-8 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-sky-300/30 blur-xl" />
                    <div className="absolute -right-8 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-cyan-300/30 blur-xl" />
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
                  <p className="text-xs text-slate-500 dark:text-gray-400">Animated preview of record movement through secure and verified checkpoints.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-gray-400">Trusted by hospitals and patients</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {logos.map((logo) => (
              <div key={logo} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:backdrop-blur-md">
                {logo}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-8 space-y-2 text-center">
            <h2 className="heading-font text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Built For Trust-Centered Care</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground dark:text-gray-400">Purpose-built features that improve confidence for patients and operational clarity for hospitals.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="animate-rise border-slate-200/80 bg-white transition-transform duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-slate-800 dark:backdrop-blur-md">
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

        <section className="mt-16 rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-sm dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 sm:px-10">
          <div className="mb-8 space-y-2 text-center">
            <h2 className="heading-font text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">How It Works</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground dark:text-gray-400">Simple steps to start managing your records securely.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "Create account", description: "Sign up as a patient or hospital and complete verification." },
              { title: "Upload records", description: "Hospitals upload records and attach relevant metadata securely." },
              { title: "Approve & share", description: "Patients approve access and share records with trusted providers." }
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

        <section className="mt-16 rounded-3xl border border-primary/15 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-6 py-10 text-white shadow-xl sm:px-10">
          <div className="mb-8 space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-200">Security</p>
            <h2 className="heading-font text-3xl font-bold tracking-tight text-white sm:text-4xl">Healthcare Security You Can Trust</h2>
            <p className="max-w-2xl text-sm text-gray-200 sm:text-base">VitaCollab is designed to protect clinical integrity, patient rights, and regulatory compliance from day one.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {securityHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-md shadow-lg shadow-blue-500/20">
                  <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-blue-100">
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

        <section className="mt-16 rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-sm dark:border-white/10 dark:bg-slate-800 sm:px-10">
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
