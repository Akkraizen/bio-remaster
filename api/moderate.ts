import { originOf, sign, verify } from "./_lib/http.js";
import { getStore } from "./_lib/store.js";
import { escapeHtml } from "./_lib/telegram.js";
import { APPROVED_KEY, KEEP, parseEntry, pendingKey } from "./_lib/guestbook.js";

const actions = ["approve", "reject", "remove"] as const;
type Action = (typeof actions)[number];

function page(title: string, body: string, status = 200) {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#050505;color:#e6e6e6;font:15px/1.6 ui-monospace,monospace}main{max-width:520px;padding:24px;border:1px solid #c6ff33}h1{margin:0 0 12px;color:#c6ff33;font-size:18px}a{color:#c6ff33}blockquote{margin:12px 0;padding-left:12px;border-left:2px solid #c6ff3366;white-space:pre-wrap}</style></head>
<body><main><h1>${escapeHtml(title)}</h1>${body}</main></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } }
  );
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "";
  const action = url.searchParams.get("action") as Action;
  if (!/^[\w-]{4,40}$/.test(id) || !actions.includes(action) || !verify(`${action}:${id}`, url.searchParams.get("sig")))
    return page("ACCESS DENIED", "<p>Signature check failed.</p>", 403);

  const store = getStore();
  if (!store) return page("OFFLINE", "<p>Storage is not configured.</p>", 503);

  if (action === "remove") {
    const raw = (await store.range(APPROVED_KEY, KEEP)).find((item) => parseEntry(item)?.id === id);
    if (!raw) return page("NOT FOUND", "<p>The entry is already gone.</p>", 404);
    await store.remove(APPROVED_KEY, raw);
    return page("REMOVED", "<p>The entry was removed from the public log.</p>");
  }

  const raw = await store.get(pendingKey(id));
  const entry = raw ? parseEntry(raw) : null;
  if (!entry) return page("NOT FOUND", "<p>Nothing is waiting under this id. It may be handled already.</p>", 404);
  await store.del(pendingKey(id));

  const quote = `<p><b>${escapeHtml(entry.name)}</b></p><blockquote>${escapeHtml(entry.message)}</blockquote>`;
  if (action === "reject") return page("REJECTED", `${quote}<p>The entry was discarded.</p>`);

  await store.push(APPROVED_KEY, JSON.stringify(entry), KEEP);
  const removeLink = `${originOf(request)}/api/moderate?id=${id}&action=remove&sig=${sign(`remove:${id}`)}`;
  return page(
    "APPROVED",
    `${quote}<p>The entry is public now (cached for up to 30 seconds).</p><p><a href="${escapeHtml(removeLink)}">Remove it later</a> · <a href="/core/uplink">Open the log</a></p>`
  );
}
