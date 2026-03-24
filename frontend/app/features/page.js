import { LockKeyhole, Users, Building2, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Features – VitaCollab Secure Healthcare Platform",
  description:
    "Explore VitaCollab features: patient-owned records, transparent and consent-based data sharing, hospital collaboration, and privacy-first architecture.",
  alternates: {
    canonical: "https://vitacollab.in/features"
  }
};

const features = [
  {
    icon: Users,
    title: "Patient-controlled records",
    description: "Patients own their health timeline and approve access with explicit consent workflows."
  },
  {
    icon: LockKeyhole,
    title: "Secure data sharing",
    description: "Records are shared only through permissioned access designed for healthcare trust and compliance."
  },
  {
    icon: Building2,
    title: "Hospital collaboration",
    description: "Hospitals and clinicians collaborate faster through a unified, verified record timeline."
  },
  {
    icon: ShieldCheck,
    title: "Privacy-first architecture",
    description: "VitaCollab is designed with encryption, auditability, and patient-first privacy principles."
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-8 px-4 pb-28 pt-12 sm:space-y-10 sm:px-6 sm:pt-14 lg:pb-16">
        <section className="space-y-5 animate-rise">
          <p className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            VitaCollab Features
          </p>
          <h1 className="heading-font text-3xl font-bold tracking-tight sm:text-5xl">
            Everything healthcare teams need to collaborate securely
          </h1>
          <p className="body-font max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            VitaCollab combines patient ownership, clinical collaboration, and enterprise-grade privacy into one digital health records platform.
          </p>
        </section>

        <section>
          <div className="grid gap-4 md:grid-cols-2">
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
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
