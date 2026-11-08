import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { BackToTop } from "@/components/layout/BackToTop";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TouchFeedback } from "@/components/ui/TouchFeedback";
import { HERO_POSTER } from "@/data/images";
import { site } from "@/data/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}: ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: ["bangles", "stone bangles", "Indian jewellery", "bangle sets", "ruby bangles", "emerald bangles", "VIIRAA"],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name}: ${site.tagline}`,
    description: site.description,
    images: [{ url: HERO_POSTER.src, width: HERO_POSTER.width, height: HERO_POSTER.height, alt: "VIIRAA bangles" }],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name}: ${site.tagline}`,
    description: site.description,
    images: [HERO_POSTER.src],
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f2ea",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    slogan: site.tagline,
    url: site.url,
  };
  // data-scroll-behavior: new pages open at the top instantly (Next 16 no
  // longer suspends smooth scrolling during navigation by itself).
  return (
    <html lang="en-IN" className={`${cormorant.variable} ${jost.variable}`} data-scroll-behavior="smooth">
      <body>
        <Header />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <BackToTop />
        <TouchFeedback />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </body>
    </html>
  );
}
