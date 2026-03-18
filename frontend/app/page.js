import Link from "next/link";
import { ArrowRight, CheckCircle2, HeartPulse, LockKeyhole, Orbit } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  FinalCtaSection,
  HospitalsSection,
  PatientsSection,
  TestimonialsSection,
  TrustSecuritySection
} from "@/components/landing/sections";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: HeartPulse,
    title: "Verified Health Timeline",
    description: "A transparent patient-controlled feed of prescriptions, reports, and hospital updates."
  },
  {
    icon: LockKeyhole,
    title: "Consent-First Record Access",
    description: "Every new record requires patient approval before cross-hospital visibility."
  },
  {
    icon: Orbit,
    title: "Cross-Institution Collaboration",
    description: "Specialists and hospitals access approved records from a single secure source."
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6">
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-6 animate-rise">
            <p className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Patient-owned digital health records
            </p>
            <h1 className="heading-font text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Secure healthcare collaboration without losing patient trust
            </h1>
            <p className="body-font max-w-xl text-base leading-relaxed text-muted-foreground">
              VitaCollab unifies hospitals, clinicians, and patients around a verified, consent-driven medical timeline built for privacy-first care delivery.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/signup">
                <Button size="lg" className="animate-pulseGlow">
                  Start Free Pilot
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary" size="lg">View Product</Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-success" />AES-256 protected</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-success" />Consent workflow</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-success" />Audit-ready architecture</span>
            </div>
          </div>

          <Card className="animate-rise border-primary/20 bg-gradient-to-br from-white via-white to-primary/5">
            <CardHeader>
              <CardTitle>Live Health Feed Preview</CardTitle>
              <CardDescription>Pending approvals and trusted updates in one timeline.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Lab report uploaded by Nova Hospital", "Prescription approved by patient", "Appointment reminder generated"].map((item) => (
                <div key={item} className="rounded-xl border border-border/80 bg-background/70 px-3 py-2 text-sm">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="animate-rise transition-transform duration-300 hover:-translate-y-1">
                <CardHeader>
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <CardTitle className="pt-3 text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <TrustSecuritySection />
        <HospitalsSection />
        <PatientsSection />
        <TestimonialsSection />
        <FinalCtaSection />
      </main>

      <Footer />
    </div>
  );
}
