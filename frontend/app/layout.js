import { Space_Grotesk, IBM_Plex_Serif } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VitaCollab",
  url: "https://vitacollab.in",
  logo: "https://vitacollab.in/logo.png",
  sameAs: []
};

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
});

const bodyFont = IBM_Plex_Serif({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

export const metadata = {
  metadataBase: new URL("https://vitacollab.in"),
  title: "VitaCollab – Transparent Digital Health Records Platform for Hospitals & Patients",
  description:
    "VitaCollab is a secure, patient-owned digital health record platform that offers a transparent and consent-driven workflow. Unlike traditional systems, patients have full control over their medical data, enabling seamless and trusted collaboration between hospitals, doctors, and patients.",
  keywords: [
    "VitaCollab",
    "digital health records",
    "patient-controlled health system",
    "transparent healthcare platform",
    "hospital collaboration system",
    "privacy-first healthcare"
  ],
  openGraph: {
    title: "VitaCollab – Transparent Digital Health Records Platform for Hospitals & Patients",
    description:
      "VitaCollab is a secure, patient-owned digital health record platform that offers a transparent and consent-driven workflow. Unlike traditional systems, patients have full control over their medical data, enabling seamless and trusted collaboration between hospitals, doctors, and patients.",
    url: "https://vitacollab.in",
    siteName: "VitaCollab",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "VitaCollab – Transparent Digital Health Records Platform for Hospitals & Patients",
    description:
      "VitaCollab is a secure, patient-owned digital health record platform that offers a transparent and consent-driven workflow. Unlike traditional systems, patients have full control over their medical data, enabling seamless and trusted collaboration between hospitals, doctors, and patients."
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg"
  },
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: "https://vitacollab.in"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable} main-shell`}>
        <Script id="organization-jsonld" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(organizationSchema)}
        </Script>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
