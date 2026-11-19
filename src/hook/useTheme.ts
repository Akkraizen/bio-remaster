import { computed, readonly, ref, watch } from "vue";
import {
  secretThemes,
  storageKeys,
  themeLogoUrl,
  themeModes,
  themes,
  type SecretTheme,
  type Theme
} from "@/config/boot.ts";
import { track } from "@/utils/analytics.ts";

export { secretThemes, themeModes, themes, themeLogoUrl, type SecretTheme, type Theme };
export type ThemeMode = (typeof themeModes)[number];
export type ThemePreference = Theme | SecretTheme | ThemeMode;

const PREFERENCE_KEY = storageKeys.themePreference;
const LAST_THEME_KEY = storageKeys.lastTheme;
const DEFAULT_PREFERENCE: ThemePreference = "random";

export const isTheme = (value: unknown): value is Theme =>
  themes.includes(value as Theme);

export const isSecretTheme = (value: unknown): value is SecretTheme =>
  secretThemes.includes(value as SecretTheme);

const isMode = (value: unknown): value is ThemeMode =>
  themeModes.includes(value as ThemeMode);

const isPreference = (value: unknown): value is ThemePreference =>
  isMode(value) || isSecretTheme(value) || isTheme(value);

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
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
  if (isTheme(pref)) return pref;

  const last = readStorage(LAST_THEME_KEY);
  if (isSecretTheme(pref) && isTheme(last)) return last;

  const applied = document.documentElement.dataset.theme;
  if (isTheme(applied)) return applied;

  return pickRandomTheme(last as Theme | null);
}

function syncThemeColor() {
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--c-accent").trim();
  if (accent) document.querySelector('meta[name="theme-color"]')?.setAttribute("content", accent);
}

function applyTheme(value: Theme) {
  document.documentElement.dataset.theme = value;
  syncThemeColor();
  document.querySelector('link[rel="icon"]')?.setAttribute("href", themeLogoUrl(value));
  writeStorage(LAST_THEME_KEY, value);
}

const preference = ref<ThemePreference>(getInitialPreference());
const theme = ref<Theme>(getInitialTheme(preference.value));
const secret = ref<SecretTheme | null>(isSecretTheme(preference.value) ? preference.value : null);

export const activeThemeName = () => secret.value ?? theme.value;

watch(
  theme,
  (value) => {
    if (!secret.value) applyTheme(value);
  },
  { immediate: true }
);

watch(
  secret,
  (value) => {
    if (!value) return applyTheme(theme.value);
    document.documentElement.dataset.theme = value;
    syncThemeColor();
  },
  { immediate: true }
);

watch(preference, (value) => writeStorage(PREFERENCE_KEY, value), { immediate: true });

export function setThemePreference(value: ThemePreference) {
  if (value !== preference.value) track("theme", { name: value });
  preference.value = value;
  secret.value = isSecretTheme(value) ? value : null;
  if (isMode(value)) theme.value = pickRandomTheme(theme.value);
  else if (isTheme(value)) theme.value = value;
}

export function setSecretTheme(value: SecretTheme | null) {
  if (!value && isSecretTheme(preference.value)) return setThemePreference(theme.value);
  secret.value = value;
}

export function shiftChameleon(): boolean {
  if (preference.value !== "chameleon" || secret.value) return false;
  theme.value = pickRandomTheme(theme.value);
  return true;
}

export const activeSecretTheme = readonly(secret);

export function useTheme() {
  return {
    theme: readonly(theme),
    preference: readonly(preference),
    secret: readonly(secret),
    isRandom: computed(() => preference.value === "random"),
    logoUrl: computed(() => themeLogoUrl(theme.value)),
    themes,
    setThemePreference
  };
}
