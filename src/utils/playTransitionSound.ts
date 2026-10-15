import { ref, watch } from "vue";
import { preferences } from "@/hook/usePreferences.ts";

export const soundsLoaded = ref(false);
export const soundsLoading = ref(false);
export const soundsError = ref(false);

// Gain at the default volume level (0.5); scaled by the user's volume preference
const BASE_SOUND_EFFECTS_VOLUME = 0.15;

/** Effective output gain, 0 when sound is disabled */
export function getEffectiveVolume(): number {
  if (!preferences.soundEnabled) return 0;
  return BASE_SOUND_EFFECTS_VOLUME * preferences.volume * 2;
}

export const isSoundEnabled = () => preferences.soundEnabled;

const SOUND_URLS = {
  click: "/audio/click.wav",
  progressBar: "/audio/progress-bar.wav"
} as const;

export type SoundKey = keyof typeof SOUND_URLS;

let audioContext: AudioContext | null = null;
let secondaryAudioBus: GainNode | null = null;

const audioBuffers: Map<SoundKey, AudioBuffer> = new Map();
const fallbackAudioTemplates: Map<SoundKey, HTMLAudioElement> = new Map();

/**
 * Initializes and returns the primary AudioContext with a single secondary audio bus
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioContext = new AudioContextClass();

      secondaryAudioBus = audioContext.createGain();
      secondaryAudioBus.gain.value = getEffectiveVolume();
      secondaryAudioBus.connect(audioContext.destination);
    }
  }
  return audioContext;
}

/**
 * Shared output for synthesized effects (see synthSounds.ts), already volume-scaled.
 * Returns null when Web Audio is unavailable.
 */
export function getSfxOutput(): { ctx: AudioContext; bus: GainNode } | null {
  const ctx = getAudioContext();
  if (!ctx || !secondaryAudioBus) return null;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return { ctx, bus: secondaryAudioBus };
}

watch(
  () => [preferences.soundEnabled, preferences.volume],
  () => {
    if (audioContext && secondaryAudioBus)
      secondaryAudioBus.gain.setTargetAtTime(getEffectiveVolume(), audioContext.currentTime, 0.02);
    if (!preferences.soundEnabled) stopProgressBarSound();
  }
);

if (typeof window !== "undefined") {
  const resume = () => {
    if (audioContext?.state === "suspended") audioContext.resume().catch(() => {});
  };
  window.addEventListener("pointerdown", resume, { passive: true });
  window.addEventListener("keydown", resume);
}

let progressBarAudio: HTMLAudioElement | null = null;
let progressBarSource: AudioBufferSourceNode | null = null;

export async function preloadSounds(): Promise<boolean> {
  if (typeof window === "undefined") return true;
  if (soundsLoaded.value) return true;
  soundsLoading.value = true;
  soundsError.value = false;

  const ctx = getAudioContext();

  try {
    const loadPromises = (Object.keys(SOUND_URLS) as SoundKey[]).map(async (key) => {
      const url = SOUND_URLS[key];
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load sound: ${url} (${response.status})`);
      }
      const arrayBuffer = await response.arrayBuffer();

      if (ctx) {
        try {
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
          audioBuffers.set(key, audioBuffer);
        } catch {
        }
      }

      const audioEl = new Audio(url);
      audioEl.preload = "auto";
      audioEl.volume = BASE_SOUND_EFFECTS_VOLUME;
      fallbackAudioTemplates.set(key, audioEl);
    });

    await Promise.all(loadPromises);
    soundsLoaded.value = true;
    soundsLoading.value = false;
    return true;
  } catch (error) {
    console.error("Audio preloading error:", error);
    soundsError.value = true;
    soundsLoading.value = false;
    return false;
  }
}

if (typeof window !== "undefined") {
  preloadSounds();
}

export function playClickSound() {
  playSecondarySound("click");
}

export function playProgressBarSound() {
  stopProgressBarSound();
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  const buffer = audioBuffers.get("progressBar");

  if (ctx && buffer && secondaryAudioBus) {
    try {
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      // Create independent secondary stream source node
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      // Connect strictly to the secondary audio bus without touching the main stream
      source.connect(secondaryAudioBus);
      source.start(0);
      progressBarSource = source;
      return;
    } catch (e) {
      console.warn("WebAudio progress bar error, falling back to Audio stream:", e);
    }
  }

  // Fallback: spawn independent HTMLAudioElement secondary stream
  const template = fallbackAudioTemplates.get("progressBar");
  const fallback = template ? (template.cloneNode(true) as HTMLAudioElement) : new Audio(SOUND_URLS.progressBar);
  fallback.loop = true;
  fallback.volume = Math.min(1, getEffectiveVolume());
  fallback.currentTime = 0;
  fallback.play().catch(() => {});
  progressBarAudio = fallback;
}

export function stopProgressBarSound() {
  if (progressBarSource) {
    try {
      progressBarSource.stop();
      progressBarSource.disconnect();
    } catch {}
    progressBarSource = null;
  }
  if (progressBarAudio) {
    try {
      progressBarAudio.pause();
      progressBarAudio.currentTime = 0;
    } catch {}
    progressBarAudio = null;
  }
}

/**
 * Plays sound on an independent secondary audio channel/stream,
 * preserving the main audio stream uninterrupted.
 */
export function playSecondarySound(key: SoundKey, onEnded?: () => void): number {
  if (!isSoundEnabled()) {
    if (onEnded) setTimeout(onEnded, 0);
    return 0;
  }

  const ctx = getAudioContext();
  const buffer = audioBuffers.get(key);

  if (ctx && buffer && secondaryAudioBus) {
    try {
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      // Create an independent secondary stream source
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      // Connect to the secondary audio stream bus
      source.connect(secondaryAudioBus);

      source.onended = () => {
        try {
          source.disconnect();
        } catch {}
        if (onEnded) onEnded();
      };
      source.start(0);
      return buffer.duration * 1000;
    } catch (e) {
      console.warn(`WebAudio error playing secondary sound ${key}, falling back to Audio:`, e);
    }
  }

  // Fallback: Create isolated audio stream clone to avoid interrupting other streams
  const template = fallbackAudioTemplates.get(key);
  const fallback = template ? (template.cloneNode(true) as HTMLAudioElement) : new Audio(SOUND_URLS[key]);
  fallback.volume = Math.min(1, getEffectiveVolume());
  fallback.currentTime = 0;
  
  if (onEnded) {
    const handleEnded = () => {
      fallback.removeEventListener("ended", handleEnded);
      onEnded();
    };
    fallback.addEventListener("ended", handleEnded);
  }
  
  fallback.play().catch((err) => {
    console.warn(`Audio playback error for secondary sound ${key}:`, err);
    if (onEnded) onEnded();
  });
  return fallback.duration && !isNaN(fallback.duration) ? fallback.duration * 1000 : 800;
}
