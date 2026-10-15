import { shallowRef } from "vue";
import { reducedMotion } from "@/hook/usePreferences.ts";

export type GlitchStrength = "ambient" | "strong";

export interface GlitchBurst {
  id: number;
  strength: GlitchStrength;
}

let counter = 0;

export const glitchBurst = shallowRef<GlitchBurst | null>(null);

export function triggerGlitch(strength: GlitchStrength = "ambient") {
  if (reducedMotion()) return;
  glitchBurst.value = { id: ++counter, strength };
}
