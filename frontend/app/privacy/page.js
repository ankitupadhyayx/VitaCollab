import { EyeOff, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageIntro } from "@/components/ui/page-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Privacy Policy | VitaCollab",
  description: "VitaCollab privacy policy and patient data handling principles.",
  alternates: {
    canonical: "https://vitacollab.in/privacy"
  }
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-10 px-4 pb-20 pt-16 sm:px-6">
        <PageIntro
          badge="Privacy Policy"
          title="Your data, your consent, your control"
          description="VitaCollab follows privacy-first standards to ensure patient-controlled access and transparent record sharing."
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Privacy Commitments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>VitaCollab is a patient-controlled healthcare data platform.</p>
            <p>We collect personal and medical information to provide secure storage and sharing of healthcare records.</p>
            <p>We do not sell or misuse user data.</p>
            <p className="flex items-start gap-2">
              <EyeOff className="mt-0.5 h-4 w-4 text-primary" />
              Access to records is permission-based and visible through consent workflows.
            </p>
            <p>Data usage and sharing patterns are documented through auditable events.</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
