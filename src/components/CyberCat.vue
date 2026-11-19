<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "@/i18n";
import { reducedMotion } from "@/hook/usePreferences.ts";
import { screensaverActive } from "@/hook/useScreensaver.ts";
import { hasAchievement } from "@/utils/achievements.ts";
import { showToast } from "@/utils/easterEggs.ts";
import { playConfirm } from "@/utils/synthSounds.ts";

const FIRST_DELAY: [number, number] = [40_000, 90_000];
const NEXT_DELAY: [number, number] = [120_000, 240_000];
const RUN_MS = 7_000;
const STEP_MS = 160;

const frames = [
  "   /\\_/\\\n  ( o.o )__\n   /  /  \\ ~",
  "   /\\_/\\\n  ( o.o )__\n   \\  \\  / ~"
];

const { t } = useI18n();
const running = ref(false);
const frame = ref(0);
const top = ref(80);

let scheduleTimer: ReturnType<typeof setTimeout> | null = null;
let stepTimer: ReturnType<typeof setInterval> | null = null;

const between = ([min, max]: [number, number]) => min + Math.random() * (max - min);

function schedule(range: [number, number]) {
  scheduleTimer = setTimeout(run, between(range));
}

function run() {
  const allowed = hasAchievement("cat") && !reducedMotion() && !document.hidden && !screensaverActive.value;
  if (!allowed) return schedule(NEXT_DELAY);
  top.value = 70 + Math.random() * 20;
  running.value = true;
  stepTimer = setInterval(() => (frame.value = (frame.value + 1) % frames.length), STEP_MS);
}

function finish() {
  running.value = false;
  if (stepTimer) clearInterval(stepTimer);
  stepTimer = null;
  schedule(NEXT_DELAY);
}

function pet() {
  playConfirm();
  showToast(t("achievements.catPet"));
}

onMounted(() => schedule(FIRST_DELAY));

onBeforeUnmount(() => {
  if (scheduleTimer) clearTimeout(scheduleTimer);
  if (stepTimer) clearInterval(stepTimer);
});
</script>

<template>
  <Teleport to="body">
    <pre
      v-if="running"
      class="cyber-cat"
      :style="{ top: `${top}vh`, animationDuration: `${RUN_MS}ms` }"
      aria-hidden="true"
      @click="pet"
      @animationend="finish"
    >{{ frames[frame] }}</pre>
  </Teleport>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.cyber-cat {
  position: fixed;
  left: 100vw;
  z-index: 950;
  margin: 0;
  color: vars.$accent-color;
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
  line-height: 1.15;
  text-shadow: 0 0 6px vars.alpha(vars.$accent-color, 0.6);
  cursor: pointer;
  user-select: none;
  animation: cat-run linear forwards;
}

@keyframes cat-run {
  to {
    transform: translateX(calc(-100vw - 100%));
  }
}
</style>
