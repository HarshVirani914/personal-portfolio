import { notFound } from "next/navigation";
import { EducationAchievements } from "@/components/site/education";
import { ExperienceList } from "@/components/site/experience";
import { Hero } from "@/components/site/hero";
import { ResearchList } from "@/components/site/research-list";
import { SelectedWork } from "@/components/site/selected-work";
import { Skills } from "@/components/site/skills";
import { Statements } from "@/components/site/statements";
import { content } from "@/lib/content";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [settings, home, projects, research, skills, experience, education] = await Promise.all([
    content.getSiteSettings(locale),
    content.getHome(locale),
    content.getProjects(locale),
    content.getResearch(locale),
    content.getSkills(locale),
    content.getExperience(locale),
    content.getEducation(locale),
  ]);
  const dict = getDictionary(locale);

  return (
    <main id="main" className="px-5 md:px-10 lg:px-16">
      <Hero hero={home.hero} name={settings.name} dict={dict} />
      <Statements statements={home.statements} label={dict.statements} />
      <SelectedWork projects={projects} locale={locale} dict={dict.work} />
      <ResearchList items={research} locale={locale} dict={dict.research} />
      <Skills groups={skills} dict={dict.skills} />
      <ExperienceList items={experience} dict={dict.experience} />
      <EducationAchievements data={education} dict={dict.education} />
    </main>
  );
}
