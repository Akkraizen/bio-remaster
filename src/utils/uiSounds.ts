import { playDisconnect, playHoverTick } from "@/utils/synthSounds.ts";

/** Elements that react to hover: used for the hover tick and the custom cursor */
export const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  '[role="button"]',
  ".project-item",
  ".technology-container.has-link",
  ".social-square"
].join(", ");

interface Point {
  x: number;
  y: number;
}

function nearestInGroup(group: HTMLElement, point: Point): HTMLElement | null {
  const selector = group.dataset.cursorGroup;
  if (!selector) return null;

  let best: HTMLElement | null = null;
  let bestDistance = Infinity;
  for (const element of group.querySelectorAll<HTMLElement>(selector)) {
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) continue;
    const dx = Math.max(rect.left - point.x, 0, point.x - rect.right);
    const dy = Math.max(rect.top - point.y, 0, point.y - rect.bottom);
    const distance = dx * dx + dy * dy;
    if (distance < bestDistance) {
      best = element;
      bestDistance = distance;
    }
  }
  return best;
}

export function findCursorTarget(
  target: EventTarget | null,
  aim: Point
): HTMLElement | null {
  if (!(target instanceof Element)) return null;

  const direct =
    target.closest<HTMLElement>(INTERACTIVE_SELECTOR) ??
    target.closest<HTMLElement>("[data-cursor-focus]");

  const group = target.closest<HTMLElement>("[data-cursor-group]");
  if (!group) return direct;

  const strict = group.hasAttribute("data-cursor-group-strict");
  if (!strict && direct && direct !== group && group.contains(direct))
    return direct;

  return nearestInGroup(group, aim) ?? direct;
}

export function findInteractive(
  target: EventTarget | null
): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>(INTERACTIVE_SELECTOR);
}

const isExternalUrl = (href: string) => {
  try {
    return (
      new URL(href, window.location.href).origin !== window.location.origin
    );
  } catch {
    return false;
  }
};

export function openExternal(url: string, newTab = false) {
  playDisconnect();
  if (newTab) {
    window.open(url, "_blank", "noopener");
    return;
  }
  setTimeout(() => {
    window.location.href = url;
  }, 280);
}

let installed = false;

export function installUiSounds() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  let hovered: HTMLElement | null = null;

  document.addEventListener(
    "pointerover",
    (event) => {
      if (event.pointerType !== "mouse") return;
      const element = findInteractive(event.target);
      if (element && element !== hovered) playHoverTick();
      hovered = element;
    },
    { passive: true }
  );

  document.addEventListener(
    "click",
    (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest<HTMLAnchorElement>("a[href]");
      if (!link || !isExternalUrl(link.href)) return;

      playDisconnect();

      const opensNewTab =
        link.target === "_blank" ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey;
      if (!opensNewTab) {
        event.preventDefault();
        setTimeout(() => {
          window.location.href = link.href;
        }, 280);
      }
    },
    true
  );
}
