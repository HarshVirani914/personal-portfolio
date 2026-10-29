import { expect, test } from "@playwright/test";

const EMAIL = "harshvirani.91@gmail.com";

test.describe("contact", () => {
  test("clicking Let's talk copies the email and confirms with copied", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    const contact = page.locator("#contact");
    await contact.scrollIntoViewIfNeeded();

    await expect(contact.getByRole("status")).toContainText(EMAIL);
    await contact.getByRole("button", { name: "Copy email address" }).click();
    await expect(contact.getByRole("status")).toContainText("copied to clipboard");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(EMAIL);
    await expect(contact.getByRole("status")).not.toContainText("copied to clipboard", { timeout: 5000 });
  });

  test("shows the address selected when the clipboard is unavailable", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    });
    await page.goto("/");
    const contact = page.locator("#contact");
    await contact.scrollIntoViewIfNeeded();
    await contact.getByRole("button", { name: "Copy email address" }).click();
    await expect(contact.getByRole("status")).toContainText("Copying is not available");
    await expect(contact.getByRole("status")).toContainText(EMAIL);
    expect(await page.evaluate(() => window.getSelection()?.toString())).toBe(EMAIL);
  });

  test("links to LinkedIn, GitHub and the CV, and shows availability", async ({ page }) => {
    await page.goto("/");
    const contact = page.locator("#contact");
    await expect(contact).toContainText("Open to working-student and full-time AI roles");
    await expect(contact.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", /linkedin\.com\/in\/harshvirani914/);
    await expect(contact.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", /github\.com\/HarshVirani914/);
    await expect(contact.getByRole("link", { name: /CV/ })).toHaveAttribute("href", /harsh-virani-ai-ml-cv\.pdf$/);
  });

  test("the footer shows copyright and coordinates and the name fits the viewport", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toContainText("Harsh Virani");
    await expect(footer).toContainText("50.32° N, 11.92° E");
    const fits = await footer.evaluate((el) => {
      const name = el.querySelector("[aria-hidden=true]") as HTMLElement;
      const range = document.createRange();
      range.selectNodeContents(name);
      const box = range.getBoundingClientRect();
      return box.left >= 0 && box.right <= document.documentElement.clientWidth;
    });
    expect(fits).toBe(true);
  });
});
