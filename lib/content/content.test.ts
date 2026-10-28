import { describe, expect, it } from "vitest";
import { createContent } from "@/lib/content";
import { createFixtureSource, fixtureData, type FixtureData } from "@/lib/content/fixture";
import type { RawProject } from "@/lib/content/types";

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

  const stub = (id: string, extra: Partial<RawProject> = {}): RawProject => {
    const t = (en: string) => ({ en });
    return {
      id, slug: id, title: t(id.toUpperCase()), kind: t("Agent"), year: "2026", oneLiner: t(""), summary: t(""),
      headline: t(""), headlineEmphasis: t(""), tags: [], status: t(""), statusDetail: t(""),
      accentLight: "#111111", accentDark: "#eeeeee", role: t(""), client: t(""), stack: t(""),
      problem: t(""), built: t(""), stats: [], ...extra,
    };
  };

  it("orders projects by their order field and drops hidden ones", async () => {
    const content = withData({
      projects: [
        stub("c", { order: 3 }),
        stub("h", { order: 0, hidden: true }),
        stub("a", { order: 1 }),
        stub("b", { order: 2 }),
      ],
    });
    const projects = await content.getProjects("en");
    expect(projects.map((p) => p.slug)).toEqual(["a", "b", "c"]);
    expect(projects.map((p) => p.number)).toEqual(["01", "02", "03"]);
  });

  it("resolves a project by slug and returns null for unknown or hidden slugs", async () => {
    const content = withData({ projects: [stub("a"), stub("secret", { hidden: true })] });
    expect((await content.getProject("en", "a"))?.project.title).toBe("A");
    expect(await content.getProject("en", "nope")).toBeNull();
    expect(await content.getProject("en", "secret")).toBeNull();
  });

  it("links each project to the next and wraps from the last to the first", async () => {
    const content = withData({ projects: [stub("a", { order: 1 }), stub("b", { order: 2 })] });
    expect((await content.getProject("en", "a"))?.next.slug).toBe("b");
    const last = await content.getProject("en", "b");
    expect(last?.next.slug).toBe("a");
    expect([last?.index, last?.total]).toEqual([1, 2]);
  });

  it("falls back to English per project field and keeps accents", async () => {
    const content = withData({
      projects: [stub("a", { summary: { en: "Hello", de: "Hallo" }, headline: { en: "Only English" } })],
    });
    const de = (await content.getProject("de", "a"))?.project;
    expect(de?.summary).toBe("Hallo");
    expect(de?.headline).toBe("Only English");
    expect(de?.accent).toEqual({ light: "#111111", dark: "#eeeeee" });
  });

  it("ships four real projects, newest first, with no claim of full automation", async () => {
    const content = createContent(createFixtureSource());
    const projects = await content.getProjects("en");
    expect(projects.map((p) => p.slug)).toEqual(["flag-and-fill", "pocketpulse", "support-agent", "ssri"]);
    const flag = projects[0];
    expect(`${flag?.summary} ${flag?.built} ${flag?.headline}`).not.toMatch(/fully automat|production|zero-touch/i);
  });

  it("returns statements in CMS order, per locale, without hidden ones", async () => {
    const content = withData({
      statements: [
        { id: "c", text: { en: "third" }, order: 3 },
        { id: "h", text: { en: "hidden" }, order: 0, hidden: true },
        { id: "a", text: { en: "first", de: "erste" }, order: 1 },
        { id: "b", text: { en: "second" }, order: 2 },
      ],
    });
    expect((await content.getHome("en")).statements.map((s) => s.text)).toEqual(["first", "second", "third"]);
    expect((await content.getHome("de")).statements.map((s) => s.text)).toEqual(["erste", "second", "third"]);
  });

  it("uses the fixture defaults while a singleton is not yet published", async () => {
    const content = withData({ siteSettings: null, hero: null });
    expect((await content.getSiteSettings("en")).name.full).toBe("Harsh Virani");
    expect((await content.getHome("en")).hero.terminal.length).toBeGreaterThan(0);
  });
});
