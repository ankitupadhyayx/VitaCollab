import { Braces, TerminalSquare } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "API Access | VitaCollab",
  description: "Explore VitaCollab API access and integration pathways.",
  alternates: {
    canonical: "https://vitacollab.in/api"
  }
};

export default function ApiAccessPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-10 px-4 pb-20 pt-16 sm:px-6">
        <section className="space-y-5 animate-rise">
          <p className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            API Access
          </p>
          <h1 className="heading-font text-4xl font-bold tracking-tight sm:text-5xl">Developer-ready access for secure healthcare workflows</h1>
          <p className="max-w-3xl text-muted-foreground">
            Build integrations with VitaCollab using controlled APIs designed around patient consent and audit transparency.
          </p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Braces className="h-5 w-5 text-primary" />
              API Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <TerminalSquare className="mt-0.5 h-4 w-4 text-primary" />
              Authenticated endpoints for user onboarding, record sharing, and collaboration events.
            </p>
            <p>Contact our team to request sandbox access and integration guidance.</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
