import { expect, goViaNav, openPage, test, toast } from "./fixtures.ts";

test("navigates between sections from the navbar", async ({ page }) => {
  await openPage(page, "/core/entrypoint");
  await goViaNav(page, "Core.File", "/core/file");
  await expect(page.locator(".bio-section")).toBeVisible();
  await goViaNav(page, "Core.Projects", "/core/projects");
  await expect(page.locator(".project-item").first()).toBeVisible();
  await goViaNav(page, "Core.Activity", "/core/activity");
  await expect(page.locator(".heatmap-section")).toBeVisible();
});

test("draws outlines only on the first visit of a screen", async ({ page }) => {
  await openPage(page, "/core/file");
  const drawn = page.locator(".page-container .outline-path.draw-in");
  expect(await drawn.count()).toBeGreaterThan(0);

  await goViaNav(page, "Core.Projects", "/core/projects");
  await expect(page.locator(".project-search")).toBeVisible();
  expect(await drawn.count()).toBeGreaterThan(0);

  await goViaNav(page, "Core.File", "/core/file");
  await expect(page.locator(".bio-section")).toBeVisible();
  await expect(drawn).toHaveCount(0);
});

test("scrolls to the top after navigation", async ({ page }) => {
  await openPage(page, "/core/file");
  await page.mouse.wheel(0, 3000);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
  await goViaNav(page, "Core.Projects", "/core/projects");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test("unlocks an achievement on a missing page", async ({ page }) => {
  await openPage(page, "/definitely/missing");
  await expect(toast(page)).toContainText("Lost in the net");
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("achievements") ?? "[]"));
  expect(saved).toContain("lost");
});

test("serves prerendered content and meta for crawlers", async ({ request }) => {
  const html = await (await request.get("/core/projects/002/")).text();
  expect(html).toContain("<h1>Wavedot</h1>");
  expect(html).toContain("/og/core-projects-002.png");
});

test.describe("with full motion", () => {
  test.use({ site: { locale: "en", motion: "full", achievements: [] } });

  test("renders every page through view transitions", async ({ page }) => {
    await openPage(page, "/core/entrypoint");
    for (const [label, path, selector] of [
      ["Core.File", "/core/file", ".bio-section"],
      ["Core.Projects", "/core/projects", ".project-item"],
      ["Core.Uplink", "/core/uplink", ".uplink-form"]
    ] as const) {
      await goViaNav(page, label, path);
      await expect(page.locator(selector).first()).toBeVisible();
    }
  });
});
