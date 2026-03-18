import { Space_Grotesk, IBM_Plex_Serif } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

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
  title: "VitaCollab – Secure Digital Health Records Platform",
  description: "Patient-owned healthcare records platform enabling secure collaboration between hospitals and patients.",
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: "/"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable} main-shell`}>
        <Script id="seo-setup-debug" strategy="afterInteractive">
          {`console.log("SEO setup active");`}
        </Script>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
