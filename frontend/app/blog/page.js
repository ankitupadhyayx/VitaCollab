import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "VitaCollab Blog – Digital Health Insights & Trends",
  description:
    "Read VitaCollab blog insights on patient-owned records, transparent workflows, consent-based data sharing, and privacy-first healthcare collaboration.",
  alternates: {
    canonical: "https://vitacollab.in/blog"
  }
};

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-5xl space-y-8 px-4 pb-16 pt-14 sm:px-6">
        <section className="space-y-4 animate-rise">
          <p className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            VitaCollab Blog
          </p>
          <h1 className="heading-font text-4xl font-bold tracking-tight sm:text-5xl">
            Insights on digital health records and healthcare trust
          </h1>
          <p className="body-font text-muted-foreground">
            Practical articles for patients, providers, and healthcare operators.
          </p>
        </section>

        <section>
          <Card className="animate-rise transition-transform duration-300 hover:-translate-y-1">
            <CardHeader>
              <CardTitle>What Is a Digital Health Record and Why It Matters in India</CardTitle>
              <CardDescription>
                Understand digital health records, key benefits, and how VitaCollab supports secure collaboration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/blog/what-is-digital-health-record">
                <Button>
                  Read Article
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
