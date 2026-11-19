import { randomUUID } from "node:crypto";
import { canSign, cleanText, fail, json, limited, looksLikeBot, originOf, readJson, sign } from "./_lib/http.js";
import { getStore } from "./_lib/store.js";
import { escapeHtml, sendTelegram } from "./_lib/telegram.js";
import { APPROVED_KEY, PAGE, PENDING_TTL, parseEntry, pendingKey, type GuestbookEntry } from "./_lib/guestbook.js";

export async function GET(): Promise<Response> {
  const store = getStore();
  if (!store) return fail("unavailable");
  const raw = await store.range(APPROVED_KEY, PAGE);
  const entries = raw.map(parseEntry).filter((entry): entry is GuestbookEntry => entry !== null);
  return json({ ok: true, entries }, 200, { "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=300" });
}

export async function POST(request: Request): Promise<Response> {
  const body = await readJson(request);
  if (!body) return fail("invalid");
  if (looksLikeBot(body)) return json({ ok: true, pending: true });

  const name = cleanText(body.name, 32);
  if (!name) return fail("invalid", "name");
  const message = cleanText(body.message, 280, 2);
  if (!message) return fail("invalid", "message");

  const store = getStore();
  if (!store || !canSign()) return fail("unavailable");
  if (await limited(store, "guestbook", request, 2, 600)) return fail("rate_limited");

  const entry: GuestbookEntry = { id: randomUUID().slice(0, 12), name, message, createdAt: new Date().toISOString() };
  await store.set(pendingKey(entry.id), JSON.stringify(entry), PENDING_TTL);

  const link = (action: string) =>
    `${originOf(request)}/api/moderate?id=${entry.id}&action=${action}&sig=${sign(`${action}:${entry.id}`)}`;
  await sendTelegram(
    [`<b>📒 GUESTBOOK // awaiting moderation</b>`, `<b>${escapeHtml(name)}</b>`, "", escapeHtml(message)].join("\n"),
    [
      { text: "✅ Approve", url: link("approve") },
      { text: "🗑 Reject", url: link("reject") }
    ]
  ).catch(() => false);

  return json({ ok: true, pending: true });
}
