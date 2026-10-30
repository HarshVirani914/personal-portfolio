import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const blocking = ["critical", "serious"];
const themes = ["dark", "light"] as const;

const findViolations = async (page: Page) => {
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations
    .filter(({ impact }) => impact && blocking.includes(impact))
    .map(({ id, impact, nodes }) => ({
      path: new URL(page.url()).pathname,
      id,
      impact,
      targets: nodes.map(({ target }) => target.join(" ")),
    }));
};

const expectNone = async (
  found: Awaited<ReturnType<typeof findViolations>>,
  testInfo: TestInfo
) => {
  if (found.length > 0) {
    await testInfo.attach("violations", {
      body: JSON.stringify(found, null, 2),
      contentType: "application/json",
    });
  }
  expect(found).toEqual([]);
};

const sitemapPaths = async (page: Page) => {
  const response = await page.request.get("/sitemap.xml");
  const urls = [...(await response.text()).matchAll(/<loc>(.+?)<\/loc>/g)];
  return urls.map(([, url]) => new URL(url!).pathname);
};

for (const colorScheme of themes) {
  test.describe(`accessibility in the ${colorScheme} theme`, () => {
    test.use({ colorScheme, reducedMotion: "reduce" });
    test.describe.configure({ timeout: 180_000 });

    test("every route in the sitemap", async ({ page }, testInfo) => {
      const paths = await sitemapPaths(page);
      expect(paths.length).toBeGreaterThan(0);
      const found = [];
      for (const path of paths) {
        await page.goto(path, { waitUntil: "networkidle" });
        found.push(...(await findViolations(page)));
      }
      await expectNone(found, testInfo);
    });

    test("the 404 page", async ({ page }, testInfo) => {
      await page.goto("/no-such-page");
      await expectNone(await findViolations(page), testInfo);
    });
  });
}
