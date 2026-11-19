import { computed, reactive } from "vue";
import { t } from "@/i18n";
import { showToast } from "@/utils/easterEggs.ts";
import { playConfirm } from "@/utils/synthSounds.ts";
import type { SecretTheme } from "@/config/boot.ts";
import { track } from "@/utils/analytics.ts";

export const achievementIds = [
  "konami",
  "sudo",
  "rmrf",
  "hisoka",
  "matrix",
  "teapot",
  "cat",
  "vim",
  "overclock",
  "screensaver",
  "explorer",
  "archivist",
  "lost",
  "chameleon",
  "polyglot",
  "nightowl",
  "snake",
  "signal"
] as const;

export type AchievementId = (typeof achievementIds)[number];

export const ranks = [
  { id: "script-kiddie", label: "SCRIPT_KIDDIE", from: 0 },
  { id: "operator", label: "OPERATOR", from: 4 },
  { id: "netrunner", label: "NETRUNNER", from: 8 },
  { id: "ghost", label: "GHOST", from: 12 },
  { id: "root", label: "ROOT", from: achievementIds.length }
] as const;

export const HINT_THRESHOLD = 8;

export const hints: Record<AchievementId, string> = {
  konami: "Thirty lives were once granted to those who pressed the right ten buttons.",
  sudo: "Ask for superpowers the way admins do. Expect to be reported.",
  rmrf: "Try to wipe everything, recursively and by force.",
  hisoka: "The magician from the subtitle answers to his own name.",
  matrix: "Follow the white rabbit: there is a theme that wakes you up.",
  teapot: "Order a hot drink from the shell. Status 418 awaits.",
  cat: "Concatenate nothing at all, and something purrs back.",
  vim: "Open the editor nobody knows how to quit.",
  overclock: "Spell out what overclockers do, anywhere. Or tap a face five times.",
  screensaver: "Do nothing for a full minute.",
  explorer: "Every section of the core wants a visit.",
  archivist: "Read every file in the project archive.",
  lost: "Walk a path that does not exist.",
  chameleon: "Change your colors five times in one sitting.",
  polyglot: "Speak another tongue.",
  nightowl: "Visit when the clock shows the small hours.",
  snake: "Something hungry lives in the shell. Feed it fifteen times.",
  signal: "Leave a trace for the owner: a transmission or a line in the log."
};

export const secretThemeRequirements: Record<SecretTheme, AchievementId | "all"> = {
  overclock: "overclock",
  midnight: "nightowl",
  root: "all"
};

const STORAGE_KEY = "achievements";

function load(): AchievementId[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) ? saved.filter((id) => achievementIds.includes(id)) : [];
  } catch {
    return [];
  }
}

const unlocked = reactive(new Set<AchievementId>(load()));

export const achievements = computed(() =>
  achievementIds.map((id) => ({ id, unlocked: unlocked.has(id) }))
);

export const achievementCount = computed(() => unlocked.size);

export const allUnlocked = computed(() => unlocked.size === achievementIds.length);

export const currentRank = computed(() =>
  [...ranks].reverse().find((rank) => unlocked.size >= rank.from) ?? ranks[0]
);

export const nextRank = computed(() => ranks.find((rank) => rank.from > unlocked.size) ?? null);

export const hasAchievement = (id: AchievementId) => unlocked.has(id);

export const isSecretThemeUnlocked = (theme: SecretTheme) => {
  const requirement = secretThemeRequirements[theme];
  return requirement === "all" ? allUnlocked.value : unlocked.has(requirement);
};

export const missingAchievements = () => achievementIds.filter((id) => !unlocked.has(id));

export function unlockAchievement(id: AchievementId) {
  if (unlocked.has(id)) return;
  unlocked.add(id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked]));
  } catch {}
  track("achievement", { id, total: unlocked.size });
  showToast(t("achievements.unlocked", { name: t(`achievements.items.${id}`) }));
  setTimeout(playConfirm, 120);
}
