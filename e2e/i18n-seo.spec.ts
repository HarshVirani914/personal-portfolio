import { expect, test } from "@playwright/test";

const paths = [
  "/",
  "/about",
  "/work/flag-and-fill",
  "/research/agents-in-the-grid",
];
const de = (path: string) => (path === "/" ? "/de" : `/de${path}`);

test.describe("languages and metadata", () => {
  for (const path of paths) {
    test(`${path} renders in both languages with alternates`, async ({
      page,
      request,
    }) => {
      for (const [url, lang] of [
        [path, "en"],
        [de(path), "de"],
      ] as const) {
        const response = await page.goto(url);
        expect(response?.status()).toBe(200);
        await expect(page.locator("html")).toHaveAttribute("lang", lang);
        const href = (selector: string) =>
          page.locator(selector).getAttribute("href");
        expect(new URL((await href('link[rel="canonical"]'))!).pathname).toBe(
          url
        );
        expect(new URL((await href('link[hreflang="de"]'))!).pathname).toBe(
          de(path)
        );
        expect(new URL((await href('link[hreflang="en"]'))!).pathname).toBe(
          path
        );
        expect(
          new URL((await href('link[hreflang="x-default"]'))!).pathname
        ).toBe(path);
        await expect(page.locator('meta[name="description"]')).toHaveAttribute(
          "content",
          /.+/
        );

        await expect(
          page.locator('meta[property="og:image:alt"]')
        ).toHaveAttribute("content", /.+/);
        await expect(
          page.locator('meta[property="og:image:width"]')
        ).toHaveAttribute("content", "1200");
        await expect(
          page.locator('meta[property="og:image:height"]')
        ).toHaveAttribute("content", "630");

        const image = await page
          .locator('meta[property="og:image"]')
          .getAttribute("content");
        const { pathname, search } = new URL(image!);
        const card = await request.get(`${pathname}${search}`);
        expect(card.status()).toBe(200);
        expect(card.headers()["content-type"]).toBe("image/png");
      }
    });
  }

  test("each page has its own social image", async ({ page }) => {
    const images = new Set<string>();
    for (const path of paths.flatMap((path) => [path, de(path)])) {
      await page.goto(path);
      images.add(
        (await page
          .locator('meta[property="og:image"]')
          .getAttribute("content"))!
      );
    }
    expect(images.size).toBe(paths.length * 2);
  });

  for (const path of paths.slice(1)) {
    test(`language switch stays on ${path}`, async ({ page, isMobile }) => {
      await page.goto(path);
      if (isMobile) await page.getByRole("button", { name: "Menu" }).click();
      await page.getByRole("link", { name: "DE", exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${de(path)}$`));
      await expect(page.locator("html")).toHaveAttribute("lang", "de");
    });
  }

  test("an unknown page says so in the visitor's language", async ({
    page,
  }) => {
    const english = await page.goto("/nope");
    expect(english?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Nothing here."
    );

    const german = await page.goto("/de/nope");
    expect(german?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Hier ist nichts."
    );
  });

  test("the sitemap lists every page in both languages", async ({
    request,
  }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const path of paths) {
      expect(xml).toContain(`${path === "/" ? "" : path}</loc>`);
      expect(xml).toContain(`${de(path)}</loc>`);
    }
  });

  test("icons and the manifest are in place", async ({ page, request }) => {
    await page.goto("/");
    await expect(
      page.locator('link[rel="icon"][type="image/svg+xml"]')
    ).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);

    const manifest = await (await request.get("/manifest.webmanifest")).json();
    expect(manifest.name).toBe("Harsh Virani");
    for (const icon of manifest.icons) {
      expect((await request.get(icon.src)).status()).toBe(200);
    }
  });

  test("robots keeps the Studio out of search", async ({ request }) => {
    const text = await (await request.get("/robots.txt")).text();
    expect(text).toContain("Disallow: /studio");
    expect(text).toContain("/sitemap.xml");
  });
});
