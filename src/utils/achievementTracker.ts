import { watch } from "vue";
import router from "@/router";
import { currentLocale } from "@/i18n";
import { shiftChameleon, useTheme } from "@/hook/useTheme.ts";
import { startFinale } from "@/hook/useFinale.ts";
import { screensaverActive } from "@/hook/useScreensaver.ts";
import { triggerGlitch } from "@/utils/glitchFx.ts";
import { playStatic } from "@/utils/synthSounds.ts";
import { pages } from "@/commands";
import { getProjectsForLocale } from "@/model/project.ts";
import { allUnlocked, hasAchievement, unlockAchievement } from "@/utils/achievements.ts";
import { runOverdrive } from "@/utils/easterEggs.ts";

const PROGRESS_KEY = "achievement-progress";
const THEME_CHANGES_GOAL = 5;
const SWIPE_DISTANCE = 40;
const TAP_DISTANCE = 12;
const FINALE_DELAY_MS = 4500;
const CHAMELEON_INTERVAL_MS = 60_000;
const SWIPE_KONAMI = ["up", "up", "down", "down", "left", "right", "left", "right", "tap", "tap"];

interface Progress {
  pages: string[];
  projects: string[];
}

function loadProgress(): Progress {
  try {
    const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}");
    return {
      pages: Array.isArray(saved.pages) ? saved.pages : [],
      projects: Array.isArray(saved.projects) ? saved.projects : []
    };
  } catch {
    return { pages: [], projects: [] };
  }
}

const progress = loadProgress();

function remember(list: string[], value: string) {
  if (list.includes(value)) return;
  list.push(value);
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {}
}

function trackRoutes() {
  const mainPages = [pages.entrypoint, pages.file, pages.projects, pages.activity] as string[];
  router.afterEach((to, from) => {
    if (to.path !== from.path && from.matched.length) shiftChameleon();
    if (to.name === "Core.NotFound") return unlockAchievement("lost");

    if (mainPages.includes(to.path)) {
      remember(progress.pages, to.path);
      if (mainPages.every((path) => progress.pages.includes(path))) unlockAchievement("explorer");
    }

    if (to.name === "Core.ProjectDetail" && typeof to.params.id === "string") {
      const ids = getProjectsForLocale(currentLocale.value).map((project) => project.id);
      if (!ids.includes(to.params.id)) return;
      remember(progress.projects, to.params.id);
      if (ids.every((id) => progress.projects.includes(id))) unlockAchievement("archivist");
    }
  });
}

function trackPreferences() {
  const { theme } = useTheme();
  let changes = 0;
  watch(theme, () => {
    if (++changes >= THEME_CHANGES_GOAL) unlockAchievement("chameleon");
  });
  watch(currentLocale, () => unlockAchievement("polyglot"));
}

function checkNightOwl() {
  const hour = new Date().getHours();
  if (hour < 5) setTimeout(() => unlockAchievement("nightowl"), 4000);
}

function trackSwipeKonami() {
  let start: { x: number; y: number } | null = null;
  let step = 0;

  window.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0];
      start = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchend",
    (event) => {
      if (!start) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      start = null;

      let gesture: string | null = null;
      if (Math.hypot(dx, dy) < TAP_DISTANCE) gesture = "tap";
      else if (Math.max(Math.abs(dx), Math.abs(dy)) >= SWIPE_DISTANCE)
        gesture = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
      if (!gesture) return;

      step = gesture === SWIPE_KONAMI[step] ? step + 1 : gesture === SWIPE_KONAMI[0] ? 1 : 0;
      if (step === SWIPE_KONAMI.length) {
        step = 0;
        runOverdrive();
      }
    },
    { passive: true }
  );
}

function runChameleonClock() {
  setInterval(() => {
    if (document.hidden || screensaverActive.value) return;
    if (shiftChameleon()) {
      triggerGlitch("ambient");
      playStatic();
    }
  }, CHAMELEON_INTERVAL_MS);
}

function trackFinale() {
  watch(allUnlocked, (complete, wasComplete) => {
    if (complete && !wasComplete) setTimeout(startFinale, FINALE_DELAY_MS);
  });
}

export function installAchievementTracker() {
  trackFinale();
  runChameleonClock();
  trackRoutes();
  trackPreferences();
  if (!hasAchievement("nightowl")) checkNightOwl();
  trackSwipeKonami();
}
