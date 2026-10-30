import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { notFound } from "next/navigation";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { AgentLauncher } from "@/components/site/agent-launcher";
import { ScrollRestoration } from "@/components/site/scroll-restoration";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { getDictionary } from "@/lib/dictionary";
import { isLocale, locales } from "@/lib/i18n";
import { content } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";
import "../globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-heading",
});

const geist = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const settings = await content.getSiteSettings(locale);
  return {
    metadataBase: new URL(getSiteUrl()),
    ...pageMetadata({
      locale,
      path: "/",
      title: settings.name.full,
      description: settings.description,
      siteName: settings.name.full,
    }),
  };
}

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
  const [settings, agent] = await Promise.all([
    content.getSiteSettings(locale),
    content.getAgent(locale),
  ]);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        geist.variable,
        geistMono.variable,
        instrumentSerif.variable
      )}
    >
      <body className="min-h-svh">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <a
            href="#main"
            className="bg-background text-ui sr-only z-50 px-4 py-2 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
          >
            {dict.skipToContent}
          </a>
          <SmoothScroll />
          <ScrollRestoration />
          <SiteHeader
            locale={locale}
            dict={dict}
            name={settings.name.full}
            coordinates={settings.coordinates}
            city={settings.city}
          />
          {children}
          <SiteFooter
            name={settings.name}
            coordinates={settings.coordinates}
            dict={dict.footer}
          />
          <AgentLauncher
            locale={locale}
            dict={dict.agent}
            suggestions={agent.suggestions}
            name={settings.name}
            contact={settings.contact}
          />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
