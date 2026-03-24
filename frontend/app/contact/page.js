import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ContactForm } from "@/components/contact/contact-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Contact – VitaCollab",
  description:
    "Contact VitaCollab for product support, partnerships, and hospital onboarding for our secure digital health records platform.",
  alternates: {
    canonical: "https://vitacollab.in/contact"
  }
};

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-4xl space-y-7 px-4 pb-28 pt-12 sm:space-y-8 sm:px-6 sm:pt-14 lg:pb-16">
        <section className="space-y-4 animate-rise">
          <p className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Contact VitaCollab
          </p>
          <h1 className="heading-font text-3xl font-bold tracking-tight sm:text-5xl">Let us help your care team move faster</h1>
          <p className="body-font text-sm leading-relaxed text-muted-foreground sm:text-base">
            Share your question and the VitaCollab team will get back to you.
          </p>
        </section>

        <Card className="animate-rise">
          <CardHeader>
            <CardTitle>Send a message</CardTitle>
            <CardDescription>
              Use this secure contact form for support and partnerships. Direct support inbox: ankitupadhyay@vitacollab.in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
