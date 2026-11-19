import { expect, openPage, test } from "./fixtures.ts";

test.use({ site: { locale: "ru", motion: "reduced", achievements: [] } });

test("renders the CV from the PDF", async ({ page }) => {
  await openPage(page, "/core/cv");
  await expect(page.locator(".section-title")).toHaveText([/О себе/, /Навыки/, /Проекты/, /Образование/, /Дополнительно/]);
  await expect(page.locator(".project-title").nth(1)).toContainText("Berill");
  for (const section of await page.locator(".cv-section").all()) await expect(section).not.toContainText("[");
});

test("downloads the PDF file", async ({ page }) => {
  await openPage(page, "/core/cv");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator(".profile-actions .cyber-button").first().click()
  ]);
  expect(download.suggestedFilename()).toBe("Akkraizen-CV-ru.pdf");
});

test("prints without site chrome", async ({ page }) => {
  await openPage(page, "/core/cv");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".cyber-navbar")).toBeHidden();
  await expect(page.locator(".profile-actions")).toBeHidden();
  await expect(page.locator(".cv-main .section-title").first()).toBeVisible();
});
