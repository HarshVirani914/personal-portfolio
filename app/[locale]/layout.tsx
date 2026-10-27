import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { notFound } from "next/navigation";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { getDictionary } from "@/lib/dictionary";
import { isLocale, locales } from "@/lib/i18n";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import "../globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-heading",
});

const geist = Geist({ subsets: ["latin", "latin-ext"], variable: "--font-sans" });

const geistMono = Geist_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: `${site.firstName} ${site.lastName}`,
  description: site.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e0f" },
  ],
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(geist.variable, geistMono.variable, instrumentSerif.variable)}
    >
      <body className="min-h-dvh">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <a
            href="#main"
            className="sr-only z-50 bg-background px-4 py-2 text-ui focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
          >
            {dict.skipToContent}
          </a>
          <SmoothScroll />
          <SiteHeader
            locale={locale}
            dict={dict}
            name={`${site.firstName} ${site.lastName}`}
            coordinates={site.coordinates}
          />
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
