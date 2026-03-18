import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

      <main className="mx-auto max-w-4xl space-y-8 px-4 pb-16 pt-14 sm:px-6">
        <section className="space-y-4 animate-rise">
          <p className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Contact VitaCollab
          </p>
          <h1 className="heading-font text-4xl font-bold tracking-tight sm:text-5xl">Let us help your care team move faster</h1>
          <p className="body-font text-muted-foreground">
            Share your question and the VitaCollab team will get back to you.
          </p>
        </section>

        <Card className="animate-rise">
          <CardHeader>
            <CardTitle>Send a message</CardTitle>
            <CardDescription>
              You can also email us directly at <Link className="font-semibold text-primary" href="mailto:ankitupadhyayx@gmail.com">ankitupadhyayx@gmail.com</Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action="mailto:ankitupadhyayx@gmail.com" method="post" encType="text/plain" className="space-y-4">
              <Input name="name" placeholder="Your name" required />
              <Input type="email" name="email" placeholder="Your email" required />
              <Textarea name="message" placeholder="Write your message" rows={6} required />
              <Button type="submit">Send Message</Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
