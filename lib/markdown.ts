import type { Content } from "@/lib/content";
import { localizedPath, parseLocalePath, type Locale } from "@/lib/i18n";
import { llmsIndex } from "@/lib/llms";

/** Internal prefix the proxy rewrites markdown requests to. Never linked. */
export const MARKDOWN_PREFIX = "/md";

/**
 * True when the Accept header asks for markdown at least as strongly as HTML.
 * Browsers never list text/markdown, so they keep getting HTML.
 */
export function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  const quality = new Map<string, number>();
  for (const part of accept.split(",")) {
    const [type = "", ...params] = part.trim().toLowerCase().split(";");
    const q = params
      .map((param) => param.trim())
      .find((param) => param.startsWith("q="));
    const value = q ? Number.parseFloat(q.slice(2)) : 1;
    quality.set(type.trim(), Number.isNaN(value) ? 0 : value);
  }
  const markdown = quality.get("text/markdown") ?? 0;
  if (markdown <= 0) return false;
  const html = Math.max(
    quality.get("text/html") ?? 0,
    quality.get("application/xhtml+xml") ?? 0
  );
  return markdown >= html;
}

const list = (items: string[]) => items.map((item) => `- ${item}`);

const section = (heading: string, lines: string[]) =>
  lines.length > 0 ? [`## ${heading}`, "", ...lines, ""] : [];

const absolute = (path: string, locale: Locale, site: string) =>
  new URL(localizedPath(path, locale), site).href;

/**
 * The markdown version of a public page, or null when the path has no page.
 * `pathname` is the public path, with the /de prefix for German.
 */
export async function pageMarkdown(
  content: Content,
  pathname: string,
  site: string
): Promise<string | null> {
  const { locale, path } = parseLocalePath(pathname);
  const [first, slug, ...extra] = path.split("/").filter(Boolean);

  if (!first) {
    const [settings, projects, research] = await Promise.all([
      content.getSiteSettings(locale),
      content.getProjects(locale),
      content.getResearch(locale),
    ]);
    return llmsIndex({ settings, projects, research, site });
  }

  if (first === "about" && !slug) {
    return aboutMarkdown(content, locale);
  }

  if (extra.length > 0 || !slug) return null;

  if (first === "work") {
    const page = await content.getProject(locale, slug);
    if (!page) return null;
    const { project } = page;
    return [
      `# ${project.title}`,
      "",
      `> ${project.summary || project.oneLiner}`,
      "",
      ...list(
        [
          `Kind: ${project.kind}`,
          `Year: ${project.year}`,
          `Status: ${project.statusDetail || project.status}`,
          project.meta.role && `Role: ${project.meta.role}`,
          project.meta.client && `Client: ${project.meta.client}`,
          project.meta.stack && `Stack: ${project.meta.stack}`,
          project.liveUrl && `Live: ${project.liveUrl}`,
        ].filter((line): line is string => Boolean(line))
      ),
      "",
      ...section("Problem", project.problem ? [project.problem] : []),
      ...section("What was built", project.built ? [project.built] : []),
      ...section(
        "Results",
        list(project.stats.map((stat) => `${stat.label}: ${stat.value}`))
      ),
      `Next: [${page.next.title}](${absolute(`/work/${page.next.slug}`, locale, site)})`,
    ]
      .join("\n")
      .trim();
  }

  if (first === "research") {
    const page = await content.getResearchItem(locale, slug);
    if (!page) return null;
    const { item } = page;
    return [
      `# ${`${item.title} ${item.titleEmphasis}`.trim()}`,
      "",
      `> ${item.standfirst || item.summary}`,
      "",
      ...list(
        [
          `Type: ${item.type}`,
          `Status: ${item.status}`,
          `Period: ${item.period}`,
          item.supervisor && `Supervisor: ${item.supervisor}`,
          item.pdfUrl && `PDF: ${item.pdfUrl}`,
        ].filter((line): line is string => Boolean(line))
      ),
      "",
      ...section("Abstract", item.abstract ? [item.abstract] : []),
      ...item.sections.flatMap((part) =>
        section(
          part.heading,
          part.blocks.flatMap((block) => {
            switch (block.kind) {
              case "paragraph":
                return [
                  block.note
                    ? `${block.text} (Note: ${block.note})`
                    : block.text,
                  "",
                ];
              case "code":
                return [
                  "```",
                  block.code,
                  "```",
                  ...(block.caption ? [`_${block.caption}_`] : []),
                  "",
                ];
              case "figure":
                return block.caption
                  ? [`_Figure ${block.number}: ${block.caption}_`, ""]
                  : [];
              case "quote":
                return [`> ${block.text}`, ""];
            }
          })
        )
      ),
      ...section("References", list(item.references)),
      ...section("Cite", item.cite ? [item.cite] : []),
    ]
      .join("\n")
      .trim();
  }

  return null;
}

async function aboutMarkdown(content: Content, locale: Locale) {
  const [settings, about, skills, experience, education] = await Promise.all([
    content.getSiteSettings(locale),
    content.getAbout(locale),
    content.getSkills(locale),
    content.getExperience(locale),
    content.getEducation(locale),
  ]);
  return [
    `# ${settings.name.full}`,
    "",
    `> ${about.headline.map((part) => part.text).join("")}`,
    "",
    ...section(
      "Story",
      about.story.flatMap((paragraph) => [paragraph, ""])
    ),
    ...section(
      "Now",
      list(about.now.map((item) => `${item.label}: ${item.text}`))
    ),
    ...section(
      "Experience",
      experience.flatMap((row) => [
        `### ${row.role}, ${row.company} (${row.years})`,
        "",
        ...list(row.bullets),
        "",
      ])
    ),
    ...section(
      "Education",
      list(
        education.education.map(
          (row) => `${row.degree}, ${row.institution} (${row.years})`
        )
      )
    ),
    ...section(
      "Certifications",
      list(
        education.certifications.map((cert) => `${cert.name}, ${cert.issuer}`)
      )
    ),
    ...section(
      "Skills",
      list(
        skills.map(
          (group) =>
            `${group.title}: ${group.skills.map((skill) => skill.name).join(", ")}`
        )
      )
    ),
    ...section(
      "Languages",
      list(about.languages.map((row) => `${row.name}: ${row.detail}`))
    ),
    ...section(
      "Interests",
      list(about.interests.map((row) => `${row.name}: ${row.detail}`))
    ),
  ]
    .join("\n")
    .trim();
}

/** Rough token count (about four characters per token) for x-markdown-tokens. */
export const estimateTokens = (text: string) => Math.ceil(text.length / 4);

export function markdownResponse(body: string, status = 200) {
  const text = `${body}\n`;
  return new Response(text, {
    status,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "x-markdown-tokens": String(estimateTokens(text)),
      vary: "Accept",
    },
  });
}
