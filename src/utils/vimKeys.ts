import { preferences } from "@/hook/usePreferences.ts";
import { closeOverlays } from "@/hook/useOverlays.ts";
import { hasAchievement } from "@/utils/achievements.ts";
import { showToast } from "@/utils/easterEggs.ts";

const LINE = 80;
const SEQUENCE_MS = 800;

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

const behavior = (): ScrollBehavior => (preferences.motion === "reduced" ? "auto" : "smooth");

function quit() {
  closeOverlays();
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
}

export function installVimKeys() {
  let buffer = "";
  let bufferTimer: ReturnType<typeof setTimeout> | null = null;

  const push = (key: string) => {
    buffer += key;
    if (bufferTimer) clearTimeout(bufferTimer);
    bufferTimer = setTimeout(() => (buffer = ""), SEQUENCE_MS);
  };

  window.addEventListener("keydown", (event) => {
    if (!preferences.vimKeys || !hasAchievement("vim")) return;
    if (event.ctrlKey || event.metaKey || event.altKey || isTyping(event.target)) return;

    if (buffer.startsWith(":")) {
      if (event.key === "Enter") {
        if (buffer === ":q" || buffer === ":q!" || buffer === ":wq") quit();
        else showToast(`E492: Not an editor command: ${buffer.slice(1)}`);
        buffer = "";
        return;
      }
      if (event.key.length === 1) push(event.key);
      return;
    }

    switch (event.key) {
      case "j":
        window.scrollBy({ top: LINE, behavior: behavior() });
        return;
      case "k":
        window.scrollBy({ top: -LINE, behavior: behavior() });
        return;
      case "d":
        window.scrollBy({ top: window.innerHeight / 2, behavior: behavior() });
        return;
      case "u":
        window.scrollBy({ top: -window.innerHeight / 2, behavior: behavior() });
        return;
      case "G":
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: behavior() });
        return;
      case "g":
        if (buffer.endsWith("g")) {
          buffer = "";
          window.scrollTo({ top: 0, behavior: behavior() });
        } else push("g");
        return;
      case ":":
        buffer = "";
        push(":");
        return;
    }
  });
}
