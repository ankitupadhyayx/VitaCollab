import { Building2, Link2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Integrations | VitaCollab",
  description: "Connect VitaCollab with healthcare systems and workflows.",
  alternates: {
    canonical: "https://vitacollab.in/integrations"
  }
};

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-10 px-4 pb-20 pt-16 sm:px-6">
        <section className="space-y-5 animate-rise">
          <p className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Integrations
          </p>
          <h1 className="heading-font text-4xl font-bold tracking-tight sm:text-5xl">Integrate VitaCollab with your healthcare ecosystem</h1>
          <p className="max-w-3xl text-muted-foreground">
            Unify hospital and patient workflows by integrating with existing systems, portals, and verification flows.
          </p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Integration Readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <Building2 className="mt-0.5 h-4 w-4 text-primary" />
              Works with multi-hospital and multi-role collaboration models.
            </p>
            <p>Custom integration support is available through our onboarding team.</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
