import { expect, test } from "@playwright/test";

const locales = [
  { prefix: "", heading: /Tools I reach for/, hover: /Hover or focus a skill/ },
  { prefix: "/de", heading: /Werkzeuge, nach denen ich greife/, hover: /Fähigkeit anzeigen/ },
] as const;

for (const locale of locales) {
  test(`the skills section shows four groups (${locale.prefix || "en"})`, async ({ page }) => {
    await page.goto(`${locale.prefix}/`);
    const section = page.locator("#skills");
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole("heading", { level: 2 })).toContainText(locale.heading);
    await expect(section.getByRole("heading", { level: 3 })).toHaveCount(4);
    await expect(section.getByRole("button")).toHaveCount(18);
  });
}

test("hovering or focusing a skill shows its note tinted by the linked project", async ({ page, isMobile }) => {
  test.skip(isMobile, "hover and keyboard focus are desktop-only");
  await page.goto("/");
  const section = page.locator("#skills");
  const panel = section.locator("[aria-live=polite]");
  await section.scrollIntoViewIfNeeded();
  await expect(panel).toContainText("Hover or focus a skill");

  await section.getByRole("button", { name: "LangGraph" }).hover();
  await expect(panel).toContainText("12-step pipeline");
  const tinted = await panel.locator("p").evaluate((el) => getComputedStyle(el).color);
  expect(tinted).toBe("rgb(163, 58, 107)");

  await section.getByRole("button", { name: "LangChain" }).focus();
  await expect(panel).toContainText("client servers");
  const muted = await panel.locator("p").evaluate((el) => getComputedStyle(el).color);
  expect(muted).not.toBe(tinted);
});

test("keyboard focus reveals the note like hover", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard focus is desktop-only");
  await page.goto("/");
  const section = page.locator("#skills");
  await section.getByRole("button", { name: "PWA" }).focus();
  await expect(section.locator("[aria-live=polite]")).toContainText("works offline");
});

test("tapping a chip opens its note under the group on mobile", async ({ page, isMobile }) => {
  test.skip(!isMobile, "tap chips are mobile-only");
  await page.goto("/");
  const section = page.locator("#skills");
  await expect(section.getByText("Tap a skill to see where I used it.")).toBeVisible();
  const chip = section.getByRole("button", { name: "PWA" });
  await chip.scrollIntoViewIfNeeded();
  await chip.tap();
  await expect(section.locator("p:visible", { hasText: "PocketPulse installs on a phone" })).toHaveCount(1);
  await expect(chip).toHaveAttribute("aria-pressed", "true");
});
