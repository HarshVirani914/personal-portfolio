import { expect, test } from "@playwright/test";

const scrollY = (page: import("@playwright/test").Page) => page.evaluate(() => Math.round(window.scrollY));

test("browser back from a project returns to the same scroll position", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop rows are links; mobile rows expand first");
  await page.goto("/");
  const row = page.getByRole("link", { name: /Support agent, open case study/i });
  await row.scrollIntoViewIfNeeded();
  const before = await scrollY(page);
  await row.click();
  await expect(page).toHaveURL(/\/work\/support-agent$/);
  await page.goBack();
  await expect(page).not.toHaveURL(/\/work\//);
  await expect.poll(() => scrollY(page)).toBeGreaterThan(before - 5);
  expect(Math.abs((await scrollY(page)) - before)).toBeLessThan(5);
});

test("back from a nav hash link returns to where the visitor was, not the section", async ({ page, isMobile }) => {
  test.skip(isMobile, "nav links sit behind the mobile menu");
  await page.goto("/");
  await page.getByRole("link", { name: "Work", exact: true }).first().click();
  await expect.poll(() => scrollY(page)).toBeGreaterThan(300);
  await page.goBack();
  await expect.poll(() => scrollY(page)).toBe(0);
  await page.goForward();
  await expect.poll(() => scrollY(page)).toBeGreaterThan(300);
});
