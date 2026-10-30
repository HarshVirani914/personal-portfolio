import { expect, test } from "@playwright/test";

test.describe("site shell", () => {
  for (const { path, lang, work } of [
    { path: "/", lang: "en", work: "Work" },
    { path: "/de", lang: "de", work: "Arbeiten" },
  ]) {
    test(`home renders in ${lang}`, async ({ page, isMobile }) => {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(
        page.getByRole("heading", { level: 1, name: "Harsh Virani" })
      ).toBeVisible();
      if (isMobile)
        await page.getByRole("button", { name: /Menu|Menü/ }).click();
      await expect(
        page.getByRole("link", { name: new RegExp(`^${work}`) }).first()
      ).toBeVisible();
    });
  }

  test("/en redirects to the unprefixed URL", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveURL(/\/$/);
  });

  test("language switch keeps the page", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("link", { name: "DE", exact: true }).click();
    await expect(page).toHaveURL(/\/de$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
  });

  test("theme follows the system and can be toggled", async ({
    page,
    isMobile,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/dark/);
    if (isMobile) await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("button", { name: "Switch to light theme" }).click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });

  test("mobile menu opens and closes", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: /Close/ }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("reduced motion shows the name without animation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const letter = page.locator("h1 [aria-hidden] span").first();
    await expect(letter).toHaveCSS("transform", "none");
  });
});
