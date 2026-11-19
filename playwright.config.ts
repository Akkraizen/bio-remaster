import { defineConfig, devices } from "@playwright/test";

const PORT = 4174;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    serviceWorkers: "block",
    trace: "retain-on-failure"
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 900 }, channel: isCI ? undefined : "chrome" },
      testIgnore: /mobile\.spec\.ts/
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], channel: isCI ? undefined : "chrome" },
      testMatch: /mobile\.spec\.ts/
    }
  ],
  webServer: {
    command: isCI
      ? `pnpm exec vite preview --port ${PORT} --strictPort`
      : `pnpm run build && pnpm exec vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/core/entrypoint`,
    reuseExistingServer: !isCI,
    timeout: 240_000
  }
});
