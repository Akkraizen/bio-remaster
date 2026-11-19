interface Umami {
  track: (event: string, data?: Record<string, string | number | boolean>) => void;
}

declare global {
  interface Window {
    umami?: Umami;
  }
}

const SCRIPT_SRC = import.meta.env.VITE_UMAMI_SRC as string | undefined;
const WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID as string | undefined;
const DOMAINS = import.meta.env.VITE_UMAMI_DOMAINS as string | undefined;

export const analyticsEnabled = Boolean(SCRIPT_SRC && WEBSITE_ID);

export function installAnalytics() {
  if (!analyticsEnabled || typeof document === "undefined") return;
  const script = document.createElement("script");
  script.defer = true;
  script.src = SCRIPT_SRC!;
  script.dataset.websiteId = WEBSITE_ID!;
  script.dataset.doNotTrack = "true";
  if (DOMAINS) script.dataset.domains = DOMAINS;
  document.head.appendChild(script);
}

export function track(event: string, data?: Record<string, string | number | boolean>) {
  if (!analyticsEnabled) return;
  try {
    window.umami?.track(event, data);
  } catch {}
}
