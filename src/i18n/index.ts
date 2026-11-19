import { computed, ref } from "vue";
import { createI18n } from "vue-i18n";
import { track } from "@/utils/analytics.ts";
import en from "./locales/en";
import ru from "./locales/ru";

export type Locale = "en" | "ru";

export const translations = {
  en,
  ru
} as const;

const STORAGE_KEY = "locale";
const LEET_VALUE = "l33t";

function readSavedLocale(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export const leetMode = ref(readSavedLocale() === LEET_VALUE);

const LEET_MAP: Record<string, string> = { a: "4", e: "3", i: "1", o: "0", s: "5", t: "7" };

export function leetify(text: string): string {
  let result = "";
  let skip: string | null = null;
  for (const char of text) {
    if (skip) {
      if (char === skip) skip = null;
      result += char;
      continue;
    }
    if (char === "<") skip = ">";
    else if (char === "&") skip = ";";
    else if (char === "{") skip = "}";
    result += LEET_MAP[char.toLowerCase()] ?? char;
  }
  return result;
}

function getInitialLocale(): Locale {
  try {
    const saved = readSavedLocale();
    if (saved === LEET_VALUE) return "en";
    if (saved === "ru" || saved === "en") {
      return saved;
    }
  } catch (e) {
    console.error("Failed to read locale from localStorage", e);
  }
  return "en";
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: "en",
  messages: {
    en,
    ru
  }
});

export const currentLocale = computed<Locale>({
  get: () => i18n.global.locale.value as Locale,
  set: (val: Locale) => {
    setLocale(val);
  }
});

if (typeof document !== "undefined") document.documentElement.lang = i18n.global.locale.value;

export function setLeet() {
  track("language", { locale: "l33t" });
  leetMode.value = true;
  i18n.global.locale.value = "en";
  document.documentElement.lang = "en";
  try {
    localStorage.setItem(STORAGE_KEY, LEET_VALUE);
  } catch {}
}

export function setLocale(lang: Locale) {
  if (lang !== i18n.global.locale.value || leetMode.value) track("language", { locale: lang });
  leetMode.value = false;
  i18n.global.locale.value = lang;
  document.documentElement.lang = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch (e) {
    console.error("Failed to save locale to localStorage", e);
  }
}

export function toggleLocale(): Locale {
  const nextLocale: Locale = i18n.global.locale.value === "en" ? "ru" : "en";
  setLocale(nextLocale);
  return nextLocale;
}

export function t(key: string, named?: Record<string, unknown>): string {
  const text: string = (i18n.global.t as any)(key, named ?? {});
  return leetMode.value ? leetify(text) : text;
}

export function useI18n() {
  const locale = currentLocale;
  return {
    locale,
    t,
    setLocale,
    setLeet,
    leetMode,
    toggleLocale,
    isRu: computed(() => locale.value === "ru"),
    isEn: computed(() => locale.value === "en")
  };
}

export default i18n;
