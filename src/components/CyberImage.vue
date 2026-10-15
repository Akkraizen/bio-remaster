<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useCyberShape } from "@/hook/useCyberShape";
import { reducedMotion } from "@/hook/usePreferences.ts";

const props = defineProps<{
  src: string;
  alt?: string;
  cornerSize?: number;
  borderWidth?: number;
}>();

// @ts-ignore
const { containerRef, getClipPath } = useCyberShape(() => ({
  variant: "cyber-image-bottom",
  cornerSize: props.cornerSize ?? 20,
  borderWidth: props.borderWidth ?? 10
}));

// Static noise is shown until the image loads, then it "powers on" like a CRT
const image = ref<HTMLImageElement | null>(null);
const loaded = ref(false);

const onLoad = () => {
  loaded.value = true;
};

// A cached image can finish loading before the listener is attached
onMounted(() => {
  if (image.value?.complete && image.value.naturalWidth > 0) onLoad();
});

watch(
  () => props.src,
  () => {
    loaded.value = false;
  }
);

// ---------------------------------------------------------------------------
// Periodic interference: every image glitches on its own random schedule
// ---------------------------------------------------------------------------

interface GlitchSlice {
  top: number;
  height: number;
  shift: number;
}

const GLITCH_DURATION = 450;
const random = (min: number, max: number) => min + Math.random() * (max - min);

const glitching = ref(false);
const slices = ref<GlitchSlice[]>([]);
const tintBand = ref({ top: 0, height: 0 });

let scheduleTimer: ReturnType<typeof setTimeout> | null = null;
let glitchTimer: ReturnType<typeof setTimeout> | null = null;
let onScreen = false;
let visibilityObserver: IntersectionObserver | null = null;

const makeSlice = (): GlitchSlice => ({
  top: random(0, 90),
  height: random(3, 18),
  shift: random(4, 14) * (Math.random() < 0.5 ? -1 : 1)
});

function glitch() {
  if (glitching.value || !loaded.value || reducedMotion()) return;

  slices.value = [makeSlice(), makeSlice()];
  tintBand.value = { top: random(0, 85), height: random(4, 15) };
  glitching.value = true;

  glitchTimer = setTimeout(() => {
    glitching.value = false;
  }, GLITCH_DURATION);
}

function schedule() {
  scheduleTimer = setTimeout(
    () => {
      // Off-screen images and hidden tabs skip their turn
      if (onScreen && !document.hidden) glitch();
      schedule();
    },
    random(5000, 11000)
  );
}

onMounted(() => {
  if (typeof IntersectionObserver !== "undefined" && containerRef.value) {
    visibilityObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    visibilityObserver.observe(containerRef.value);
  } else {
    onScreen = true;
  }
  schedule();
});

onBeforeUnmount(() => {
  if (scheduleTimer) clearTimeout(scheduleTimer);
  if (glitchTimer) clearTimeout(glitchTimer);
  visibilityObserver?.disconnect();
});
</script>

<template>
  <div ref="containerRef" class="cyber-image-container" @mouseenter="glitch()">
    <div class="cyber-border-left">
      <svg width="100%" height="100%" preserveAspectRatio="none">
        <defs>
          <pattern
            id="cyber-pattern"
            x="0"
            y="0"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 0 10 L 10 0 M -1 1 L 1 -1 M 9 11 L 11 9"
              stroke="black"
              stroke-width="2"
              opacity="0.3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cyber-pattern)" />
      </svg>
    </div>
    <div
      class="image-container"
      :class="{ glitching }"
      :style="{ clipPath: getClipPath }"
    >
      <div v-if="!loaded" class="image-static" aria-hidden="true" />
      <img
        ref="image"
        :src="src"
        :alt="alt"
        class="cyber-image"
        :class="{ loaded }"
        fetchpriority="high"
        @load="onLoad"
      />

      <!-- Interference: shifted, hue-split slices of the same image plus a tinted band -->
      <template v-if="glitching">
        <img
          v-for="(slice, index) in slices"
          :key="index"
          :src="src"
          alt=""
          aria-hidden="true"
          class="glitch-slice"
          :class="`slice-${index}`"
          :style="{
            clipPath: `inset(${slice.top}% 0 ${Math.max(0, 100 - slice.top - slice.height)}% 0)`,
            '--shift': `${slice.shift}px`
          }"
        />
        <div
          class="glitch-tint"
          aria-hidden="true"
          :style="{ top: `${tintBand.top}%`, height: `${tintBand.height}%` }"
        />
        <div class="glitch-scanlines" aria-hidden="true" />
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.cyber-image-container {
  position: relative;
  width: calc(100% - 10px);
  aspect-ratio: 1 / 1;
  display: block;
  overflow: hidden;
}

.cyber-image {
  height: 100%;
  width: 100%;
  object-fit: cover;
  opacity: 0;
  transition: transform 0.5s ease;

  &.loaded {
    opacity: 1;
    animation: crt-power-on 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }
}

// Collapsed bright line expands into the picture, like an old monitor turning on
@keyframes crt-power-on {
  0% {
    transform: scale(0.6, 0.008);
    filter: brightness(4) saturate(0);
  }
  35% {
    transform: scale(1, 0.008);
    filter: brightness(4) saturate(0);
  }
  65% {
    transform: scale(1, 1);
    filter: brightness(1.8) contrast(1.4);
  }
  80% {
    filter: brightness(0.8) hue-rotate(20deg);
  }
  100% {
    transform: none;
    filter: none;
  }
}

// ---------------------------------------------------------------------------
// Periodic interference
// ---------------------------------------------------------------------------

.image-container.glitching {
  animation: image-flicker 0.45s steps(1) forwards;
}

@keyframes image-flicker {
  0% {
    filter: none;
  }
  15% {
    filter: brightness(1.6) contrast(1.3);
  }
  30% {
    filter: brightness(0.7) saturate(1.8);
  }
  45% {
    filter: none;
  }
  70% {
    filter: brightness(1.3) hue-rotate(-20deg);
  }
  85%,
  100% {
    filter: none;
  }
}

.glitch-slice {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  mix-blend-mode: screen;
  animation: slice-jitter 0.45s steps(1) forwards;

  // Two slices with opposite hue shifts read as split color channels
  &.slice-0 {
    filter: hue-rotate(90deg) saturate(3);
  }

  &.slice-1 {
    filter: hue-rotate(-90deg) saturate(3);
    animation-direction: reverse;
  }
}

@keyframes slice-jitter {
  0% {
    transform: translateX(var(--shift));
    opacity: 1;
  }
  25% {
    transform: translateX(calc(var(--shift) * -0.6));
  }
  50% {
    transform: translateX(calc(var(--shift) * 0.3));
    opacity: 0.8;
  }
  75% {
    transform: translateX(calc(var(--shift) * -1.2));
    opacity: 1;
  }
  100% {
    transform: none;
    opacity: 0;
  }
}

.glitch-tint {
  position: absolute;
  left: 0;
  right: 0;
  pointer-events: none;
  background: vars.alpha(vars.$accent-color, 0.35);
  mix-blend-mode: color-dodge;
  animation: tint-flash 0.45s steps(2) forwards;
}

@keyframes tint-flash {
  0%,
  60% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.glitch-scanlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    vars.alpha(vars.$bg-color, 0.35) 0 1px,
    transparent 1px 3px
  );
  animation: tint-flash 0.45s steps(3) forwards;
}

// Animated noise placeholder while loading
.image-static {
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      0deg,
      vars.alpha(vars.$accent-color, 0.08) 0 2px,
      transparent 2px 4px
    ),
    repeating-linear-gradient(
      90deg,
      vars.alpha(vars.$text-color, 0.04) 0 1px,
      transparent 1px 3px
    );
  animation: static-shift 0.2s steps(3) infinite;
}

@keyframes static-shift {
  0% {
    background-position:
      0 0,
      0 0;
  }
  50% {
    background-position:
      0 3px,
      2px 0;
  }
  100% {
    background-position:
      0 -2px,
      -1px 0;
  }
}

.cyber-border-left {
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  bottom: 0;
  width: 10px;
  background: vars.$accent-color;
  animation: borderReveal 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes borderReveal {
  from {
    height: 0;
  }
  to {
    height: 100%;
  }
}

.image-container {
  position: absolute;
  left: 10px;
  width: calc(100% - 10px);
  height: 100%;
}
</style>
