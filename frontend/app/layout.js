import { Inter, Poppins } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import { PageTransition } from "@/components/layout/page-transition";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AppQueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VitaCollab",
  url: "https://vitacollab.in",
  logo: "https://vitacollab.in/logo.png",
  sameAs: []
};

const headingFont = Poppins({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700"]
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

const defaultMetaTitle = "VitaCollab - Secure, Patient-Controlled Health Records";
const defaultMetaDescription =
  "VitaCollab gives patients and providers a secure, consent-driven system for sharing verified health records with full patient control.";
const defaultSocialPreviewImage = "https://vitacollab.in/og-image.png";

export const metadata = {
  metadataBase: new URL("https://vitacollab.in"),
  title: defaultMetaTitle,
  description: defaultMetaDescription,
  keywords: [
    "VitaCollab",
    "digital health records",
    "patient-controlled health system",
    "transparent healthcare platform",
    "hospital collaboration system",
    "privacy-first healthcare"
  ],
  openGraph: {
    title: defaultMetaTitle,
    description: defaultMetaDescription,
    url: "https://vitacollab.in",
    siteName: "VitaCollab",
    type: "website",
    images: [
      {
        url: defaultSocialPreviewImage,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "VitaCollab logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: defaultMetaTitle,
    description: defaultMetaDescription,
    images: [defaultSocialPreviewImage]
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
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
        <AppQueryProvider>
          <AuthProvider>
            <PageTransition>{children}</PageTransition>
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </AppQueryProvider>
      </body>
    </html>
  );
}
