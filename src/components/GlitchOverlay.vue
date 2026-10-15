<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  glitchBurst,
  triggerGlitch,
  type GlitchStrength
} from "@/utils/glitchFx.ts";
import { reducedMotion } from "@/hook/usePreferences.ts";

const props = withDefaults(
  defineProps<{
    ambient?: boolean;
  }>(),
  { ambient: true }
);

interface Band {
  top: number;
  height: number;
  shift: number;
  delay: number;
  invert: boolean;
}

const DURATION: Record<GlitchStrength, number> = { ambient: 180, strong: 420 };

const bands = ref<Band[]>([]);
const strength = ref<GlitchStrength>("ambient");
const burstKey = ref(0);

let hideTimer: ReturnType<typeof setTimeout> | null = null;
let ambientTimer: ReturnType<typeof setTimeout> | null = null;

const random = (min: number, max: number) => min + Math.random() * (max - min);

function show(kind: GlitchStrength, id: number) {
  const count = kind === "strong" ? 8 : 3;
  bands.value = Array.from({ length: count }, () => ({
    top: random(0, 95),
    height: kind === "strong" ? random(2, 14) : random(0.5, 4),
    shift: random(-12, 12),
    delay: random(0, DURATION[kind] * 0.5),
    invert: kind === "strong" && Math.random() < 0.4
  }));
  strength.value = kind;
  burstKey.value = id;

  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    bands.value = [];
  }, DURATION[kind]);
}

watch(glitchBurst, (burst) => {
  if (burst) show(burst.strength, burst.id);
});

function scheduleAmbient() {
  ambientTimer = setTimeout(
    () => {
      if (props.ambient && !document.hidden && !reducedMotion())
        triggerGlitch("ambient");
      scheduleAmbient();
    },
    random(10_000, 20_000)
  );
}

onMounted(scheduleAmbient);

onBeforeUnmount(() => {
  if (hideTimer) clearTimeout(hideTimer);
  if (ambientTimer) clearTimeout(ambientTimer);
});
</script>

<template>
  <div
    v-if="bands.length"
    :key="burstKey"
    class="glitch-overlay"
    :class="strength"
    aria-hidden="true"
  >
    <div
      v-for="(band, index) in bands"
      :key="index"
      class="glitch-band"
      :class="{ invert: band.invert }"
      :style="{
        top: `${band.top}%`,
        height: `${band.height}%`,
        '--shift': `${band.shift}px`,
        animationDelay: `${band.delay}ms`
      }"
    />
  </div>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.glitch-overlay {
  position: fixed;
  inset: 0;
  z-index: 9000;
  pointer-events: none;
  overflow: hidden;
}

.glitch-band {
  position: absolute;
  left: 0;
  right: 0;
  opacity: 0;
  animation: band-flicker 0.14s steps(1) forwards;
  backdrop-filter: hue-rotate(90deg) saturate(2.5) contrast(1.4);
  -webkit-backdrop-filter: hue-rotate(90deg) saturate(2.5) contrast(1.4);
  border-top: 1px solid vars.alpha(vars.$accent-color, 0.35);

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    transform: translateX(var(--shift));
    background: vars.alpha(vars.$accent-color, 0.08);
    mix-blend-mode: screen;
  }

  &.invert {
    backdrop-filter: invert(1) hue-rotate(180deg);
    -webkit-backdrop-filter: invert(1) hue-rotate(180deg);
  }
}

.strong .glitch-band {
  animation-duration: 0.22s;

  &::after {
    background: vars.alpha(vars.$secondary-accent, 0.15);
  }
}

@keyframes band-flicker {
  0% {
    opacity: 1;
    transform: translateX(var(--shift));
  }
  33% {
    opacity: 0.6;
    transform: translateX(calc(var(--shift) * -1));
  }
  66% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
  }
}
</style>
