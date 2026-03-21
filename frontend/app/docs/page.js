import { BookOpen, FileCode2, KeyRound, ServerCog } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageIntro, SectionHeading } from "@/components/ui/page-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Documentation | VitaCollab",
  description: "Technical, product, and API reference documentation for VitaCollab.",
  alternates: {
    canonical: "https://vitacollab.in/docs"
  }
};

const apiRefs = [
  {
    endpoint: "POST /api/auth/login",
    purpose: "Authenticate a user and receive an access token."
  },
  {
    endpoint: "GET /api/users/profile",
    purpose: "Fetch the authenticated user profile and role details."
  },
  {
    endpoint: "GET /api/records",
    purpose: "List accessible medical records for the current user context."
  },
  {
    endpoint: "POST /api/records",
    purpose: "Upload a new record with metadata and ownership context."
  }
];

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-10 px-4 pb-20 pt-16 sm:px-6">
        <PageIntro
          badge="Documentation"
          title="Product and developer documentation"
          description="Explore setup guides, operational workflows, and integration references for working with VitaCollab."
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Docs Coverage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <FileCode2 className="mt-0.5 h-4 w-4 text-primary" />
              Includes platform usage guides and API-oriented implementation notes.
            </p>
            <p>More detailed architecture and compliance docs can be shared through onboarding.</p>
          </CardContent>
        </Card>

        <section className="space-y-5">
          <SectionHeading title="API References" />
          <div className="grid gap-3">
            {apiRefs.map((item) => (
              <Card key={item.endpoint}>
                <CardContent className="space-y-2 p-4">
                  <p className="font-mono text-sm text-foreground">{item.endpoint}</p>
                  <p className="text-sm text-muted-foreground">{item.purpose}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              Authentication Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <ServerCog className="mt-0.5 h-4 w-4 text-primary" />
              Protected endpoints require valid authentication and role-aware authorization.
            </p>
            <p>Use secure token storage and rotate credentials as part of deployment hygiene.</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
