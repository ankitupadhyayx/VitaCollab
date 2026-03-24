import { Headset, LifeBuoy, MessageSquareText } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageIntro, SectionHeading } from "@/components/ui/page-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Help Center | VitaCollab",
  description: "Get support, onboarding guidance, and FAQs for VitaCollab.",
  alternates: {
    canonical: "https://vitacollab.in/help"
  }
};

const faqs = [
  {
    q: "How do I share my records with a hospital?",
    a: "Use your dashboard to choose records, approve access, and share with the intended hospital account."
  },
  {
    q: "Can I revoke record access after sharing?",
    a: "Yes. Access can be reviewed and revoked through consent controls in your profile and sharing settings."
  },
  {
    q: "What should I do if I cannot access my account?",
    a: "Use the reset password flow first. If the issue continues, contact support@vitacollab.in for manual assistance."
  },
  {
    q: "How quickly does support respond?",
    a: "We aim to respond quickly, usually within 24 hours for general requests."
  }
];

export default function HelpPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-8 px-4 pb-28 pt-12 sm:space-y-10 sm:px-6 sm:pt-16 lg:pb-20">
        <PageIntro
          badge="Help Center"
          title="Support for patients, hospitals, and admins"
          description="Find guidance for account setup, collaboration workflows, and healthcare data sharing inside VitaCollab."
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headset className="h-5 w-5 text-primary" />
              Support Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <LifeBuoy className="mt-0.5 h-4 w-4 text-primary" />
              Reach support for onboarding, record access issues, and collaboration troubleshooting.
            </p>
            <p>For urgent requests, contact support@vitacollab.in and our team will respond promptly.</p>
          </CardContent>
        </Card>

        <section className="space-y-5">
          <SectionHeading title="Frequently Asked Questions" />
          <div className="grid gap-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="rounded-xl border border-border/70 bg-background/50 p-4">
                <summary className="cursor-pointer list-none py-1 text-base font-semibold text-foreground">{faq.q}</summary>
                <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-primary" />
              Need custom onboarding help?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            If you are onboarding a hospital team, include your institution name and use-case details in your email so we can guide setup faster.
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
