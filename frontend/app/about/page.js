import { ShieldCheck, Users, Building2, Stethoscope } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "About VitaCollab – Transparent Digital Health Platform",
  description:
    "Learn how VitaCollab delivers patient-owned records, transparent workflows, consent-based data sharing, and privacy-first architecture for trusted healthcare collaboration.",
  alternates: {
    canonical: "https://vitacollab.in/about"
  }
};

const pillars = [
  {
    icon: Users,
    title: "For Patients",
    text: "Patients own their records, control access, and monitor every update in one secure timeline."
  },
  {
    icon: Stethoscope,
    title: "For Doctors",
    text: "Clinicians can access trusted, consent-approved data faster to improve treatment decisions."
  },
  {
    icon: Building2,
    title: "For Hospitals",
    text: "Hospitals coordinate care across departments and partner institutions with audit-ready workflows."
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-12 px-4 pb-16 pt-14 sm:px-6">
        <section className="space-y-5 animate-rise">
          <p className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            About VitaCollab
          </p>
          <h1 className="heading-font text-4xl font-bold tracking-tight sm:text-5xl">
            Building patient-owned digital health records for trusted care collaboration
          </h1>
          <p className="body-font max-w-3xl text-muted-foreground">
            VitaCollab is a privacy-first healthcare SaaS platform designed to connect patients, doctors, and hospitals around verified records and consent-driven data access.
          </p>
        </section>

        <section className="space-y-4 animate-rise">
          <h2 className="heading-font text-2xl font-bold tracking-tight sm:text-3xl">Our Mission</h2>
          <Card>
            <CardContent className="p-6">
              <p className="body-font leading-relaxed text-muted-foreground">
                Our mission is to make healthcare records secure, portable, and truly patient-controlled. We believe trust and transparency are essential for better clinical outcomes and better patient experiences.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-5">
          <h2 className="heading-font text-2xl font-bold tracking-tight sm:text-3xl">How VitaCollab Helps</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Card key={pillar.title} className="animate-rise transition-transform duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <CardTitle className="pt-3 text-xl">{pillar.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{pillar.text}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="animate-rise">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-white to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Why trust VitaCollab
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="body-font leading-relaxed text-muted-foreground">
                VitaCollab is built with privacy-first architecture, consent workflows, and a strong audit trail to help healthcare ecosystems collaborate without sacrificing patient trust.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
