import { expect, goViaNav, openPage, test, toast } from "./fixtures.ts";

test("sends a transmission and signs the guestbook", async ({ page }) => {
  const posted: Record<string, unknown>[] = [];
  await page.route("**/api/guestbook", (route) =>
    route.request().method() === "GET"
      ? route.fulfill({
          json: { ok: true, entries: [{ id: "a1", name: "Neo", message: "follow the white rabbit", createdAt: new Date().toISOString() }] }
        })
      : (posted.push(route.request().postDataJSON()), route.fulfill({ json: { ok: true, pending: true } }))
  );
  await page.route("**/api/contact", (route) => {
    posted.push(route.request().postDataJSON());
    return route.fulfill({ json: { ok: true } });
  });

  await openPage(page, "/core/entrypoint");
  await goViaNav(page, "Core.Uplink", "/core/uplink");
  await expect(page.locator(".log-entry")).toContainText("follow the white rabbit");

  const transmit = page.locator(".uplink-form").first();
  await transmit.locator("button").click();
  await expect(transmit.locator(".status")).toContainText("Check the field: Name");

  await transmit.locator('input[name="name"]').fill("Morpheus");
  await transmit.locator('textarea[name="message"]').fill("What if I told you?");
  await transmit.locator("button").click();
  await expect(transmit.locator(".status")).toContainText("Signal delivered");
  await expect(toast(page)).toContainText("Signal sent");

  const guestbook = page.locator(".uplink-form").nth(1);
  await guestbook.locator('input[name="guest-name"]').fill("Trinity");
  await guestbook.locator('textarea[name="guest-message"]').fill("dodge this");
  await guestbook.locator("button").click();
  await expect(page.locator(".log-entry.is-pending")).toContainText("dodge this");

  expect(posted[0]).toMatchObject({ name: "Morpheus", message: "What if I told you?", website: "" });
  expect(posted[1]).toMatchObject({ name: "Trinity", message: "dodge this" });
});

test("reports an unreachable guestbook", async ({ page }) => {
  await page.route("**/api/guestbook", (route) => route.fulfill({ status: 503, json: { ok: false, error: "unavailable" } }));
  await openPage(page, "/core/uplink");
  await expect(page.locator(".log-empty")).toContainText("unreachable");
});
