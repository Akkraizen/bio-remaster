import { test as base, expect, type Page } from "@playwright/test";

interface SiteOptions {
  locale: "en" | "ru";
  motion: "full" | "reduced";
  achievements: string[];
}

export const test = base.extend<{ site: SiteOptions }>({
  site: [{ locale: "en", motion: "reduced", achievements: [] }, { option: true }],
  page: async ({ page, site, baseURL }, use) => {
    await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
    await page.addInitScript((options) => {
      if (sessionStorage.getItem("e2e-ready")) return;
      sessionStorage.setItem("e2e-ready", "1");
      sessionStorage.setItem("session_initialized", "true");
      localStorage.setItem("locale", options.locale);
      localStorage.setItem("theme", "acid");
      localStorage.setItem("achievements", JSON.stringify(options.achievements));
      localStorage.setItem(
        "preferences",
        JSON.stringify({ setupCompleted: true, motion: options.motion, soundEnabled: false, screensaver: false })
      );
    }, site);
    expect(baseURL).toBeTruthy();
    await use(page);
  }
});

export { expect };

export async function openPage(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator(".page-container")).toHaveCount(1);
  await expect(page.locator(".page-container")).not.toHaveClass(/glitch-enter-active/);
}

export async function goViaNav(page: Page, label: string, path: string) {
  await page.locator(".navbar-nav").getByText(label, { exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${path}$`));
  await expect(page.locator(".page-container")).toHaveCount(1);
}

export async function runCommand(page: Page, command: string) {
  const input = page.locator(".input-row input");
  await input.fill(command);
  await input.press("Enter");
}

export const toast = (page: Page) => page.locator(".cyber-toast").last();
