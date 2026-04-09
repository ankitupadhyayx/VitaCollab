import Image from "next/image";
import Link from "next/link";
import { Instagram, Linkedin } from "lucide-react";

const productLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/integrations", label: "Integrations" },
  { href: "/api", label: "API Access" },
  { href: "/security", label: "Security" }
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/careers", label: "Careers" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" }
];

const resourceLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/docs", label: "Documentation" },
  { href: "/contact", label: "Help Center" },
  { href: "/disclaimer", label: "Medical Disclaimer" }
];

const socialLinks = [
  {
    href: "https://www.instagram.com/vitacollab/",
    label: "Instagram",
    subtitle: "VitaCollab",
    icon: Instagram
  },
  {
    href: "https://www.linkedin.com/in/ankit-upadhyay-3a6b66288/",
    label: "LinkedIn",
    subtitle: "Founder",
    icon: Linkedin
  },
  {
    href: "https://www.linkedin.com/company/vitacollab/",
    label: "LinkedIn",
    subtitle: "VitaCollab",
    icon: Linkedin
  }
];

const trustBadges = [
  "HIPAA Ready",
  "End-to-End Encrypted",
  "Patient Controlled",
  "Access Anywhere",
  "Paperless Healthcare"
];

const navLinkClass =
  "block text-sm text-slate-600 transition-all duration-200 hover:text-primary dark:text-gray-400";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-gray-50 px-6 py-16 dark:border-white/10 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-center gap-3 border-b border-slate-200 pb-8 dark:border-white/10">
          {trustBadges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shadow-[0_0_22px_rgba(16,185,129,0.15)] transition-transform duration-200 hover:scale-105"
            >
              {badge}
            </span>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/15 dark:bg-slate-900/70">
                <Image src="/logo.png" alt="VitaCollab logo" width={32} height={32} className="h-8 w-8 object-contain" />
              </span>
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">VitaCollab</span>
            </Link>

            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-gray-400">
              VitaCollab is a secure, patient-controlled healthcare data platform enabling seamless collaboration between hospitals and patients.
            </p>
            <ul className="mt-4 space-y-1 text-xs text-slate-600 dark:text-gray-300">
              <li>Data encrypted end-to-end</li>
              <li>No data shared without consent</li>
              <li>Access anytime, anywhere</li>
            </ul>
            <p className="mt-4 inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Trusted by hospitals & patients
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">Product</h3>
            <nav className="space-y-2">
              {productLinks.map((link) => (
                <Link key={link.href} href={link.href} className={navLinkClass}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">Company</h3>
            <nav className="space-y-2">
              {companyLinks.map((link) => (
                <Link key={link.href} href={link.href} className={navLinkClass}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">Resources</h3>
            <nav className="space-y-2">
              {resourceLinks.map((link) => (
                <Link key={link.href} href={link.href} className={navLinkClass}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">Contact</h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-gray-400">
              <a href="mailto:contact@vitacollab.in" className="block transition-all duration-200 hover:text-primary">
                contact@vitacollab.in
              </a>
              <a href="mailto:support@vitacollab.in" className="block transition-all duration-200 hover:text-primary">
                support@vitacollab.in
              </a>
              <p className="text-xs text-slate-500 dark:text-gray-300">Response within 24 hours</p>
            </div>

            <a
              href="https://wa.me/918938076782"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-green-600"
            >
              Chat on WhatsApp
            </a>

            <div className="mt-5">
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">Social</h4>
              <div className="space-y-2">
                {socialLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-slate-600 transition-all duration-200 hover:scale-[1.03] hover:text-primary dark:text-gray-400"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{link.label}</span>
                      <span className="text-xs text-slate-400 dark:text-gray-300">{link.subtitle}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 dark:border-white/10">
          <p className="mb-3 text-center text-xs text-gray-400">
            VitaCollab is a technology platform and does not provide medical advice. Always consult a qualified healthcare professional.
          </p>
          <p className="text-center text-sm text-slate-600 dark:text-gray-400">© 2026 VitaCollab. All rights reserved. Built in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}
