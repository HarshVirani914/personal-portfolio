import { describe, expect, it } from "vitest";
import { createContent } from "@/lib/content";
import { createFixtureSource } from "@/lib/content/fixture";
import {
  profileSchema,
  projectSchema,
  researchSchema,
  serializeSchemas,
  siteSchemas,
} from "@/lib/structured-data";

const site = "https://example.com";
const content = createContent(createFixtureSource());

const sitewide = async (locale: "en" | "de") => {
  const [settings, about, schooling, skills] = await Promise.all([
    content.getSiteSettings(locale),
    content.getAbout(locale),
    content.getEducation(locale),
    content.getSkills(locale),
  ]);
  return siteSchemas({
    settings,
    about,
    education: schooling.education,
    skills,
    site,
    locale,
  });
};

describe("siteSchemas", () => {
  it("describes the person from CMS content with absolute URLs", async () => {
    const [person] = await sitewide("en");
    expect(person).toMatchObject({
      "@type": "Person",
      "@id": `${site}/#person`,
      name: "Harsh Virani",
      url: `${site}/`,
      image: `${site}/harsh-portrait.jpg`,
    });
    expect(person!.sameAs).toEqual(
      expect.arrayContaining([expect.stringContaining("github.com")])
    );
    expect(person!.knowsAbout).toContain("LangGraph");
  });

  it("points German pages at the German home page", async () => {
    const [person, website] = await sitewide("de");
    expect(person!.url).toBe(`${site}/de`);
    expect(website).toMatchObject({ url: `${site}/de`, inLanguage: "de" });
  });
});

describe("page schemas", () => {
  it("ties the profile page to the person", () => {
    expect(profileSchema(site, "en")).toMatchObject({
      "@type": "ProfilePage",
      mainEntity: { "@id": `${site}/#person` },
    });
  });

  it("credits a project to the person", async () => {
    const [project] = await content.getProjects("en");
    expect(projectSchema(project!, site, "en")).toMatchObject({
      "@type": "CreativeWork",
      url: `${site}/work/${project!.slug}`,
      author: { "@id": `${site}/#person` },
    });
  });

  it("types the thesis and the papers apart", async () => {
    const research = await content.getResearch("en");
    const types = research.map(
      (item) => researchSchema(item, site, "en")["@type"]
    );
    expect(types).toContain("Thesis");
    expect(types).toContain("ScholarlyArticle");
  });

  it("makes paper PDFs absolute", async () => {
    const research = await content.getResearch("en");
    const paper = research.find((item) => item.pdfUrl)!;
    expect(researchSchema(paper, site, "en").associatedMedia).toMatchObject({
      contentUrl: expect.stringMatching(/^https:\/\//),
    });
  });
});

describe("serializeSchemas", () => {
  it("cannot be used to close the script tag", () => {
    const json = serializeSchemas([{ name: "</script><script>" }]);
    expect(json).not.toContain("<");
    expect(JSON.parse(json)["@graph"][0].name).toBe("</script><script>");
  });
});
