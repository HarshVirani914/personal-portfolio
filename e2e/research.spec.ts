import { expect, test } from "@playwright/test";

const items = [
  {
    slug: "agents-in-the-grid",
    title: { en: "Agents in the Grid", de: "Agenten im Raster" },
    next: "evolving-ecosystem-of-llms",
  },
  {
    slug: "evolving-ecosystem-of-llms",
    title: {
      en: "The evolving ecosystem of large language models",
      de: "Das sich wandelnde Ökosystem großer Sprachmodelle",
    },
    next: "ai-augmented-low-code",
  },
  {
    slug: "ai-augmented-low-code",
    title: {
      en: "AI-augmented low-code and no-code platforms",
      de: "KI-gestützte Low-Code- und No-Code-Plattformen",
    },
    next: "agents-in-the-grid",
  },
] as const;

const locales = [
  { prefix: "", key: "en" },
  { prefix: "/de", key: "de" },
] as const;

for (const locale of locales) {
  test(`the research section leads with the thesis and lists both papers (${locale.key})`, async ({
    page,
  }) => {
    await page.goto(`${locale.prefix}/`);
    const section = page.locator("#research");
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole("heading", { level: 3 })).toHaveCount(2); // thesis title + "Papers" label
    const links = section.locator("a[href*='/research/']:not([download])");
    await expect(links).toHaveCount(3);
    const hrefs = await links.evaluateAll((els) =>
      els.map((el) => el.getAttribute("href"))
    );
    expect(hrefs).toEqual(
      items.map((item) => `${locale.prefix}/research/${item.slug}`)
    );
    await expect(section.locator("li").first()).toContainText(
      locale.key === "en" ? "in preparation" : "in Vorbereitung"
    );
  });

  for (const item of items) {
    test(`research page ${item.slug} renders and links onward (${locale.key})`, async ({
      page,
    }) => {
      await page.goto(`${locale.prefix}/research/${item.slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        item.title[locale.key]
      );
      await expect(page.locator("#abstract")).toBeVisible();
      await expect(page.locator("#references")).toBeAttached();
      await expect(page.getByTestId("reading-progress")).toBeAttached();

      const next = items.find((i) => i.slug === item.next)!;
      await page
        .getByRole("link", {
          name: new RegExp(`${next.title[locale.key]}\\s*→`),
        })
        .click();
      await expect(page).toHaveURL(new RegExp(`/research/${next.slug}$`));
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }
}

test("an unknown research slug returns not found", async ({ page }) => {
  const response = await page.goto("/research/does-not-exist");
  expect(response?.status()).toBe(404);
});

test("paper PDFs download from the content", async ({ page, request }) => {
  await page.goto("/");
  const pdfs = page.locator("#research a[download]");
  await expect(pdfs).toHaveCount(2);
  for (const href of await pdfs.evaluateAll((els) =>
    els.map((el) => el.getAttribute("href") ?? "")
  )) {
    const response = await request.get(href);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("pdf");
  }
  await page.goto("/research/agents-in-the-grid");
  await expect(page.locator("main a[download]")).toHaveCount(0);
  await page.goto("/research/ai-augmented-low-code");
  await expect(page.locator("main a[download]")).toHaveAttribute(
    "href",
    /\.pdf$/
  );
});

test("the reading progress line fills as the page is read", async ({
  page,
}) => {
  await page.goto("/research/agents-in-the-grid");
  const bar = page.getByTestId("reading-progress");
  await expect(bar).toHaveAttribute("aria-valuenow", "0");
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight)
  );
  await expect(bar).toHaveAttribute("aria-valuenow", "100");
});

test("the contents rail follows the section being read", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "the rail is desktop-only");
  await page.goto("/research/agents-in-the-grid");
  const rail = page.getByRole("navigation", { name: "Contents" });
  await expect(rail.locator("[aria-current]")).toContainText("Abstract");
  await page
    .locator("#s-the-plan")
    .evaluate((el) =>
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 150)
    );
  await expect(rail.locator("[aria-current]")).toContainText(
    "The planned harness"
  );
  await page
    .locator("#s-the-study")
    .evaluate((el) =>
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 150)
    );
  await expect(rail.locator("[aria-current]")).toContainText(
    "The planned study"
  );
});

test("the mobile contents dropdown jumps to a section", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "the dropdown is mobile-only");
  await page.goto("/research/agents-in-the-grid");
  await expect(page.getByRole("navigation", { name: "Contents" })).toHaveCount(
    0
  );
  await page.getByRole("button", { name: "Jump to section" }).click();
  await page.getByRole("link", { name: /The planned harness/ }).click();
  await expect
    .poll(() =>
      page
        .locator("#s-the-plan")
        .evaluate((el) => el.getBoundingClientRect().top)
    )
    .toBeLessThan(250);
  await expect(
    page.getByRole("button", { name: "Jump to section" })
  ).toContainText("The planned harness");
});

test("side notes sit in the margin on desktop and open on tap on mobile", async ({
  page,
  isMobile,
}) => {
  await page.goto("/research/agents-in-the-grid");
  const note = "Spreadsheets only, for now";
  if (isMobile) {
    await expect(page.getByText(note)).toHaveCount(1);
    await expect(page.getByText(note)).toBeHidden();
    const toggle = page.getByRole("button", { name: /Show note 1/ });
    await toggle.scrollIntoViewIfNeeded();
    await toggle.click();
    await expect(
      page.getByRole("button", { name: /Hide note 1/ })
    ).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#note-1")).toContainText(note);
    await expect(page.locator("#note-1")).toBeVisible();
  } else {
    await expect(
      page.getByRole("complementary", { name: "Note 1" })
    ).toContainText(note);
    await expect(
      page.getByRole("complementary", { name: "Note 1" })
    ).toBeVisible();
  }
});

test("cite copies the citation text", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "clipboard permissions are chromium-only"
  );
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/research/agents-in-the-grid");
  await page.getByRole("button", { name: /^Cite/ }).click();
  await expect(page.getByRole("button", { name: /^Copied/ })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "Deep research LLM agents"
  );
});

test("numbered references link from the text and the figure slot is present", async ({
  page,
}) => {
  await page.goto("/research/agents-in-the-grid");
  await expect(page.locator("#ref-1")).toContainText("SpreadsheetBench");
  await expect(page.locator("#ref-2")).toContainText("SWE-agent");
  await expect(
    page.getByRole("link", { name: "References 1" })
  ).toHaveAttribute("href", "#ref-1");
  await expect(page.getByTestId("research-figure")).toBeVisible();
  await expect(
    page.getByTestId("research-figure").locator("figcaption")
  ).toContainText("Fig. 1");
});

test("the research accent stays on the research page", async ({ page }) => {
  await page.goto("/research/agents-in-the-grid");
  await expect(page.locator("main.project-accent")).toBeVisible();
  await page.goto("/");
  await expect(page.locator("main.project-accent")).toHaveCount(0);
});
