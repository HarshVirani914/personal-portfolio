import { describe, expect, it } from "vitest";
import { createContent } from "@/lib/content";
import { createFixtureSource, fixtureData, type FixtureData } from "@/lib/content/fixture";

const withData = (patch: Partial<FixtureData>) =>
  createContent(createFixtureSource({ ...fixtureData, ...patch }));

describe("content module", () => {
  it("returns site settings in the requested locale", async () => {
    const content = createContent(createFixtureSource());
    expect((await content.getSiteSettings("en")).city).toBe("Hof, Germany");
    expect((await content.getSiteSettings("de")).city).toBe("Hof, Deutschland");
    expect((await content.getSiteSettings("en")).name.full).toBe("Harsh Virani");
  });

  it("falls back to English when German is missing or blank", async () => {
    const content = withData({
      hero: {
        annotations: [
          { id: "a", text: { en: "AI engineer" } },
          { id: "b", text: { en: "Agents", de: "   " } },
          { id: "c", text: { en: "Robotics", de: "Robotik" } },
        ],
        terminalScripts: [],
      },
    });
    const { hero } = await content.getHome("de");
    expect(hero.annotations.map((a) => a.text)).toEqual(["AI engineer", "Agents", "Robotik"]);
  });

  it("excludes hidden items and renumbers annotation markers", async () => {
    const content = withData({
      hero: {
        annotations: [
          { id: "a", text: { en: "one" } },
          { id: "b", text: { en: "two" }, hidden: true },
          { id: "c", text: { en: "three" } },
        ],
        terminalScripts: [
          { id: "x", label: { en: "x" }, command: { en: "x" }, output: [], hidden: true },
          { id: "y", label: { en: "y" }, command: { en: "y" }, output: [{ en: "out" }] },
        ],
      },
    });
    const { hero } = await content.getHome("en");
    expect(hero.annotations.map((a) => [a.marker, a.text])).toEqual([
      ["[01]", "one"],
      ["[02]", "three"],
    ]);
    expect(hero.terminal.map((t) => t.id)).toEqual(["y"]);
  });

  it("keeps the CMS order of terminal scripts", async () => {
    const content = createContent(createFixtureSource());
    const { hero } = await content.getHome("en");
    expect(hero.terminal.map((t) => t.id)).toEqual(["mission", "whoami", "stack", "projects", "eval"]);
  });

  it("resolves terminal command and output lines per locale", async () => {
    const content = createContent(createFixtureSource());
    const projects = (await content.getHome("de")).hero.terminal.find((t) => t.id === "projects");
    expect(projects?.label).toBe("projekte");
    expect(projects?.command).toBe("ls ~/ausgeliefert");
    const evalScript = (await content.getHome("de")).hero.terminal.find((t) => t.id === "eval");
    expect(evalScript?.output[0]).toBe("50 Fälle laufen ··········· fertig");
  });

  it("orders projects by their order field and drops hidden ones", async () => {
    const title = (en: string) => ({ en });
    const content = withData({
      projects: [
        { id: "3", slug: "c", title: title("C"), oneLiner: title(""), order: 3 },
        { id: "h", slug: "h", title: title("H"), oneLiner: title(""), order: 0, hidden: true },
        { id: "1", slug: "a", title: title("A"), oneLiner: title(""), order: 1 },
        { id: "2", slug: "b", title: title("B"), oneLiner: title(""), order: 2 },
      ],
    });
    expect((await content.getProjects("en")).map((p) => p.slug)).toEqual(["a", "b", "c"]);
  });

  it("resolves a project by slug and returns null for unknown or hidden slugs", async () => {
    const title = (en: string) => ({ en });
    const content = withData({
      projects: [
        { id: "1", slug: "a", title: title("A"), oneLiner: title("") },
        { id: "2", slug: "secret", title: title("S"), oneLiner: title(""), hidden: true },
      ],
    });
    expect((await content.getProject("en", "a"))?.title).toBe("A");
    expect(await content.getProject("en", "nope")).toBeNull();
    expect(await content.getProject("en", "secret")).toBeNull();
  });

  it("uses the fixture defaults while a singleton is not yet published", async () => {
    const content = withData({ siteSettings: null, hero: null });
    expect((await content.getSiteSettings("en")).name.full).toBe("Harsh Virani");
    expect((await content.getHome("en")).hero.terminal.length).toBeGreaterThan(0);
  });
});
