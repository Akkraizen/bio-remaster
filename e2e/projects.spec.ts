import { expect, openPage, test } from "./fixtures.ts";

test("filters projects by search query", async ({ page }) => {
  await openPage(page, "/core/projects");
  await page.locator(".search-input").fill("music");
  await expect(page.locator(".project-item")).toHaveCount(1);
  await expect(page.locator(".project-item")).toContainText("Wavedot");
  await expect(page).toHaveURL(/q=music/);
});

test("opens projects of a timeline year", async ({ page }) => {
  await openPage(page, "/core/file");
  await page.locator("#timeline-2024 .year-link").click();
  await expect(page).toHaveURL(/\/core\/projects\?year=2024$/);
  await expect(page.locator(".project-item")).toHaveCount(3);
  await expect(page.locator(".chip.active")).toHaveText("2024");
});

test("links a project to its timeline stage", async ({ page }) => {
  await openPage(page, "/core/projects/002");
  const years = page.locator(".project-years .year-chip");
  await expect(years).toHaveText(["2025", "2026"]);
  await years.first().click();
  await expect(page).toHaveURL(/\/core\/file#timeline-2025$/);
  await expect(page.locator("#timeline-2025")).toBeInViewport();
});

test("opens the project image in a lightbox", async ({ page }) => {
  await openPage(page, "/core/projects/001");
  await page.locator(".image-zoom").click();
  const lightbox = page.getByRole("dialog", { name: "Berill" });
  await expect(lightbox.locator(".lightbox-image")).toHaveClass(/loaded/);
  await page.keyboard.press("Escape");
  await expect(lightbox).toHaveCount(0);
  await expect(page.locator(".image-zoom")).toBeFocused();
});
