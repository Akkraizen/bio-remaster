import { cleanText, fail, json, limited, looksLikeBot, readJson } from "./_lib/http.js";
import { getStore } from "./_lib/store.js";
import { escapeHtml, sendTelegram } from "./_lib/telegram.js";

export async function POST(request: Request): Promise<Response> {
  const body = await readJson(request);
  if (!body) return fail("invalid");
  if (looksLikeBot(body)) return json({ ok: true });

  const name = cleanText(body.name, 60);
  if (!name) return fail("invalid", "name");
  const contact = cleanText(body.contact ?? "", 120, 0);
  if (contact === null) return fail("invalid", "contact");
  const message = cleanText(body.message, 2000, 5);
  if (!message) return fail("invalid", "message");

  const store = getStore();
  if (store && (await limited(store, "contact", request, 3, 600))) return fail("rate_limited");

  const locale = body.locale === "ru" ? "ru" : "en";
  const delivered = await sendTelegram(
    [
      "<b>📡 UPLINK // new transmission</b>",
      `<b>From:</b> ${escapeHtml(name)}`,
      contact ? `<b>Reply to:</b> ${escapeHtml(contact)}` : "<b>Reply to:</b> —",
      `<b>Locale:</b> ${locale}`,
      "",
      escapeHtml(message)
    ].join("\n")
  ).catch(() => false);

  return delivered ? json({ ok: true }) : fail("unavailable");
}
