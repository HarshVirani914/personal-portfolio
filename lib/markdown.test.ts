import { describe, expect, it } from "vitest";
import { createContent } from "@/lib/content";
import { createFixtureSource } from "@/lib/content/fixture";
import {
  markdownResponse,
  pageMarkdown,
  prefersMarkdown,
} from "@/lib/markdown";

const site = "https://example.com";
const content = createContent(createFixtureSource());

describe("prefersMarkdown", () => {
  it.each([
    ["text/markdown", true],
    ["text/markdown, text/html;q=0.9", true],
    ["text/html, text/markdown", true],
    ["text/markdown;q=0.5, text/html", false],
    ["text/markdown;q=0", false],
    ["text/html,application/xhtml+xml,*/*;q=0.8", false],
    ["*/*", false],
    [null, false],
  ])("%s gives %s", (accept, expected) => {
    expect(prefersMarkdown(accept)).toBe(expected);
  });
});

describe("pageMarkdown", () => {
  it("renders the home page as the llms.txt guide", async () => {
    const text = await pageMarkdown(content, "/", site);
    expect(text).toMatch(/^# Harsh Virani\n\n> .+/);
  });

  it("renders the about page", async () => {
    const text = await pageMarkdown(content, "/about", site);
    expect(text).toContain("## Experience");
  });

  it("renders every project and research item in both locales", async () => {
    for (const locale of ["en", "de"] as const) {
      const prefix = locale === "en" ? "" : "/de";
      for (const project of await content.getProjects(locale)) {
        const text = await pageMarkdown(
          content,
          `${prefix}/work/${project.slug}`,
          site
        );
        expect(text?.startsWith(`# ${project.title}`)).toBe(true);
      }
      for (const item of await content.getResearch(locale)) {
        const text = await pageMarkdown(
          content,
          `${prefix}/research/${item.slug}`,
          site
        );
        expect(text).toContain("## Abstract");
      }
    }
  });

  it("returns null for an unknown page", async () => {
    expect(await pageMarkdown(content, "/work/nope", site)).toBeNull();
    expect(await pageMarkdown(content, "/missing", site)).toBeNull();
  });
});

describe("markdownResponse", () => {
  it("sets the markdown headers", () => {
    const response = markdownResponse("# Hi");
    expect(response.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8"
    );
    expect(response.headers.get("vary")).toBe("Accept");
    expect(Number(response.headers.get("x-markdown-tokens"))).toBeGreaterThan(
      0
    );
  });
});
