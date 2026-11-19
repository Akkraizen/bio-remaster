import { ref } from "vue";
import { t } from "@/i18n";
import { activeSecretTheme, activeThemeName, setSecretTheme, themes } from "@/hook/useTheme.ts";
import { reducedMotion } from "@/hook/usePreferences.ts";
import { triggerGlitch } from "@/utils/glitchFx.ts";
import { playConfirm, playStatic } from "@/utils/synthSounds.ts";
import { unlockAchievement } from "@/utils/achievements.ts";

export interface Toast {
  id: number;
  text: string;
}

export const toast = ref<Toast | null>(null);

let toastId = 0;
let toastTimer: ReturnType<typeof setTimeout> | null = null;
const toastQueue: Array<{ text: string; duration: number }> = [];

function nextToast() {
  const next = toastQueue.shift();
  if (!next) {
    toast.value = null;
    toastTimer = null;
    return;
  }
  toast.value = { id: ++toastId, text: next.text };
  toastTimer = setTimeout(nextToast, next.duration);
}

export function showToast(text: string, duration = 3500) {
  toastQueue.push({ text, duration });
  if (!toastTimer) nextToast();
}

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA"
];

let overdriveRunning = false;

export function runOverdrive() {
  showToast(t("secrets.konami"));
  playConfirm();
  unlockAchievement("konami");
  if (overdriveRunning || reducedMotion()) return;

  overdriveRunning = true;
  const root = document.documentElement;
  const sequence = [...themes, ...themes];
  let step = 0;

  triggerGlitch("strong");
  const timer = setInterval(() => {
    if (step < sequence.length) {
      root.dataset.theme = sequence[step++];
      if (step % 3 === 0) {
        triggerGlitch("ambient");
        playStatic();
      }
      return;
    }
    clearInterval(timer);
    root.dataset.theme = activeThemeName();
    triggerGlitch("strong");
    overdriveRunning = false;
  }, 140);
}

export function toggleOverclock(enabled = activeSecretTheme.value !== "overclock") {
  setSecretTheme(enabled ? "overclock" : null);
  triggerGlitch("strong");
  playStatic();
  showToast(t(enabled ? "secrets.overclockOn" : "secrets.overclockOff"));
  if (enabled) unlockAchievement("overclock");
}

const OVERCLOCK_WORD = "overclock";

export function installEasterEggs() {
  let progress = 0;
  let typed = "";
  window.addEventListener("keydown", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA"].includes(target.tagName))) return;

    progress = event.code === KONAMI[progress] ? progress + 1 : event.code === KONAMI[0] ? 1 : 0;
    if (progress === KONAMI.length) {
      progress = 0;
      runOverdrive();
    }

    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
    typed = (typed + event.key.toLowerCase()).slice(-OVERCLOCK_WORD.length);
    if (typed === OVERCLOCK_WORD) {
      typed = "";
      toggleOverclock();
    }
  });

  console.log(
    "%c▲ AKKRAIZEN %c" + t("secrets.console"),
    "color:#050505;background:#c6ff33;font-weight:bold;padding:2px 6px",
    "color:inherit;padding:2px 6px"
  );
}
