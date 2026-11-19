import { expect, openPage, test } from "./fixtures.ts";

const PAGES = ["/core/entrypoint", "/core/file", "/core/projects", "/core/activity", "/core/cv", "/core/uplink"];

for (const path of PAGES)
  test(`has no horizontal scroll on ${path}`, async ({ page }) => {
    await openPage(page, path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

test("opening settings closes the mobile menu", async ({ page }) => {
  await openPage(page, "/core/entrypoint");
  await page.locator(".menu-toggle").click();
  await expect(page.locator(".mobile-menu")).toBeVisible();
  await page.locator(".cyber-settings [aria-haspopup]").click();
  await expect(page.locator(".settings-panel")).toBeVisible();
  await expect(page.locator(".mobile-menu")).toHaveCount(0);
});
