import Link from "next/link";
import { Instagram, ShieldCheck } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/signup", label: "Signup" },
  { href: "/login", label: "Login" }
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
    <footer className="mt-20 border-t border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight">VitaCollab</span>
          </Link>
          <p className="body-font max-w-xs text-sm text-muted-foreground">
            Secure Digital Health Records Platform
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Quick Links</h3>
          <nav className="space-y-2 text-sm text-muted-foreground">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Contact</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Email: ankitupadhyayx@gmail.com</p>
            <p>Email: kumarpukar735@gmail.com</p>
            <p>Phone: 8938076782</p>
            <p>Hospital Verification: Contact us for onboarding</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Social</h3>
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

      <div className="border-t border-border/70">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-sm text-muted-foreground sm:px-6">
          © 2026 VitaCollab. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
