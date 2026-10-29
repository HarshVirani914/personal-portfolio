import { expect, test } from "@playwright/test";

const locales = [
  {
    prefix: "",
    experience: /Where I've\s+built/,
    education: /Still learning,\s+on record/,
    dean: "Dean's List 2025",
    mysy: "MYSY Scholarship",
  },
  {
    prefix: "/de",
    experience: /Wo ich\s+gebaut habe/,
    education: /Ich lerne weiter,\s+belegt/,
    dean: "Dean's List 2025",
    mysy: "MYSY-Stipendium",
  },
] as const;

for (const locale of locales) {
  test(`experience lists both roles and education shows degrees, tags and certifications (${locale.prefix || "en"})`, async ({
    page,
  }) => {
    await page.goto(`${locale.prefix}/`);
    const experience = page.locator("#experience");
    await experience.scrollIntoViewIfNeeded();
    await expect(experience.getByRole("heading", { level: 2 })).toContainText(
      locale.experience
    );
    await expect(experience.locator("[data-row=experience]")).toHaveCount(2);

    const education = page.locator("#education");
    await education.scrollIntoViewIfNeeded();
    await expect(education.getByRole("heading", { level: 2 })).toContainText(
      locale.education
    );
    await expect(education).toContainText(locale.dean);
    await expect(education).toContainText(locale.mysy);
    const certs = education
      .getByRole("link", { name: /Verify|Prüfen/ })
      .filter({ hasNotText: "List" });
    await expect(education.getByRole("link")).toHaveCount(3);
    const dean = education.getByRole("link", { name: new RegExp(locale.dean) });
    await expect(dean).toHaveAttribute(
      "href",
      /drive\.google\.com\/file\/d\/1IST7/
    );
    await expect(dean).toHaveAttribute("target", "_blank");
    await expect(certs.first()).toHaveAttribute("href", /oracle\.com/);
    await expect(certs.nth(1)).toHaveAttribute("href", /skilljar\.com/);
    await expect(education.getByText(locale.mysy)).not.toHaveAttribute("href");
  });
}

test("an experience row expands and collapses with the mouse and the keyboard", async ({
  page,
}) => {
  await page.goto("/");
  const section = page.locator("#experience");
  await section.scrollIntoViewIfNeeded();
  const toggle = section.getByRole("button", { name: /TechStaunch/ });
  const bullet = section.getByText("Pages loaded about 40% faster");

  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(bullet).toBeHidden();

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(bullet).toBeVisible();

  await toggle.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(bullet).toBeHidden();

  await toggle.press("Space");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
});

test("opening one experience row closes the other", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("#experience");
  await section.scrollIntoViewIfNeeded();
  const first = section.getByRole("button", { name: /Silver Spring/ });
  const second = section.getByRole("button", { name: /TechStaunch/ });
  await first.click();
  await second.click();
  await expect(first).toHaveAttribute("aria-expanded", "false");
  await expect(second).toHaveAttribute("aria-expanded", "true");
});

test("collapsed experience details are not reachable by keyboard", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#experience [inert]")).toHaveCount(2);
});
