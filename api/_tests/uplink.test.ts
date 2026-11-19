// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const ORIGIN = "http://localhost:5173";
let ip = 0;

function post(path: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": `10.0.0.${ip}`, ...headers },
    body: JSON.stringify(body)
  });
}

const entriesOf = async (response: Promise<Response>) =>
  ((await (await response).json()) as { entries: Record<string, unknown>[] }).entries;

async function load() {
  vi.resetModules();
  delete (globalThis as { __uplinkMemory?: unknown }).__uplinkMemory;
  return {
    contact: await import("../contact.ts"),
    guestbook: await import("../guestbook.ts"),
    moderate: await import("../moderate.ts"),
    http: await import("../_lib/http.ts")
  };
}

describe("uplink api", () => {
  beforeEach(() => {
    ip++;
    for (const key of ["VERCEL", "TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID", "KV_REST_API_URL", "UPSTASH_REDIS_REST_URL"])
      delete process.env[key];
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  it("validates and delivers a transmission", async () => {
    const { contact } = await load();
    const invalid = await contact.POST(post("/api/contact", { name: "", message: "hello there" }));
    expect(invalid.status).toBe(400);
    expect(await invalid.json()).toMatchObject({ error: "invalid", field: "name" });

    const ok = await contact.POST(post("/api/contact", { name: "Neo", contact: "@neo", message: "follow the rabbit", elapsed: 9000 }));
    expect(ok.status).toBe(200);
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining("follow the rabbit"));
  });

  it("silently drops honeypot submissions", async () => {
    const { contact } = await load();
    const response = await contact.POST(post("/api/contact", { name: "bot", message: "buy now please", website: "spam.example" }));
    expect(response.status).toBe(200);
    expect(console.info).not.toHaveBeenCalled();
  });

  it("rate limits by client", async () => {
    const { contact } = await load();
    const send = () => contact.POST(post("/api/contact", { name: "Neo", message: "knock knock", elapsed: 9000 }));
    for (let i = 0; i < 3; i++) expect((await send()).status).toBe(200);
    expect((await send()).status).toBe(429);
  });

  it("is unavailable on Vercel without Telegram", async () => {
    process.env.VERCEL = "1";
    const { contact } = await load();
    const response = await contact.POST(post("/api/contact", { name: "Neo", message: "anyone home?", elapsed: 9000 }));
    expect(response.status).toBe(503);
  });

  it("keeps guestbook entries pending until approved", async () => {
    const { guestbook, moderate, http } = await load();
    const created = await guestbook.POST(post("/api/guestbook", { name: "Trinity", message: "was here", elapsed: 9000 }));
    expect(await created.json()).toEqual({ ok: true, pending: true });
    expect(await entriesOf(guestbook.GET())).toEqual([]);

    const link = vi.mocked(console.info).mock.calls.map(([line]) => String(line)).find((line) => line.includes("action=approve"))!;
    const url = link.slice(link.indexOf("http"));
    const forged = await moderate.GET(new Request(url.replace(/sig=\w+/, "sig=deadbeef")));
    expect(forged.status).toBe(403);

    const approved = await moderate.GET(new Request(url));
    expect(approved.status).toBe(200);
    const entries = await entriesOf(guestbook.GET());
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ name: "Trinity", message: "was here" });

    expect((await moderate.GET(new Request(url))).status).toBe(404);

    const id = new URL(url).searchParams.get("id")!;
    const remove = `${ORIGIN}/api/moderate?id=${id}&action=remove&sig=${http.sign(`remove:${id}`)}`;
    expect((await moderate.GET(new Request(remove))).status).toBe(200);
    expect(await entriesOf(guestbook.GET())).toEqual([]);
  });

  it("cleans control characters and enforces limits", async () => {
    const { http } = await load();
    expect(http.cleanText("  hi\u0000 there‮  ", 20)).toBe("hi there");
    expect(http.cleanText("x".repeat(30), 20)).toBeNull();
    expect(http.cleanText(42, 20)).toBeNull();
  });
});
