import { computed, readonly, ref, watch } from "vue";
import {
  storageKeys,
  themeLogoUrl,
  themes,
  type Theme
} from "@/config/boot.ts";

export { themes, themeLogoUrl, type Theme };
export type ThemePreference = Theme | "random";

const PREFERENCE_KEY = storageKeys.themePreference;
const LAST_THEME_KEY = storageKeys.lastTheme;
const DEFAULT_PREFERENCE: ThemePreference = "random";

const isTheme = (value: unknown): value is Theme =>
  themes.includes(value as Theme);

const isPreference = (value: unknown): value is ThemePreference =>
  value === "random" || isTheme(value);

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    // ignore localStorage errors in restricted environments
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function pickRandomTheme(exclude?: Theme | null): Theme {
  const pool = themes.filter((name) => name !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

function getInitialPreference(): ThemePreference {
  const saved = readStorage(PREFERENCE_KEY);
  return isPreference(saved) ? saved : DEFAULT_PREFERENCE;
}

function getInitialTheme(pref: ThemePreference): Theme {
  if (pref !== "random") return pref;

  const applied = document.documentElement.dataset.theme;
  if (isTheme(applied)) return applied;

  return pickRandomTheme(readStorage(LAST_THEME_KEY) as Theme | null);
}

function applyTheme(value: Theme) {
  const root = document.documentElement;
  root.dataset.theme = value;

  const accent = getComputedStyle(root).getPropertyValue("--c-accent").trim();
  if (accent)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", accent);

  document
    .querySelector('link[rel="icon"]')
    ?.setAttribute("href", themeLogoUrl(value));

  writeStorage(LAST_THEME_KEY, value);
}

const preference = ref<ThemePreference>(getInitialPreference());
const theme = ref<Theme>(getInitialTheme(preference.value));

watch(theme, applyTheme, { immediate: true });
watch(preference, (value) => writeStorage(PREFERENCE_KEY, value), {
  immediate: true
});

export function setThemePreference(value: ThemePreference) {
  preference.value = value;
  theme.value = value === "random" ? pickRandomTheme(theme.value) : value;
}

export function useTheme() {
  return {
    theme: readonly(theme),
    preference: readonly(preference),
    isRandom: computed(() => preference.value === "random"),
    logoUrl: computed(() => themeLogoUrl(theme.value)),
    themes,
    setThemePreference
  };
}
