import { FileText, Scale } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageIntro } from "@/components/ui/page-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Terms of Service | VitaCollab",
  description: "Read VitaCollab terms of service for platform usage and responsibilities.",
  alternates: {
    canonical: "https://vitacollab.in/terms"
  }
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-10 px-4 pb-20 pt-16 sm:px-6">
        <PageIntro
          badge="Terms of Service"
          title="Clear terms for secure healthcare collaboration"
          description="These terms define usage rights, responsibilities, and service boundaries for VitaCollab participants."
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Terms Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 text-primary" />
              Users and institutions are expected to comply with applicable healthcare data standards.
            </p>
            <p>Service updates and policy revisions are published with clear effective dates.</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
