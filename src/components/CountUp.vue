<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { reducedMotion } from "@/hook/usePreferences.ts";
import { playTypeTick } from "@/utils/synthSounds.ts";

const props = withDefaults(
  defineProps<{
    value: number;
    duration?: number;
    sound?: boolean;
  }>(),
  { duration: 1200, sound: true }
);

const root = ref<HTMLElement | null>(null);
const current = ref(0);
let frame = 0;
let observer: IntersectionObserver | null = null;

const format = (n: number) =>
  String(n).padStart(String(props.value).length, "0");
const display = ref(format(0));

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function start() {
  cancelAnimationFrame(frame);

  if (reducedMotion() || props.value <= 0) {
    current.value = props.value;
    display.value = format(props.value);
    return;
  }

  const startedAt = performance.now();
  const step = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / props.duration);
    const next = Math.round(easeOutCubic(progress) * props.value);

    if (next !== current.value) {
      current.value = next;
      display.value = format(next);
      if (props.sound) playTypeTick();
    }
    if (progress < 1) frame = requestAnimationFrame(step);
  };

  current.value = 0;
  display.value = format(0);
  frame = requestAnimationFrame(step);
}

onMounted(() => {
  if (!root.value || typeof IntersectionObserver === "undefined")
    return start();

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer?.disconnect();
        observer = null;
        start();
      }
    },
    { threshold: 0.5 }
  );
  observer.observe(root.value);
});

watch(() => props.value, start);

onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  observer?.disconnect();
});
</script>

<template>
  <span ref="root" class="count-up">
    <span class="sr-only">{{ value }}</span>
    <span aria-hidden="true">{{ display }}</span>
  </span>
</template>
