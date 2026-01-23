import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google"; // Added Inter
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import GlassBackground from "@/components/ui/glass-background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

import { getPageSeo } from "@/lib/seo-actions";
import { getBrandingSettings } from "@/lib/settings-actions";

export async function generateMetadata(): Promise<Metadata> {
  const [seoData, branding] = await Promise.all([
    getPageSeo('global'),
    getBrandingSettings()
  ]);

  // Type assertion for extended SEO fields (Prisma types may be stale until regeneration)
  const seo = seoData as any;

  return {
    title: {
      default: seo?.title || "MediaSoft Career",
      template: `%s | ${seo?.title || "MediaSoft Career"}`
    },
    description: seo?.description || "Build your future with MediaSoft.",
    keywords: seo?.keywords?.split(',').map((k: string) => k.trim()) || [],
    robots: seo?.robots || 'index, follow',
    icons: {
      icon: branding.faviconPath || '/favicon.ico',
    },
    openGraph: {
      title: seo?.ogTitle || seo?.title || "MediaSoft Career",
      description: seo?.ogDescription || seo?.description || "Build your future with MediaSoft.",
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.ogTitle || seo?.title || "MediaSoft Career",
      description: seo?.ogDescription || seo?.description || "Build your future with MediaSoft.",
      images: seo?.ogImage ? [seo.ogImage] : [],
    },
    alternates: seo?.canonicalUrl ? {
      canonical: seo.canonicalUrl,
    } : undefined,
  };
}

// Component to inject JSON-LD structured data
async function JsonLdScript() {
  const seo = await getPageSeo('global');
  if (!seo?.jsonLd) return null;

  try {
    // Validate JSON before rendering
    JSON.parse(seo.jsonLd);
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: seo.jsonLd }}
      />
    );
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLdScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <div className="fixed inset-0 -z-10">
          <GlassBackground />
        </div>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
