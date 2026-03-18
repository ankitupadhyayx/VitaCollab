import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "What Is a Digital Health Record? - VitaCollab Guide",
  description:
    "Learn what a digital health record is, its benefits in India, and why VitaCollab helps patients and hospitals collaborate securely.",
  alternates: {
    canonical: "https://vitacollab.in/blog/what-is-digital-health-record"
  }
};

export default function DigitalHealthRecordBlogPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-3xl space-y-8 px-4 pb-16 pt-14 sm:px-6">
        <header className="space-y-4 animate-rise">
          <p className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            VitaCollab Blog
          </p>
          <h1 className="heading-font text-4xl font-bold tracking-tight sm:text-5xl">
            What Is a Digital Health Record and Why It Matters in India
          </h1>
          <p className="body-font text-muted-foreground">
            A practical look at digital records, patient trust, and secure healthcare collaboration.
          </p>
        </header>

        <article className="space-y-6 animate-rise">
          <Card>
            <CardContent className="space-y-4 p-6 leading-relaxed text-muted-foreground">
              <p>
                A digital health record is an electronic version of a patient&rsquo;s medical history, including prescriptions, lab reports, diagnosis notes, and treatment updates. Unlike paper files, digital records are easier to store, share, and verify when patients move between hospitals and specialists.
              </p>
              <p>
                In India, digital health records can reduce repeated tests, improve diagnosis speed, and help families manage long-term care better. They are especially useful when patients need treatment across multiple cities or institutions.
              </p>
              <p>
                The biggest challenge is trust. Patients want control over who can view their data, and hospitals need a secure workflow that supports compliance. This is where VitaCollab matters.
              </p>
              <p>
                VitaCollab combines patient-owned consent controls with secure hospital collaboration. Patients approve access, providers get verified information, and everyone benefits from a clearer, safer record timeline.
              </p>
              <p>
                As healthcare in India becomes more connected, digital health records are not optional, they are foundational. Platforms like VitaCollab can help make this shift both practical and trustworthy.
              </p>
            </CardContent>
          </Card>
        </article>

        <nav className="flex flex-wrap gap-3">
          <Link href="/blog" className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            Back to Blog
          </Link>
          <Link href="/" className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            Back to Homepage
          </Link>
        </nav>
      </main>

      <Footer />
    </div>
  );
}
