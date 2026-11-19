export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

export type UplinkError = "invalid" | "rate_limited" | "unavailable" | "network";

export type UplinkResult = { ok: true } | { ok: false; error: UplinkError; field?: string };

async function post(path: string, body: Record<string, unknown>): Promise<UplinkResult> {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: UplinkError; field?: string } | null;
    if (response.ok && data?.ok) return { ok: true };
    return { ok: false, error: data?.error ?? (response.status === 429 ? "rate_limited" : "unavailable"), field: data?.field };
  } catch {
    return { ok: false, error: "network" };
  }
}

export interface TransmissionForm {
  name: string;
  contact: string;
  message: string;
  website: string;
  elapsed: number;
  locale: string;
}

export const sendTransmission = (form: TransmissionForm) => post("/api/contact", { ...form });

export interface GuestbookForm {
  name: string;
  message: string;
  website: string;
  elapsed: number;
}

export const signGuestbook = (form: GuestbookForm) => post("/api/guestbook", { ...form });

export async function fetchGuestbook(): Promise<GuestbookEntry[] | null> {
  try {
    const response = await fetch("/api/guestbook", { headers: { Accept: "application/json" } });
    if (!response.ok) return null;
    const data = (await response.json()) as { entries?: GuestbookEntry[] };
    return Array.isArray(data.entries) ? data.entries : null;
  } catch {
    return null;
  }
}
