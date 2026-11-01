import type { Project, Research, SiteSettings } from "@/lib/content/types";

/** A short guide to the site in the llms.txt format (https://llmstxt.org). */
export function llmsIndex({
  settings,
  projects,
  research,
  site,
}: {
  settings: SiteSettings;
  projects: Project[];
  research: Research[];
  site: string;
}): string {
  const { availability, email, linkedinUrl, githubUrl, cvUrl } =
    settings.contact;
  const link = (name: string, url: string, note?: string) =>
    `- [${name}](${new URL(url, site).href})${note ? `: ${note}` : ""}`;

  return [
    `# ${settings.name.full}`,
    "",
    `> ${settings.description}`,
    "",
    availability,
    "",
    "## Profile",
    "",
    link("About", "/about", "Background, languages and current focus"),
    ...(email ? [`- [Email](mailto:${email})`] : []),
    ...(linkedinUrl ? [link("LinkedIn", linkedinUrl)] : []),
    ...(githubUrl ? [link("GitHub", githubUrl)] : []),
    ...(cvUrl ? [link("CV", cvUrl, "PDF")] : []),
    "",
    "## Work",
    "",
    ...projects.map((project) =>
      link(project.title, `/work/${project.slug}`, project.oneLiner)
    ),
    "",
    "## Research",
    "",
    ...research.map((item) =>
      link(
        `${item.title} ${item.titleEmphasis}`.trim(),
        `/research/${item.slug}`,
        item.summary
      )
    ),
    "",
    "## Optional",
    "",
    link("Full profile", "/llms-full.txt", "All of the above in one file"),
    link("Deutsch", "/de", "The site in German"),
  ].join("\n");
}

export const llmsResponse = (body: string) =>
  new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
