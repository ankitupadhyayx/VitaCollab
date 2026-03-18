import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileLock2,
  Fingerprint,
  Handshake,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  UserRound
} from "lucide-react";

function SectionShell({ eyebrow, title, description, children, className = "" }) {
  return (
    <section className={`mt-16 space-y-8 ${className}`.trim()}>
      <div className="space-y-3 animate-rise">
        {eyebrow ? (
          <p className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="heading-font text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        {description ? <p className="body-font max-w-3xl text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function TrustSecuritySection() {
  const trustItems = [
    {
      icon: FileLock2,
      title: "End-to-end encryption (AES-256)",
      description: "Data is encrypted in transit and at rest to protect every medical update."
    },
    {
      icon: Fingerprint,
      title: "Patient-controlled access",
      description: "Patients approve record visibility before cross-hospital sharing."
    },
    {
      icon: ClipboardCheck,
      title: "Audit-ready logs",
      description: "Critical actions are traceable for compliance and governance workflows."
    }
  ];

  return (
    <SectionShell
      eyebrow="Trust Layer"
      title="Built for Security & Compliance"
      description="Designed for modern healthcare teams that need speed without compromising privacy."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {trustItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="animate-rise transition-transform duration-300 hover:-translate-y-1">
              <CardHeader>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <CardTitle className="pt-3 text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </SectionShell>
  );
}

export function HospitalsSection() {
  return (
    <SectionShell
      eyebrow="Provider Workflow"
      title="For Hospitals & Clinics"
      description="Streamline the operational path from submission to patient consent with healthcare-native collaboration."
    >
      <Card className="animate-rise border-primary/20 bg-gradient-to-r from-primary/5 via-white to-primary/10">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/80 bg-background/70 p-4 text-sm">
                <Building2 className="mb-2 h-5 w-5 text-primary" />
                Seamless patient data access
              </div>
              <div className="rounded-xl border border-border/80 bg-background/70 p-4 text-sm">
                <Handshake className="mb-2 h-5 w-5 text-primary" />
                Faster approvals
              </div>
              <div className="rounded-xl border border-border/80 bg-background/70 p-4 text-sm">
                <ShieldCheck className="mb-2 h-5 w-5 text-primary" />
                Secure collaboration
              </div>
            </div>
          </div>
          <Link href="mailto:ankitupadhyayx@gmail.com?subject=Hospital%20Verification%20Request">
            <Button size="lg" className="w-full md:w-auto">
              Request Hospital Verification
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </SectionShell>
  );
}

export function PatientsSection() {
  const patientPoints = [
    "Own your medical records",
    "Approve every update",
    "Track your health timeline"
  ];

  return (
    <SectionShell
      eyebrow="Patient Control"
      title="For Patients"
      description="VitaCollab gives you full visibility and decision power over your healthcare record flow."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {patientPoints.map((point) => (
          <Card key={point} className="animate-rise transition-transform duration-300 hover:-translate-y-1">
            <CardHeader>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-success/15 text-success">
                <HeartPulse className="h-5 w-5" />
              </span>
              <CardTitle className="pt-3 text-xl">{point}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Clear activity history and secure consent checkpoints across your care journey.
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Dr. Aditi Sharma",
      role: "Consultant Physician, Delhi",
      feedback: "The approval workflow has reduced callback delays and gives our team high confidence in record authenticity.",
      icon: Stethoscope
    },
    {
      name: "Rohit Verma",
      role: "Patient, Lucknow",
      feedback: "I can see every update and approve sharing instantly. It finally feels like my records belong to me.",
      icon: UserRound
    },
    {
      name: "Dr. Neha Iyer",
      role: "Cardiology Specialist, Bengaluru",
      feedback: "Cross-hospital collaboration is faster and much cleaner, especially when urgent treatment history is needed.",
      icon: Stethoscope
    }
  ];

  return (
    <SectionShell
      eyebrow="Proof of Impact"
      title="Trusted by Care Teams and Patients"
      description="Early users report stronger coordination, better trust signals, and faster clinical handoffs."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {testimonials.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.name} className="animate-rise transition-transform duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <CardDescription>{item.role}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">"{item.feedback}"</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </SectionShell>
  );
}

export function FinalCtaSection() {
  return (
    <section className="mt-16">
      <Card className="animate-rise border-primary/20 bg-gradient-to-br from-primary/10 via-white to-primary/5 text-center">
        <CardContent className="space-y-6 py-14">
          <h2 className="heading-font text-3xl font-bold tracking-tight sm:text-4xl">
            Start Your Secure Health Journey Today
          </h2>
          <p className="body-font mx-auto max-w-2xl text-muted-foreground">
            Join VitaCollab to simplify hospital collaboration while keeping patient trust and control at the center.
          </p>
          <Link href="/signup">
            <Button size="lg" className="animate-pulseGlow">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}

export function QuickBenefitsBar() {
  const benefits = [
    "AES-256 protected",
    "Consent workflow",
    "Audit-ready architecture"
  ];

  return (
    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
      {benefits.map((item) => (
        <span key={item} className="flex items-center gap-1">
          <CheckCircle2 className="h-4 w-4 text-success" />
          {item}
        </span>
      ))}
    </div>
  );
}
