import { expect, test, type Page } from "@playwright/test";

const schemaTypes = async (page: Page) => {
  const json = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  return json.flatMap((text) =>
    (JSON.parse(text)["@graph"] as { "@type": string }[]).map(
      (schema) => schema["@type"]
    )
  );
};

test.describe("machine-readable content", () => {
  for (const [path, type] of [
    ["/", "Person"],
    ["/about", "ProfilePage"],
    ["/work/flag-and-fill", "CreativeWork"],
    ["/research/agents-in-the-grid", "Thesis"],
    ["/de/about", "ProfilePage"],
  ] as const) {
    test(`${path} carries ${type} structured data`, async ({ page }) => {
      await page.goto(path);
      const types = await schemaTypes(page);
      expect(types).toContain("Person");
      expect(types).toContain(type);
    });
  }

  test("every page links to the llms.txt guide", async ({ page }) => {
    await page.goto("/about");
    const link = page.locator('link[rel="alternate"][type="text/markdown"]');
    expect(new URL((await link.getAttribute("href"))!).pathname).toBe(
      "/llms.txt"
    );
  });

  test("llms.txt lists the site and llms-full.txt adds the detail", async ({
    request,
  }) => {
    const index = await request.get("/llms.txt");
    expect(index.status()).toBe(200);
    expect(index.headers()["content-type"]).toContain("text/plain");
    const guide = await index.text();
    expect(guide).toMatch(/^# Harsh Virani/);
    expect(guide).toContain("/work/flag-and-fill");

    const full = await request.get("/llms-full.txt");
    expect(full.status()).toBe(200);
    const detail = await full.text();
    expect(detail).toContain("/work/flag-and-fill");
    expect(detail).toContain("## Experience");
  });
});
