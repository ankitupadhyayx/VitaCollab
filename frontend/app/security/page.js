import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Security | VitaCollab",
  description: "Learn about VitaCollab security, encryption, and access controls.",
  alternates: {
    canonical: "https://vitacollab.in/security"
  }
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-10 px-4 pb-20 pt-16 sm:px-6">
        <section className="space-y-5 animate-rise">
          <p className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Security
          </p>
          <h1 className="heading-font text-4xl font-bold tracking-tight sm:text-5xl">Security-first by design</h1>
          <p className="max-w-3xl text-muted-foreground">
            VitaCollab is built around encrypted data transfer, consent-aware access controls, and audit-ready workflows.
          </p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Core Security Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <LockKeyhole className="mt-0.5 h-4 w-4 text-primary" />
              End-to-end encrypted record movement and role-based access governance.
            </p>
            <p>Continuous monitoring and traceable audit events across key record operations.</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
