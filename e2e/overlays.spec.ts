import { expect, openPage, runCommand, test, toast } from "./fixtures.ts";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

test("command palette navigates to a page", async ({ page }) => {
  await openPage(page, "/core/entrypoint");
  await page.keyboard.press("Control+k");
  const input = page.locator(".palette-input");
  await expect(input).toBeFocused();
  await input.fill("activity");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/core\/activity$/);
});

test("terminal runs public and secret commands", async ({ page }) => {
  await openPage(page, "/core/entrypoint");
  await page.keyboard.press("Backquote");
  await expect(page.locator(".terminal")).toBeVisible();

  await runCommand(page, "whoami");
  await expect(page.locator(".terminal .line").filter({ hasText: "visitor clearance" })).toBeVisible();

  await runCommand(page, "coffee");
  await expect(toast(page)).toContainText("teapot");

  await runCommand(page, "cv");
  await expect(page).toHaveURL(/\/core\/cv$/);
});

test("terminal walks the file tree and runs snake", async ({ page }) => {
  await openPage(page, "/core/entrypoint");
  await page.keyboard.press("Backquote");
  const input = page.locator(".input-row input");
  await input.fill("cd proj");
  await input.press("Tab");
  await expect(input).toHaveValue("cd projects/");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/core\/projects$/);
  await expect(page.locator(".input-row .prompt")).toContainText("~/projects");

  await runCommand(page, "cat berill");
  await expect(page.locator(".terminal .line").filter({ hasText: "# Berill" })).toBeVisible();

  await runCommand(page, "snake");
  await expect(page.locator(".snake-field .cell.head")).toHaveCount(1);
  await page.keyboard.press("q");
  await expect(page.locator(".terminal .line").filter({ hasText: "GAME OVER" })).toBeVisible();
  await expect(page.locator(".input-row input")).toBeFocused();
});

test("konami code triggers overdrive", async ({ page }) => {
  await openPage(page, "/core/entrypoint");
  for (const key of KONAMI) await page.keyboard.press(key);
  await expect(toast(page)).toContainText("OVERDRIVE");
});

test("settings preview a theme on hover and keep it on click", async ({ page }) => {
  await openPage(page, "/core/entrypoint");
  await page.locator(".cyber-settings [aria-haspopup]").click();
  const ice = page.locator(".settings-section--theme .cyber-button-container").filter({ hasText: "ICE" });
  const root = page.locator("html");

  await ice.hover();
  await expect(root).toHaveAttribute("data-theme", "ice");
  await page.locator(".settings-section--theme .section-title").hover();
  await expect(root).toHaveAttribute("data-theme", "acid");

  await ice.click();
  await expect(root).toHaveAttribute("data-theme", "ice");
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("ice");
});

test("screensaver starts from the terminal and wakes on input", async ({ page }) => {
  await openPage(page, "/core/entrypoint");
  await page.keyboard.press("Backquote");
  await runCommand(page, "afk");
  const screensaver = page.locator(".screensaver");
  await expect(screensaver).toBeVisible();
  await page.waitForTimeout(700);
  await page.mouse.move(200, 200);
  await page.mouse.move(400, 300);
  await expect(screensaver).toHaveCount(0);
  await expect(toast(page)).toContainText("AFK");
});
