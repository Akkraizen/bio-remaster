import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { Store } from "./store.js";

export type ErrorCode = "invalid" | "rate_limited" | "unavailable" | "forbidden" | "not_found";

const statuses: Record<ErrorCode, number> = {
  invalid: 400,
  forbidden: 403,
  not_found: 404,
  rate_limited: 429,
  unavailable: 503
};

export const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers }
  });

export const fail = (error: ErrorCode, field?: string) => json({ ok: false, error, ...(field ? { field } : {}) }, statuses[error]);

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  if (!request.headers.get("content-type")?.includes("application/json")) return null;
  const text = await request.text();
  if (text.length > 10_000) return null;
  try {
    const value = JSON.parse(text);
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

export function cleanText(value: unknown, max: number, min = 1): string | null {
  if (typeof value !== "string") return null;
  const text = value
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F\u200B-\u200F\u2028-\u202E]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text.length >= min && text.length <= max ? text : null;
}

export const looksLikeBot = (body: Record<string, unknown>) =>
  (typeof body.website === "string" && body.website.length > 0) ||
  (typeof body.elapsed === "number" && body.elapsed < 2500);

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "local";
  return createHash("sha256").update(`${ip}:${secret()}`).digest("hex").slice(0, 24);
}

export async function limited(store: Store, scope: string, request: Request, limit: number, windowSeconds: number) {
  const count = await store.hit(`rl:${scope}:${clientKey(request)}`, windowSeconds);
  return count > limit;
}

function secret(): string {
  return process.env.MODERATION_SECRET ?? process.env.TELEGRAM_BOT_TOKEN ?? (process.env.VERCEL ? "" : "dev-secret");
}

export const canSign = () => secret().length > 0;

export const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("hex").slice(0, 32);

export function verify(payload: string, signature: string | null): boolean {
  if (!signature || !canSign()) return false;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export const originOf = (request: Request) => {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? url.host;
  const protocol = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${protocol}://${host}`;
};
