import { expect, test, type Page } from "@playwright/test";

const paths = [
  "/",
  "/about",
  "/work/flag-and-fill",
  "/research/agents-in-the-grid",
  "/de",
];

/** Text in the page that a visitor cannot see because it is stuck transparent. */
const hiddenText = (page: Page) =>
  page.locator("main").evaluate((main) =>
    [...main.querySelectorAll<HTMLElement>("h1, h2, h3, p, li")]
      .filter((el) => {
        if (!el.innerText?.trim() || el.closest("[aria-hidden='true']")) {
          return false;
        }
        if (el.closest("[inert]") || !el.checkVisibility()) return false;
        let node: HTMLElement | null = el;
        while (node) {
          if (Number(getComputedStyle(node).opacity) < 0.05) return true;
          node = node.parentElement;
        }
        return false;
      })
      .map((el) => `${el.tagName}: ${el.innerText.slice(0, 60)}`)
  );

test.describe("before scripts run", () => {
  test.use({ javaScriptEnabled: false });

  for (const path of paths) {
    test(`${path} shows its content`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1").first()).toBeVisible();
      await page.waitForTimeout(1500);
      expect(await hiddenText(page)).toEqual([]);
    });
  }
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  for (const path of paths) {
    test(`${path} runs no animation and no smooth scroll`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      const running = await page.evaluate(() =>
        document
          .getAnimations()
          .filter(
            (animation) =>
              animation instanceof CSSAnimation &&
              animation.playState === "running"
          )
          .map((animation) => (animation as CSSAnimation).animationName)
      );
      expect(running).toEqual([]);
      await expect(page.locator("html")).not.toHaveClass(/lenis/);
    });
  }
});
