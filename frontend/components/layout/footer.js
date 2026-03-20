import Link from "next/link";
import { Instagram, ShieldCheck } from "lucide-react";

const productLinks = [
  { href: "/features", label: "Features" },
  { href: "/blog", label: "Blog" },
  { href: "/signup", label: "Get Started" },
  { href: "/login", label: "Sign In" }
];

const companyLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

const socialLinks = [
  {
    href: "https://www.instagram.com/ankitupadhya.y/",
    label: "Instagram (Personal)"
  },
  {
    href: "https://www.instagram.com/vitacollab/",
    label: "Instagram (Brand)"
  }
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/70 bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight">VitaCollab</span>
          </Link>

          <p className="body-font max-w-sm text-sm leading-relaxed text-muted-foreground">
            Transparent, patient-owned digital health records for trusted collaboration between hospitals, doctors, and patients.
          </p>

          <p className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Privacy-first healthcare platform
          </p>
        </div>

        <div className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground">Product</h3>
          <nav className="space-y-2 text-sm text-muted-foreground">
            {productLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block transition-colors hover:text-primary">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground">Company</h3>
          <nav className="space-y-2 text-sm text-muted-foreground">
            {companyLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block transition-colors hover:text-primary">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="space-y-3 lg:col-span-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Contact</h3>
          <div className="hidden space-y-2 text-sm text-muted-foreground md:block">
            <p>
              Contact: <Link href="/contact" className="font-medium text-foreground transition-colors hover:text-primary">contact@vitacollab.in</Link>
            </p>
            <p>
              Support: <Link href="/contact" className="font-medium text-foreground transition-colors hover:text-primary">support@vitacollab.in</Link>
            </p>
            <p>
              Owner: <Link href="/contact" className="font-medium text-foreground transition-colors hover:text-primary">ankitupadhyay@vitacollab.in</Link>
            </p>
            <p>
  WhatsApp:{" "}
  <a
    href="https://wa.me/918938076782"
    target="_blank" className="font-medium text-foreground transition-colors hover:text-primary"> Chat on WhatsApp
  </a>
</p>
<p>
  WhatsApp:{" "}
  <a
    href="https://wa.me/919334134617"
    target="_blank" className="font-medium text-foreground transition-colors hover:text-primary"> Chat on WhatsApp
  </a>
</p>
            
            <p className="pt-1 text-xs text-muted-foreground">We typically respond within 24 hours.</p>
            <p className="text-xs text-muted-foreground">Hospital verification and onboarding support available.</p>
          </div>

          <details className="rounded-xl border border-border/70 bg-background/50 p-3 text-sm text-muted-foreground md:hidden">
            <summary className="cursor-pointer list-none font-semibold text-foreground">Contact Info</summary>
            <div className="mt-3 space-y-2">
              <p>
                Contact: <Link href="/contact" className="font-medium text-foreground transition-colors hover:text-primary">contact@vitacollab.in</Link>
              </p>
              <p>
                Support: <Link href="/contact" className="font-medium text-foreground transition-colors hover:text-primary">support@vitacollab.in</Link>
              </p>
              <p>
                Owner: <Link href="/contact" className="font-medium text-foreground transition-colors hover:text-primary">ankitupadhyay@vitacollab.in</Link>
              </p>
              <p>
  WhatsApp:{" "}
  <a
    href="https://wa.me/918938076782"
    target="_blank" className="font-medium text-foreground transition-colors hover:text-primary"> Chat on WhatsApp
  </a>
</p>
<p></p>
            </div>
          </details>

          <div className="pt-2">
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground">Social</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-primary"
                >
                  <Instagram className="h-4 w-4" />
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-center text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 VitaCollab. All rights reserved.</p>
          <p>Built to make healthcare records transparent, secure, and patient-owned.</p>
        </div>
      </div>
    </footer>
  );
}
