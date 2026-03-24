import Link from "next/link";
import { BadgeIndianRupee, CheckCircle2, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { PageIntro, SectionHeading } from "@/components/ui/page-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Pricing | VitaCollab",
  description: "Simple and transparent pricing for VitaCollab with free early access.",
  alternates: {
    canonical: "https://vitacollab.in/pricing"
  }
};

const freePlanFeatures = [
  "Secure medical record storage",
  "Patient-controlled access",
  "Basic sharing with hospitals",
  "Encrypted data flow"
];

const comingSoonPlans = [
  {
    title: "Pro Plan",
    features: ["Advanced analytics", "Priority support", "Extended storage"]
  },
  {
    title: "Enterprise",
    features: ["Hospital integrations", "Dedicated support", "Custom APIs"]
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-8 px-4 pb-28 pt-12 sm:space-y-10 sm:px-6 sm:pt-16 lg:pb-20">
        <PageIntro
          badge="Pricing"
          title="Simple, Transparent Pricing"
          description="Built for trust from day one, with no hidden costs during our early access stage."
        />

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeIndianRupee className="h-5 w-5 text-primary" />
              Free Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-3xl font-bold text-foreground">₹0</p>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Early Access
              </span>
            </div>

            {freePlanFeatures.map((feature) => (
              <p key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <span>{feature}</span>
              </p>
            ))}

            <Link href="/signup" className="block pt-1 sm:inline-flex">
              <Button className="h-11 w-full sm:w-auto">Get Started Free</Button>
            </Link>
          </CardContent>
        </Card>

        <section className="space-y-5">
          <SectionHeading title="Future Plans (Coming Soon)" />
          <div className="grid gap-4 md:grid-cols-2">
            {comingSoonPlans.map((plan) => (
              <Card key={plan.title}>
                <CardHeader>
                  <CardTitle>{plan.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {plan.features.map((feature) => (
                    <p key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <p className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
          We are currently free to use as we build and improve VitaCollab.
        </p>
      </main>
      <Footer />
    </div>
  );
}
