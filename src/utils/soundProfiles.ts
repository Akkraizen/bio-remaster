import { activeThemeName, type SecretTheme, type Theme } from "@/hook/useTheme.ts";
import { preferences } from "@/hook/usePreferences.ts";

export interface SoundProfile {
  pitch: number;
  tone: OscillatorType;
  levels: number;
  q: number;
  gain: number;
  density: number;
}

const neutral: SoundProfile = { pitch: 1, tone: "sawtooth", levels: 4, q: 1, gain: 1, density: 1 };

export const soundProfiles: Record<Theme | SecretTheme, SoundProfile> = {
  acid: { pitch: 1.1, tone: "square", levels: 4, q: 1.1, gain: 1, density: 1 },
  neon: neutral,
  matrix: { pitch: 0.85, tone: "square", levels: 2, q: 1.3, gain: 0.95, density: 1 },
  ice: { pitch: 1.4, tone: "triangle", levels: 10, q: 2.4, gain: 0.85, density: 0.9 },
  amber: { pitch: 0.72, tone: "triangle", levels: 6, q: 0.9, gain: 1, density: 0.85 },
  blood: { pitch: 0.62, tone: "sawtooth", levels: 3, q: 0.8, gain: 1.1, density: 1 },
  vapor: { pitch: 0.9, tone: "triangle", levels: 12, q: 1.6, gain: 0.85, density: 0.7 },
  sakura: { pitch: 1.3, tone: "sine", levels: 16, q: 2.2, gain: 0.85, density: 0.85 },
  cobalt: { pitch: 1, tone: "square", levels: 5, q: 1.4, gain: 0.95, density: 1 },
  ghost: { pitch: 0.8, tone: "sine", levels: 16, q: 1.8, gain: 0.75, density: 0.6 },
  overclock: { pitch: 1.55, tone: "square", levels: 2, q: 1.2, gain: 1.05, density: 1 },
  midnight: { pitch: 0.68, tone: "sine", levels: 12, q: 1.5, gain: 0.75, density: 0.75 },
  root: { pitch: 0.95, tone: "sawtooth", levels: 3, q: 1.2, gain: 1, density: 1 }
};

export const soundProfile = (): SoundProfile =>
  preferences.themeSounds ? soundProfiles[activeThemeName()] ?? neutral : neutral;
