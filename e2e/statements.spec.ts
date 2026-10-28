import { expect, test } from "@playwright/test";

const first = { "/": "I build agents that hold up outside the demo.", "/de": "Ich baue Agenten, die auch außerhalb der Demo bestehen." };
const last = { "/": "Now: open to AI engineering roles in Germany.", "/de": "Jetzt: offen für KI-Engineering-Stellen in Deutschland." };

for (const path of ["/", "/de"] as const) {
  test(`statements step through on scroll (${path})`, async ({ page }) => {
    await page.goto(path);
    const section = page.locator("section[aria-label]").nth(1);
    const top = await section.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    const height = await section.evaluate((el) => el.getBoundingClientRect().height);

    await page.evaluate((y) => window.scrollTo(0, y + 10), top);
    await expect(page.locator("p[data-active=true]")).toHaveText(first[path]);
    await expect(page.getByTestId("statements-counter")).toHaveText("01");

    await page.evaluate((y) => window.scrollTo(0, y), top + height - (await page.evaluate(() => window.innerHeight)) - 10);
    await expect(page.locator("p[data-active=true]")).toHaveText(last[path]);
    await expect(page.getByTestId("statements-counter")).toHaveText("04");
  });
}

test("reduced motion shows every statement as plain text", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("listitem").filter({ hasText: first["/"] })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: last["/"] })).toBeVisible();
  await expect(page.getByTestId("statements-progress")).toBeHidden();
});
