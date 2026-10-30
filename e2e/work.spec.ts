import { expect, test } from "@playwright/test";

const projects = [
  {
    slug: "flag-and-fill",
    en: "Flag & Fill",
    de: "Flag & Fill",
    next: "pocketpulse",
  },
  {
    slug: "pocketpulse",
    en: "PocketPulse",
    de: "PocketPulse",
    next: "support-agent",
  },
  {
    slug: "support-agent",
    en: "Support agent",
    de: "Support-Agent",
    next: "ssri",
  },
  {
    slug: "ssri",
    en: "SSRI platform",
    de: "SSRI-Plattform",
    next: "flag-and-fill",
  },
] as const;

const locales = [
  { prefix: "", key: "en" },
  { prefix: "/de", key: "de" },
] as const;

for (const locale of locales) {
  test(`selected work lists the four projects newest first (${locale.key})`, async ({
    page,
    isMobile,
  }) => {
    await page.goto(`${locale.prefix}/`);
    const section = page.locator("#work");
    await section.scrollIntoViewIfNeeded();
    const names = isMobile
      ? section.locator("button[aria-expanded] span.font-serif")
      : section.locator("a[href*='/work/'] > span.font-serif");
    await expect(names).toHaveText(projects.map((p) => p[locale.key]));
  });

  test(`Flag & Fill figure answers the keyboard (${locale.key})`, async ({
    page,
  }) => {
    await page.goto(`${locale.prefix}/work/flag-and-fill`);
    const figure = page.getByTestId("project-figure");
    await figure.focus();
    // Keys pressed before hydration do nothing, so retry the first one.
    await expect(async () => {
      await page.keyboard.press("Home");
      await expect(figure).toHaveAttribute("aria-valuenow", "0", {
        timeout: 200,
      });
    }).toPass();
    await page.keyboard.press("ArrowRight");
    await expect(figure).toHaveAttribute("aria-valuenow", "1");
    await page.keyboard.press("End");
    await expect(figure).toHaveAttribute("aria-valuetext", /8\/8 · 2 /);
    await page.keyboard.press("Space");
    await expect(figure).toHaveAttribute("aria-valuetext", /8\/8 · 1 /);
  });

  for (const project of projects) {
    test(`project page ${project.slug} renders and links onward (${locale.key})`, async ({
      page,
    }) => {
      await page.goto(`${locale.prefix}/work/${project.slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("main")).toContainText(project[locale.key]);
      await expect(page.getByTestId("project-figure")).toBeVisible();

      const nextTitle = projects.find((p) => p.slug === project.next)![
        locale.key
      ];
      await page
        .getByRole("link", { name: new RegExp(`${nextTitle}\\s*→`) })
        .click();
      await expect(page).toHaveURL(new RegExp(`/work/${project.next}$`));
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }
}

test("an unknown project slug returns not found", async ({ page }) => {
  const response = await page.goto("/work/does-not-exist");
  expect(response?.status()).toBe(404);
});

test("flag & fill does not claim full automation or production use", async ({
  page,
}) => {
  await page.goto("/work/flag-and-fill");
  const text = (await page.getByRole("main").innerText()).toLowerCase();
  expect(text).not.toMatch(
    /fully automat|zero-touch|in production|in daily use/
  );
  expect(text).toContain("delivered as source code");
});

test("a live project links out and a delivered one does not", async ({
  page,
}) => {
  await page.goto("/work/pocketpulse");
  await expect(page.getByRole("link", { name: /visit live/i })).toHaveAttribute(
    "href",
    "https://pocketpulse.me"
  );
  await page.goto("/work/flag-and-fill");
  await expect(page.getByRole("link", { name: /visit live/i })).toHaveCount(0);
});

test("desktop hover reveals the project card", async ({ page, isMobile }) => {
  test.skip(isMobile, "hover card is desktop-only");
  await page.goto("/");
  const row = page.getByRole("link", { name: /^\d+ PocketPulse/ });
  await row.scrollIntoViewIfNeeded();
  const card = row.getByTestId("hover-card");
  await expect(card).toHaveCSS("opacity", "0");
  await row.hover();
  await expect(card).toHaveCSS("opacity", "1");
  await expect(card).toContainText("installable expense tracker");
});

test("desktop hover card follows the cursor inside the row", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "hover card is desktop-only");
  await page.goto("/");
  const row = page.getByRole("link", { name: /^\d+ PocketPulse/ });
  await row.scrollIntoViewIfNeeded();
  const box = (await row.boundingBox())!;
  const card = row.getByTestId("hover-card");
  await page.mouse.move(box.x + 120, box.y + box.height / 2);
  await page.mouse.move(box.x + 160, box.y + box.height / 2, { steps: 4 });
  await expect(card).toHaveCSS("opacity", "1");
  await page.waitForTimeout(600);
  const first = (await card.boundingBox())!;
  await page.mouse.move(box.x + 700, box.y + box.height / 2, { steps: 10 });
  await page.waitForTimeout(600);
  const second = (await card.boundingBox())!;
  expect(second.x - first.x).toBeGreaterThan(300);
  expect(second.x + second.width).toBeLessThanOrEqual(box.x + box.width + 1);
});

test("mobile tap expands the card and Open case navigates", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "tap-to-expand is mobile-only");
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /PocketPulse/ });
  await toggle.scrollIntoViewIfNeeded();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("link", { name: /Open case/ }).click();
  await expect(page).toHaveURL(/\/work\/pocketpulse$/);
});

test("project accents stay inside the row and the page", async ({ page }) => {
  await page.goto("/work/flag-and-fill");
  await expect(page.locator("main.project-accent")).toBeVisible();
  await page.goto("/");
  await expect(page.locator("main.project-accent")).toHaveCount(0);
  await expect(page.locator("#work li.project-accent")).toHaveCount(4);
});
