import { computed } from "vue";
import { createI18n } from "vue-i18n";
import en from "./locales/en";
import ru from "./locales/ru";

export type Locale = "en" | "ru";

export const translations = {
  en,
  ru
} as const;

const STORAGE_KEY = "locale";

function getInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
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

export function setLocale(lang: Locale) {
  i18n.global.locale.value = lang;
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
  return (i18n.global.t as any)(key, named ?? {});
}

export function useI18n() {
  const locale = currentLocale;
  return {
    locale,
    t,
    setLocale,
    toggleLocale,
    isRu: computed(() => locale.value === "ru"),
    isEn: computed(() => locale.value === "en")
  };
}

export default i18n;
