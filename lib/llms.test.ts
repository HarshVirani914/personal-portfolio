import { describe, expect, it } from "vitest";
import { createContent } from "@/lib/content";
import { createFixtureSource } from "@/lib/content/fixture";
import { llmsIndex } from "@/lib/llms";

const site = "https://example.com";
const content = createContent(createFixtureSource());

const index = async () => {
  const [settings, projects, research] = await Promise.all([
    content.getSiteSettings("en"),
    content.getProjects("en"),
    content.getResearch("en"),
  ]);
  return { text: llmsIndex({ settings, projects, research, site }), projects };
};

describe("llmsIndex", () => {
  it("opens with the required title and a summary", async () => {
    const { text } = await index();
    const [title, , summary] = text.split("\n");
    expect(title).toBe("# Harsh Virani");
    expect(summary).toMatch(/^> .+/);
  });

  it("links every project by absolute URL", async () => {
    const { text, projects } = await index();
    for (const project of projects) {
      expect(text).toContain(
        `[${project.title}](${site}/work/${project.slug}): ${project.oneLiner}`
      );
    }
  });

  it("points at the full file and leaves no empty note", async () => {
    const { text } = await index();
    expect(text).toContain(`(${site}/llms-full.txt)`);
    expect(text).not.toMatch(/\): $/m);
  });
});
