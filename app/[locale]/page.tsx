import { notFound } from "next/navigation";
import { Hero } from "@/components/site/hero";
import { Statements } from "@/components/site/statements";
import { content } from "@/lib/content";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [settings, home] = await Promise.all([content.getSiteSettings(locale), content.getHome(locale)]);

  return (
    <main id="main" className="px-5 md:px-10 lg:px-16">
      <Hero hero={home.hero} name={settings.name} dict={getDictionary(locale)} />
      <Statements statements={home.statements} label={getDictionary(locale).statements} />
    </main>
  );
}
