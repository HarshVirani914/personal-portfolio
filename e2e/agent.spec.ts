import { expect, test, type Page } from "@playwright/test";

const stream = (slug: string, label: string) =>
  [
    { type: "start", projects: 4, research: 3 },
    { type: "outcome", outcome: "answer" },
    { type: "text", text: "He built a customs agent " },
    {
      type: "citation",
      item: {
        slug,
        kind: "project",
        label,
        href: `/work/${slug}`,
        accent: { light: "#a33a6b", dark: "#e07aa8" },
      },
    },
    { type: "text", text: " that flags what to check." },
    { type: "done" },
  ]
    .map((event) => JSON.stringify(event))
    .join("\n");

const mockAgent = (page: Page) =>
  page.route("**/api/agent", (route) =>
    route.fulfill({
      contentType: "application/x-ndjson",
      body: `${stream("flag-and-fill", "01 Flag & Fill")}\n`,
    })
  );

const openFromHero = (page: Page) =>
  page.getByRole("button", { name: /^Ask me anything/ }).click();

test.describe("agent overlay", () => {
  test("streams an answer, follows a citation and leaves the overlay", async ({
    page,
  }) => {
    await mockAgent(page);
    await page.goto("/");
    await openFromHero(page);

    const dialog = page.getByRole("dialog", { name: /Ask my agent/ });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("textbox").fill("What has he built?");
    await dialog.getByRole("textbox").press("Enter");

    await expect(
      dialog.getByRole("heading", { name: "What has he built?" })
    ).toBeVisible();
    await expect(dialog).toContainText("that flags what to check.");
    await expect(dialog).toContainText("1 source");

    await dialog.getByRole("link", { name: "01 Flag & Fill" }).click();
    await expect(page).toHaveURL(/\/work\/flag-and-fill$/);
    await expect(dialog).toBeHidden();
  });

  test("a suggested question asks itself and Esc closes", async ({ page }) => {
    await mockAgent(page);
    await page.goto("/");
    await openFromHero(page);

    const dialog = page.getByRole("dialog", { name: /Ask my agent/ });
    await dialog.getByRole("button", { name: /thesis/i }).click();
    await expect(dialog).toContainText("1 source");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("the keyboard shortcut opens it and traps focus", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Phones have no keyboard shortcut");
    await page.goto("/");
    // The shortcut listens once the page has hydrated.
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("ControlOrMeta+k");

    const dialog = page.getByRole("dialog", { name: /Ask my agent/ });
    await expect(dialog.getByRole("textbox")).toBeFocused();
    for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");
    await expect
      .poll(() =>
        page.evaluate(() =>
          Boolean(document.activeElement?.closest("[data-agent-overlay]"))
        )
      )
      .toBe(true);
  });

  test("the research page asks about itself", async ({ page }) => {
    await mockAgent(page);
    await page.goto("/");
    const href = await page
      .locator('a[href^="/research/"]')
      .first()
      .getAttribute("href");
    await page.goto(href!);
    await page.getByRole("button", { name: /Ask about this/ }).click();

    const dialog = page.getByRole("dialog", { name: /Ask my agent/ });
    await expect(
      dialog.getByRole("heading", { name: /^Tell me about/ })
    ).toBeVisible();
    await expect(dialog).toContainText("1 source");
  });

  test("the notice stays dismissed", async ({ page }) => {
    await page.goto("/");
    await openFromHero(page);
    const dialog = page.getByRole("dialog", { name: /Ask my agent/ });
    await expect(dialog).toContainText("logged anonymously");
    await dialog.getByRole("button", { name: "Dismiss notice" }).click();
    await expect(dialog).not.toContainText("logged anonymously");

    await page.reload();
    await openFromHero(page);
    await expect(dialog).toBeVisible();
    await expect(dialog).not.toContainText("logged anonymously");
  });

  test("a failed request says the agent is resting", async ({ page }) => {
    await page.route("**/api/agent", (route) =>
      route.fulfill({ status: 503, json: { error: "unavailable" } })
    );
    await page.goto("/");
    await openFromHero(page);
    const dialog = page.getByRole("dialog", { name: /Ask my agent/ });
    await dialog.getByRole("textbox").fill("Hello?");
    await dialog.getByRole("textbox").press("Enter");
    await expect(dialog).toContainText("resting");
  });

  test("German pages ask in German", async ({ page }) => {
    await page.goto("/de");
    await page.getByRole("button", { name: /^Frag mich alles/ }).click();
    await expect(
      page.getByRole("dialog", { name: /Frag meinen Agenten/ })
    ).toBeVisible();
  });

  test("none of the overlay ships in the first page's scripts", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    const sources = await page
      .locator("script[src]")
      .evaluateAll((scripts) =>
        scripts.map((script) => (script as HTMLScriptElement).src)
      );
    expect(sources.length).toBeGreaterThan(0);
    for (const source of sources) {
      const body = await (await request.get(source)).text();
      expect(body).not.toContain("data-agent-overlay");
    }
  });
});
