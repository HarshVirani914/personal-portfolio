import { expect, test } from "@playwright/test";

test.describe("hero from content", () => {
  test("annotations render and the city reveals on tap", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");
    await expect(page.getByText("[01] AI engineer")).toBeVisible();
    await expect(page.getByText("[03] M.Sc. AI & Robotics")).toBeVisible();
    await page.getByRole("button", { name: /50\.32° N/ }).click();
    await expect(page.getByText("Hof, Germany").first()).toBeVisible();
    if (isMobile)
      await expect(page.getByRole("button", { name: /Menu/ })).toBeVisible();
  });

  test("German annotations come from the German values", async ({ page }) => {
    await page.goto("/de");
    await expect(page.getByText("[01] KI-Ingenieur")).toBeVisible();
  });

  test("clicking a command runs it", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "stack", exact: true }).click();
    await expect(page.getByTestId("terminal-command")).toHaveText(
      "cat stack.txt"
    );
    await expect(page.getByText("agents · rag · llm evals")).toBeVisible();
  });

  test("the terminal cycles on its own", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("terminal-command")).toHaveText(
      "echo $MISSION",
      { timeout: 8000 }
    );
    await expect(page.getByTestId("terminal-command")).toHaveText("whoami", {
      timeout: 15000,
    });
  });

  test("reduced motion shows the full command and output at once", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.getByTestId("terminal-command")).toHaveText(
      "echo $MISSION"
    );
    await expect(
      page.getByText("building agents that actually work")
    ).toBeVisible();
  });
});
