import { computed, reactive, watch } from "vue";
import { storageKeys } from "@/config/boot.ts";

export type MotionMode = "full" | "reduced";

export const volumeLevels = [0.25, 0.5, 0.75, 1] as const;
export type VolumeLevel = (typeof volumeLevels)[number];

export interface Preferences {
  soundEnabled: boolean;
  volume: VolumeLevel;
  /** Background hum, opt-in */
  ambient: boolean;
  motion: MotionMode;
  /** Custom crosshair cursor (fine pointers only) */
  cursor: boolean;
  /** First-launch setup (language, sound, motion) has been completed */
  setupCompleted: boolean;
}

// The inline boot script in index.html reads the same key (see src/config/boot.ts)
const STORAGE_KEY = storageKeys.preferences;

const systemPrefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const defaults = (): Preferences => ({
  soundEnabled: true,
  volume: 0.5,
  ambient: false,
  motion: systemPrefersReducedMotion() ? "reduced" : "full",
  cursor: true,
  setupCompleted: false
});

function load(): Preferences {
  const result = defaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return result;
    const saved = JSON.parse(raw) as Partial<Preferences>;

    if (typeof saved.soundEnabled === "boolean")
      result.soundEnabled = saved.soundEnabled;
    if (volumeLevels.includes(saved.volume as VolumeLevel))
      result.volume = saved.volume as VolumeLevel;
    if (typeof saved.ambient === "boolean") result.ambient = saved.ambient;
    if (saved.motion === "full" || saved.motion === "reduced")
      result.motion = saved.motion;
    if (typeof saved.cursor === "boolean") result.cursor = saved.cursor;
    if (typeof saved.setupCompleted === "boolean")
      result.setupCompleted = saved.setupCompleted;
  } catch {
    // ignore corrupted data or restricted storage
  }
  return result;
}

function apply(prefs: Preferences) {
  const root = document.documentElement;
  root.dataset.motion = prefs.motion;
  root.dataset.cursor = prefs.cursor ? "on" : "off";

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

// Shared across the app
export const preferences = reactive<Preferences>(load());
watch(preferences, apply, { immediate: true, deep: true });

export const isReducedMotion = computed(() => preferences.motion === "reduced");

/** Non-reactive check for animation code running outside components */
export const reducedMotion = () => preferences.motion === "reduced";

export function usePreferences() {
  return { preferences, isReducedMotion, volumeLevels };
}
