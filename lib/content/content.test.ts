import { describe, expect, it } from "vitest";
import { createContent } from "@/lib/content";
import {
  createFixtureSource,
  fixtureData,
  type FixtureData,
} from "@/lib/content/fixture";
import type {
  RawProject,
  RawResearch,
  RawSkillGroup,
} from "@/lib/content/types";

const withData = (patch: Partial<FixtureData>) =>
  createContent(createFixtureSource({ ...fixtureData, ...patch }));

describe("content module", () => {
  it("returns site settings in the requested locale", async () => {
    const content = createContent(createFixtureSource());
    expect((await content.getSiteSettings("en")).city).toBe("Hof, Germany");
    expect((await content.getSiteSettings("de")).city).toBe("Hof, Deutschland");
    expect((await content.getSiteSettings("en")).name.full).toBe(
      "Harsh Virani"
    );
  });

  it("resolves contact details and nulls out blank ones", async () => {
    const full = createContent(createFixtureSource());
    const { contact } = await full.getSiteSettings("de");
    expect(contact.email).toBe("harshvirani.91@gmail.com");
    expect(contact.availability).toContain("Offen");
    expect(contact.cvUrl).toBe("/harsh-virani-ai-ml-cv-de.pdf");
    expect((await full.getSiteSettings("en")).contact.cvUrl).toBe(
      "/harsh-virani-ai-ml-cv.pdf"
    );

    const base = fixtureData.siteSettings!;
    const sparse = withData({
      siteSettings: {
        ...base,
        email: "  ",
        availability: { en: "" },
        cvUrl: null,
      },
    });
    const blank = (await sparse.getSiteSettings("en")).contact;
    expect(blank.email).toBeNull();
    expect(blank.availability).toBe("");
    expect(blank.cvUrl).toBeNull();

    const noGerman = withData({ siteSettings: { ...base, cvDeUrl: null } });
    expect((await noGerman.getSiteSettings("de")).contact.cvUrl).toBe(
      "/harsh-virani-ai-ml-cv.pdf"
    );
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
    expect(hero.annotations.map((a) => a.text)).toEqual([
      "AI engineer",
      "Agents",
      "Robotik",
    ]);
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
          {
            id: "x",
            label: { en: "x" },
            command: { en: "x" },
            output: [],
            hidden: true,
          },
          {
            id: "y",
            label: { en: "y" },
            command: { en: "y" },
            output: [{ en: "out" }],
          },
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
    expect(hero.terminal.map((t) => t.id)).toEqual([
      "mission",
      "whoami",
      "stack",
      "projects",
      "eval",
    ]);
  });

  it("resolves terminal command and output lines per locale", async () => {
    const content = createContent(createFixtureSource());
    const projects = (await content.getHome("de")).hero.terminal.find(
      (t) => t.id === "projects"
    );
    expect(projects?.label).toBe("projekte");
    expect(projects?.command).toBe("ls ~/ausgeliefert");
    const evalScript = (await content.getHome("de")).hero.terminal.find(
      (t) => t.id === "eval"
    );
    expect(evalScript?.output[0]).toBe("50 Fälle laufen ··········· fertig");
  });

  const stub = (id: string, extra: Partial<RawProject> = {}): RawProject => {
    const t = (en: string) => ({ en });
    return {
      id,
      slug: id,
      title: t(id.toUpperCase()),
      kind: t("Agent"),
      year: "2026",
      oneLiner: t(""),
      summary: t(""),
      headline: t(""),
      headlineEmphasis: t(""),
      tags: [],
      status: t(""),
      statusDetail: t(""),
      accentLight: "#111111",
      accentDark: "#eeeeee",
      role: t(""),
      client: t(""),
      stack: t(""),
      problem: t(""),
      built: t(""),
      stats: [],
      ...extra,
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
    const content = withData({
      projects: [stub("a"), stub("secret", { hidden: true })],
    });
    expect((await content.getProject("en", "a"))?.project.title).toBe("A");
    expect(await content.getProject("en", "nope")).toBeNull();
    expect(await content.getProject("en", "secret")).toBeNull();
  });

  it("links each project to the next and wraps from the last to the first", async () => {
    const content = withData({
      projects: [stub("a", { order: 1 }), stub("b", { order: 2 })],
    });
    expect((await content.getProject("en", "a"))?.next.slug).toBe("b");
    const last = await content.getProject("en", "b");
    expect(last?.next.slug).toBe("a");
    expect([last?.index, last?.total]).toEqual([1, 2]);
  });

  it("falls back to English per project field and keeps accents", async () => {
    const content = withData({
      projects: [
        stub("a", {
          summary: { en: "Hello", de: "Hallo" },
          headline: { en: "Only English" },
        }),
      ],
    });
    const de = (await content.getProject("de", "a"))?.project;
    expect(de?.summary).toBe("Hallo");
    expect(de?.headline).toBe("Only English");
    expect(de?.accent).toEqual({ light: "#111111", dark: "#eeeeee" });
  });

  it("ships four real projects, newest first, with no claim of full automation", async () => {
    const content = createContent(createFixtureSource());
    const projects = await content.getProjects("en");
    expect(projects.map((p) => p.slug)).toEqual([
      "flag-and-fill",
      "pocketpulse",
      "support-agent",
      "ssri",
    ]);
    const flag = projects[0];
    expect(`${flag?.summary} ${flag?.built} ${flag?.headline}`).not.toMatch(
      /fully automat|production|zero-touch/i
    );
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
    expect((await content.getHome("en")).statements.map((s) => s.text)).toEqual(
      ["first", "second", "third"]
    );
    expect((await content.getHome("de")).statements.map((s) => s.text)).toEqual(
      ["erste", "second", "third"]
    );
  });

  it("uses the fixture defaults while a singleton is not yet published", async () => {
    const content = withData({ siteSettings: null, hero: null });
    expect((await content.getSiteSettings("en")).name.full).toBe(
      "Harsh Virani"
    );
    expect((await content.getHome("en")).hero.terminal.length).toBeGreaterThan(
      0
    );
  });

  describe("research", () => {
    const t = (en: string, de?: string) => ({ en, de });
    const research = (
      id: string,
      extra: Partial<RawResearch> = {}
    ): RawResearch => ({
      id,
      slug: id,
      type: "paper",
      status: t("paper"),
      period: "2025",
      title: t(id.toUpperCase()),
      titleEmphasis: t(""),
      summary: t(""),
      kicker: t(""),
      standfirst: t(""),
      supervisor: t(""),
      updated: "2025-01-01",
      abstract: t("one two three"),
      sections: [],
      references: [],
      accentLight: "#111111",
      accentDark: "#eeeeee",
      cite: t(""),
      ...extra,
    });

    it("ships the thesis first and the two papers after it", async () => {
      const content = createContent(createFixtureSource());
      const items = await content.getResearch("en");
      expect(items.map((r) => [r.slug, r.type])).toEqual([
        ["agents-in-the-grid", "thesis"],
        ["evolving-ecosystem-of-llms", "paper"],
        ["ai-augmented-low-code", "paper"],
      ]);
      expect(items[0]?.status).toBe("in preparation");
      expect(items.map((r) => r.number)).toEqual([null, "P/01", "P/02"]);
    });

    it("does not claim the thesis is built, tested or finished", async () => {
      const [thesis] = await createContent(createFixtureSource()).getResearch(
        "en"
      );
      const text = [
        thesis?.summary,
        thesis?.standfirst,
        thesis?.abstract,
        ...(thesis?.sections.flatMap((s) =>
          s.blocks.map((b) => ("text" in b ? b.text : ""))
        ) ?? []),
      ].join(" ");
      expect(text).not.toMatch(
        /is being built|we built|i built|results land|completed|published|\d+(\.\d+)?\s?%/i
      );
      expect(text).toMatch(/nothing is implemented/i);
    });

    it("serves the paper PDFs from the content, not from code", async () => {
      const papers = (
        await createContent(createFixtureSource()).getResearch("en")
      ).filter((r) => r.type === "paper");
      expect(papers.every((paper) => paper.pdfUrl?.endsWith(".pdf"))).toBe(
        true
      );
    });

    it("orders, hides and falls back to English like every other document", async () => {
      const content = withData({
        research: [
          research("c", { order: 3 }),
          research("h", { order: 0, hidden: true }),
          research("a", { order: 1, standfirst: t("Hello", "Hallo") }),
          research("b", { order: 2, standfirst: t("Only English") }),
        ],
      });
      expect((await content.getResearch("en")).map((r) => r.slug)).toEqual([
        "a",
        "b",
        "c",
      ]);
      const de = await content.getResearch("de");
      expect(de.map((r) => r.standfirst).slice(0, 2)).toEqual([
        "Hallo",
        "Only English",
      ]);
    });

    it("links each item to the next and wraps, and returns null for unknown or hidden slugs", async () => {
      const content = withData({
        research: [
          research("a", { order: 1 }),
          research("b", { order: 2 }),
          research("x", { hidden: true }),
        ],
      });
      expect((await content.getResearchItem("en", "a"))?.next.slug).toBe("b");
      const last = await content.getResearchItem("en", "b");
      expect(last?.next.slug).toBe("a");
      expect([last?.index, last?.total]).toEqual([1, 2]);
      expect(await content.getResearchItem("en", "x")).toBeNull();
      expect(await content.getResearchItem("en", "nope")).toBeNull();
    });

    it("numbers sections, figures and side notes in reading order and estimates reading time", async () => {
      const filler = Array.from({ length: 400 }, () => "word").join(" ");
      const content = withData({
        research: [
          research("a", {
            abstract: t(filler),
            sections: [
              {
                id: "s1",
                heading: t("First", "Erstens"),
                blocks: [
                  {
                    id: "p1",
                    kind: "paragraph",
                    text: t("Text [1]"),
                    note: t("A note"),
                  },
                  { id: "p2", kind: "paragraph", text: t("No note") },
                  { id: "f1", kind: "figure", caption: t("One") },
                  {
                    id: "p3",
                    kind: "paragraph",
                    text: t("More"),
                    note: t("Another"),
                  },
                ],
              },
              {
                id: "s2",
                heading: t("Second"),
                blocks: [
                  { id: "f2", kind: "figure", caption: t("Two"), figure: "k" },
                ],
              },
            ],
          }),
        ],
      });
      const [item] = await content.getResearch("de");
      expect(item?.sections.map((s) => [s.number, s.heading])).toEqual([
        ["01", "Erstens"],
        ["02", "Second"],
      ]);
      const blocks = item?.sections.flatMap((s) => s.blocks) ?? [];
      expect(
        blocks.flatMap((b) => (b.kind === "paragraph" ? [b.noteNumber] : []))
      ).toEqual([1, null, 2]);
      expect(
        blocks.flatMap((b) =>
          b.kind === "figure" ? [[b.number, b.figure]] : []
        )
      ).toEqual([
        [1, null],
        [2, "k"],
      ]);
      expect(item?.readingMinutes).toBe(2);
    });
  });

  describe("skills", () => {
    const t = (en: string, de?: string) => ({ en, de });
    const group = (
      id: string,
      extra: Partial<RawSkillGroup> = {}
    ): RawSkillGroup => ({
      id,
      title: t(id),
      skills: [{ id: `${id}-s`, name: "Skill", note: t("note") }],
      ...extra,
    });

    it("ships four groups whose notes take the colour of the item they point at", async () => {
      const content = createContent(createFixtureSource());
      const groups = await content.getSkills("en");
      expect(groups.map((g) => g.title)).toEqual([
        "Agents & LLMs",
        "Retrieval & evaluation",
        "Machine learning",
        "Product engineering",
      ]);
      const langgraph = groups[0]?.skills.find((s) => s.name === "LangGraph");
      expect(langgraph?.accent).toEqual({ light: "#a33a6b", dark: "#e07aa8" });
      const langchain = groups[0]?.skills.find((s) => s.name === "LangChain");
      expect(langchain?.accent).toBeNull();
    });

    it("never claims the thesis evaluation has been run", async () => {
      const groups = await createContent(createFixtureSource()).getSkills("en");
      const thesis = groups
        .flatMap((g) => g.skills)
        .find((s) => s.name === "Agent evals");
      expect(thesis?.note).toMatch(/planned/i);
    });

    it("orders and hides groups and skills, drops empty groups, and falls back to English", async () => {
      const content = withData({
        skillGroups: [
          group("c", { order: 2, title: t("Third", "Dritte") }),
          group("h", { order: 0, hidden: true }),
          group("a", {
            order: 1,
            skills: [
              { id: "x", name: "X", note: t("only english") },
              { id: "y", name: "Y", note: t("hidden"), hidden: true },
              {
                id: "z",
                name: "Z",
                note: t("note", "Notiz"),
                ref: { accentLight: "#111111", accentDark: "#eeeeee" },
              },
            ],
          }),
          group("e", { order: 3, skills: [] }),
        ],
      });
      const de = await content.getSkills("de");
      expect(de.map((g) => g.id)).toEqual(["a", "c"]);
      expect(de[0]?.skills.map((s) => [s.name, s.note])).toEqual([
        ["X", "only english"],
        ["Z", "Notiz"],
      ]);
      expect(de[0]?.skills[1]?.accent).toEqual({
        light: "#111111",
        dark: "#eeeeee",
      });
      expect(de[1]?.title).toBe("Dritte");
    });
  });
  describe("career", () => {
    const t = (en: string, de?: string) => ({ en, de });

    it("ships newest-first roles and both degrees with their tags", async () => {
      const content = createContent(createFixtureSource());
      const experience = await content.getExperience("en");
      expect(experience.map((row) => row.company)).toEqual([
        "Silver Spring",
        "TechStaunch Solutions",
      ]);
      expect(experience[1]?.years).toBe("2024 — 2025");
      const { education, certifications } = await content.getEducation("en");
      expect(
        education.map((row) => [row.degree, row.tags.map((tag) => tag.label)])
      ).toEqual([
        ["M.Sc. AI & Robotics", ["Dean's List 2025"]],
        ["B.Sc. Computer Science", ["MYSY Scholarship"]],
      ]);
      expect(education[0]?.tags[0]?.url).toBe(
        "https://drive.google.com/file/d/1IST7-8lDUR1zJXyUKwtRsTLbvdWArs2r/view?usp=sharing"
      );
      expect(education[1]?.tags[0]?.url).toBeNull();
      expect(certifications.map((cert) => cert.issuer)).toEqual([
        "Oracle",
        "Anthropic",
      ]);
      expect(
        certifications.every((cert) => cert.url.startsWith("https://"))
      ).toBe(true);
    });

    it("never rounds the TechStaunch role up to a year", async () => {
      const row = (
        await createContent(createFixtureSource()).getExperience("en")
      ).find((r) => r.company.startsWith("TechStaunch"));
      expect(row?.bullets.join(" ")).not.toMatch(/one year|35%/i);
    });

    it("orders and hides rows, skips blank bullets and falls back to English", async () => {
      const content = withData({
        experience: [
          {
            id: "b",
            years: t("2"),
            company: "B",
            role: t("Role B", "Rolle B"),
            bullets: [t("x", "y"), t("")],
            order: 2,
          },
          {
            id: "h",
            years: t("0"),
            company: "H",
            role: t("Hidden"),
            bullets: [],
            hidden: true,
          },
          {
            id: "a",
            years: t("1"),
            company: "A",
            role: t("Role A"),
            bullets: [],
            order: 1,
          },
          {
            id: "n",
            years: t("3"),
            company: "",
            role: t("Nameless"),
            bullets: [],
            order: 3,
          },
        ],
        certifications: [
          {
            id: "ok",
            name: "Ok",
            issuer: "I",
            credentialUrl: "https://example.com/c",
            order: 1,
          },
          {
            id: "nolink",
            name: "No link",
            issuer: "I",
            credentialUrl: "",
            order: 2,
          },
        ],
      });
      const de = await content.getExperience("de");
      expect(de.map((row) => row.id)).toEqual(["a", "b"]);
      expect(de[0]?.role).toBe("Role A");
      expect(de[1]).toMatchObject({ role: "Rolle B", bullets: ["y"] });
      expect(
        (await content.getEducation("de")).certifications.map((cert) => cert.id)
      ).toEqual(["ok"]);
    });
  });
});
