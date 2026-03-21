import Link from "next/link";
import { BriefcaseBusiness, Sparkles, Target, UsersRound } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { PageIntro, SectionHeading } from "@/components/ui/page-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Careers | VitaCollab",
  description: "Join VitaCollab's mission to build the future of healthcare, with transparent updates on hiring plans.",
  alternates: {
    canonical: "https://vitacollab.in/careers"
  }
};

const futureRoles = [
  "Backend Developer (Java + Spring Boot)",
  "Frontend Developer (React)",
  "ML Engineer (Healthcare AI)"
];

const cultureValues = [
  {
    title: "Innovation",
    description: "We solve healthcare collaboration problems with practical, high-trust product thinking.",
    icon: Sparkles
  },
  {
    title: "Ownership",
    description: "Everyone contributes directly to outcomes, quality, and long-term reliability.",
    icon: BriefcaseBusiness
  },
  {
    title: "Impact",
    description: "Our work helps hospitals and patients collaborate with greater transparency and speed.",
    icon: Target
  }
];

export default function CareersPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-10 px-4 pb-20 pt-16 sm:px-6">
        <PageIntro
          badge="Careers"
          title="Join VitaCollab — Build the future of healthcare"
          description="We&rsquo;re currently a small, focused team building the foundation of VitaCollab. While we are not hiring at the moment, we&rsquo;re always excited to connect with passionate individuals."
        />

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersRound className="h-5 w-5 text-primary" />
              We will be hiring soon for:
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {futureRoles.map((role) => (
              <p key={role} className="flex items-start gap-2">
                <BriefcaseBusiness className="mt-0.5 h-4 w-4 text-primary" />
                <span>{role}</span>
              </p>
            ))}
          </CardContent>
        </Card>

        <section className="space-y-5">
          <SectionHeading title="Interested in working with us?" />
          <Link href="mailto:ankitupadhyayx@gmail.com">
            <Button className="h-11 px-6">Send your profile</Button>
          </Link>
        </section>

        <section className="space-y-5">
          <SectionHeading title="Culture" />
          <div className="grid gap-4 md:grid-cols-3">
            {cultureValues.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="transition-transform duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Icon className="h-5 w-5 text-primary" />
                      {value.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <p className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
            Early contributors may get priority when we start hiring.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
