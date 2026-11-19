export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

export const APPROVED_KEY = "gb:approved";
export const pendingKey = (id: string) => `gb:pending:${id}`;
export const PENDING_TTL = 14 * 24 * 60 * 60;
export const KEEP = 200;
export const PAGE = 60;

export function parseEntry(raw: string): GuestbookEntry | null {
  try {
    const value = JSON.parse(raw) as GuestbookEntry;
    return typeof value.id === "string" && typeof value.name === "string" && typeof value.message === "string"
      ? value
      : null;
  } catch {
    return null;
  }
}
