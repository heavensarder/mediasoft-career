import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

import { getPageSeo } from "@/lib/seo-actions";
import { getBrandingSettings } from "@/lib/settings-actions";

export async function generateMetadata() {
  const [seo, branding] = await Promise.all([
    getPageSeo('global'),
    getBrandingSettings()
  ]);

  return {
    title: {
      default: seo?.title || "MediaSoft Career",
      template: `%s | ${seo?.title || "MediaSoft Career"}`
    },
    description: seo?.description || "Build your future with MediaSoft.",
    keywords: seo?.keywords?.split(',').map((k: string) => k.trim()) || [],
    icons: {
      icon: branding.faviconPath || '/favicon.ico',
    },
    openGraph: {
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
    }
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
