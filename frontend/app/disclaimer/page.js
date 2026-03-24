import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageIntro } from "@/components/ui/page-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Medical Disclaimer | VitaCollab",
  description: "Medical disclaimer for VitaCollab platform usage.",
  alternates: {
    canonical: "https://vitacollab.in/disclaimer"
  }
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-10 px-4 pb-20 pt-16 sm:px-6">
        <PageIntro
          badge="Medical Disclaimer"
          title="Technology platform, not medical advice"
          description="VitaCollab facilitates secure health data collaboration but does not replace professional medical consultation."
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Important Notice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-primary" />
              VitaCollab is a technology platform and does not provide medical advice, diagnosis, or treatment.
            </p>
            <p>Always consult a qualified healthcare professional for medical decisions, emergencies, and treatment plans.</p>
            <p>Use of the platform does not create a doctor-patient relationship with VitaCollab.</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
