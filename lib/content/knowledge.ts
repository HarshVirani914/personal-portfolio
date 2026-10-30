import type {
  About,
  Certification,
  Education,
  Experience,
  Project,
  Research,
  SiteSettings,
  SkillGroup,
} from "@/lib/content/types";

type Parts = {
  settings: SiteSettings;
  about: About;
  projects: Project[];
  research: Research[];
  skills: SkillGroup[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
};

const field = (name: string, value: string | null | undefined) =>
  value ? [`${name}: ${value}`] : [];

const section = (heading: string, lines: string[]) =>
  lines.length > 0 ? [`## ${heading}`, ...lines, ""] : [];

/**
 * The Knowledge View as prompt text. It must stay byte-stable for the same
 * content, with no dates or ordering surprises: a change anywhere in it costs
 * the model's prompt cache.
 */
export function knowledgeText({
  settings,
  about,
  projects,
  research,
  skills,
  experience,
  education,
  certifications,
}: Parts): string {
  const { contact } = settings;
  return [
    ...section("Harsh", [
      ...field("Name", settings.name.full),
      ...field("City", settings.city),
      ...field("Summary", settings.description),
      ...field("Availability", contact.availability),
      ...field("Email", contact.email),
      ...field("LinkedIn", contact.linkedinUrl),
      ...field("GitHub", contact.githubUrl),
    ]),
    ...section("Story", about.story),
    ...section(
      "Now",
      about.now.map((item) => `${item.label}: ${item.text}`)
    ),
    ...section(
      "Languages",
      about.languages.map((row) => `${row.name}: ${row.detail}`)
    ),
    ...section(
      "Interests",
      about.interests.map((row) => `${row.name}: ${row.detail}`)
    ),
    ...section(
      "Experience",
      experience.flatMap((row) => [
        `${row.role} at ${row.company} (${row.years})`,
        ...row.bullets.map((bullet) => `- ${bullet}`),
      ])
    ),
    ...section(
      "Education",
      education.map((row) =>
        [
          `${row.degree}, ${row.institution} (${row.years})`,
          ...row.tags.map((tag) => tag.label),
        ].join("; ")
      )
    ),
    ...section(
      "Certifications",
      certifications.map((cert) => `${cert.name}, ${cert.issuer}`)
    ),
    ...section(
      "Skills",
      skills.map(
        (group) =>
          `${group.title}: ${group.skills
            .map((skill) =>
              skill.note ? `${skill.name} (${skill.note})` : skill.name
            )
            .join(", ")}`
      )
    ),
    ...section(
      "Projects",
      projects.flatMap((project) => [
        `[slug: ${project.slug}] ${project.title}`,
        ...field("Kind", project.kind),
        ...field("Year", project.year),
        ...field("Status", project.statusDetail || project.status),
        ...field("Summary", project.summary || project.oneLiner),
        ...field("Role", project.meta.role),
        ...field("Client", project.meta.client),
        ...field("Stack", project.meta.stack),
        ...field("Problem", project.problem),
        ...field("Built", project.built),
        ...field(
          "Results",
          project.stats.map((stat) => `${stat.label}: ${stat.value}`).join("; ")
        ),
        ...field("Live", project.liveUrl),
        "",
      ])
    ),
    ...section(
      "Research",
      research.flatMap((item) => [
        `[slug: ${item.slug}] ${item.title} ${item.titleEmphasis}`.trim(),
        ...field("Type", item.type),
        ...field("Status", item.status),
        ...field("Period", item.period),
        ...field("Supervisor", item.supervisor),
        ...field("Summary", item.summary),
        ...field("Abstract", item.abstract),
        "",
      ])
    ),
  ]
    .join("\n")
    .trim();
}
