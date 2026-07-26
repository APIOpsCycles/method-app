import { expect, test } from "@playwright/test";

test("home page introduces the APIOps Cycles method", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Stakeholder-Guided APIOps Cycles Method/);
  await expect(page.locator("main")).toBeVisible();
});
