import { expect, test } from "@playwright/test";

test.describe("about", () => {
  test("shows the statement, the portrait, the story and a dated Now block", async ({
    page,
  }) => {
    await page.goto("/about");
    await expect(page).toHaveTitle("About — Harsh Virani");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Curious about how machines think. Precise about making them work."
    );
    await expect(page.locator("h1 em")).toHaveText("Precise");

    const portrait = page.getByRole("img", {
      name: "Portrait of Harsh Virani",
    });
    await expect(portrait).toBeVisible();
    await expect(portrait).toHaveAttribute("src", /\/_next\/image\?url=/);
    await expect
      .poll(() =>
        portrait.evaluate((img: HTMLImageElement) => img.naturalWidth)
      )
      .toBeGreaterThan(0);

    const story = page.locator("section", {
      has: page.getByRole("heading", { name: "01 — The story" }),
    });
    await expect(story.locator("p")).toHaveCount(4);
    await expect(story).toContainText("Hindi · Gujarati");
    for (const interest of ["Gaming", "Movies", "Cooking"]) {
      await expect(story).toContainText(interest);
    }

    const now = page.locator("section", {
      has: page.getByRole("heading", { name: "02 — Now" }),
    });
    await expect(now.locator("time")).toHaveAttribute("datetime", "2026-10-01");
    await expect(now.locator("dt")).toHaveText([
      "Researching",
      "Building",
      "Learning",
      "Looking for",
    ]);
  });

  test("links on to the work and the CV", async ({ page }) => {
    await page.goto("/about");
    const next = page.getByRole("navigation", { name: "03 — Next" });
    await expect(
      next.getByRole("link", { name: /See the work/ })
    ).toHaveAttribute("href", "/#work");
    await expect(
      next.getByRole("link", { name: /Download CV/ })
    ).toHaveAttribute("href", /harsh-virani-ai-ml-cv\.pdf$/);
  });

  test("the portrait wipes in and settles fully revealed", async ({ page }) => {
    await page.goto("/about");
    const figure = page.locator("main figure");
    await expect
      .poll(() => figure.evaluate((el) => getComputedStyle(el).clipPath))
      .toMatch(/inset\(0(%|px)? 0px 0px\)|none/);
  });

  test("the German page is translated and links the German CV", async ({
    page,
  }) => {
    await page.goto("/de/about");
    await expect(page.locator("h1 em")).toHaveText("Präzise");
    await expect(
      page.getByRole("img", { name: "Porträt von Harsh Virani" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "02 — Jetzt" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Lebenslauf herunterladen/ })
    ).toHaveAttribute("href", /harsh-virani-ai-ml-cv-de\.pdf$/);
  });

  test("does not scroll sideways", async ({ page }) => {
    await page.goto("/about");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
    );
    expect(overflow).toBe(false);
  });
});

test("the header links to the about page", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) await page.getByRole("button", { name: "Menu" }).click();
  await page
    .getByRole(isMobile ? "dialog" : "banner")
    .getByRole("link", { name: "About" })
    .click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
