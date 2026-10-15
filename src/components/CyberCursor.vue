<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { preferences } from "@/hook/usePreferences.ts";
import { findCursorTarget } from "@/utils/uiSounds.ts";

const finePointer = ref(false);
const visible = ref(false);
const pressed = ref(false);

const pointer = ref({ x: -100, y: -100 });
const frame = ref({ x: -100, y: -100, width: 24, height: 24 });
const locked = ref(false);

let raf = 0;
let tracking = false;
let mediaQuery: MediaQueryList | null = null;

const enabled = computed(() => finePointer.value && preferences.cursor);

const FREE_SIZE = 24;
const PADDING = 6;
const AIM_LOOKAHEAD_MS = 90;
const AIM_MAX_SHIFT = 60;

const velocity = { x: 0, y: 0 };
let lastMoveAt = 0;

function aimPoint() {
  const clamp = (v: number) =>
    Math.max(-AIM_MAX_SHIFT, Math.min(AIM_MAX_SHIFT, v));
  return {
    x: pointer.value.x + clamp(velocity.x * AIM_LOOKAHEAD_MS),
    y: pointer.value.y + clamp(velocity.y * AIM_LOOKAHEAD_MS)
  };
}

function setFrame(x: number, y: number, width: number, height: number) {
  const current = frame.value;
  if (
    current.x === x &&
    current.y === y &&
    current.width === width &&
    current.height === height
  )
    return;
  frame.value = { x, y, width, height };
}

function update() {
  const { x, y } = pointer.value;
  const target = findCursorTarget(document.elementFromPoint(x, y), aimPoint());
  velocity.x *= 0.85;
  velocity.y *= 0.85;

  if (target) {
    const rect = target.getBoundingClientRect();
    setFrame(
      Math.round(rect.left - PADDING),
      Math.round(rect.top - PADDING),
      Math.round(rect.width + PADDING * 2),
      Math.round(rect.height + PADDING * 2)
    );
  } else {
    setFrame(x - FREE_SIZE / 2, y - FREE_SIZE / 2, FREE_SIZE, FREE_SIZE);
  }
  if (locked.value !== !!target) locked.value = !!target;
}

function track() {
  if (!tracking) return;
  update();
  raf = requestAnimationFrame(track);
}

function startTracking() {
  if (tracking || !enabled.value) return;
  tracking = true;
  raf = requestAnimationFrame(track);
}

function stopTracking() {
  tracking = false;
  cancelAnimationFrame(raf);
  raf = 0;
}

function onMove(event: PointerEvent) {
  if (event.pointerType !== "mouse") return;
  const dt = event.timeStamp - lastMoveAt;
  if (dt > 0 && dt < 100) {
    velocity.x =
      velocity.x * 0.5 + ((event.clientX - pointer.value.x) / dt) * 0.5;
    velocity.y =
      velocity.y * 0.5 + ((event.clientY - pointer.value.y) / dt) * 0.5;
  }
  lastMoveAt = event.timeStamp;
  pointer.value = { x: event.clientX, y: event.clientY };
  visible.value = true;
  startTracking();
}

const onLeave = (event: MouseEvent) => {
  if (event.relatedTarget) return;
  visible.value = false;
  stopTracking();
};
const onVisibilityChange = () => {
  if (document.hidden) stopTracking();
  else if (visible.value) startTracking();
};
const onDown = () => (pressed.value = true);
const onUp = () => (pressed.value = false);
const onMediaChange = () => (finePointer.value = !!mediaQuery?.matches);

watch(enabled, (value) => {
  if (!value) stopTracking();
  else if (visible.value) startTracking();
});

onMounted(() => {
  mediaQuery = window.matchMedia("(pointer: fine)");
  finePointer.value = mediaQuery.matches;
  mediaQuery.addEventListener("change", onMediaChange);

  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("mouseout", onLeave);
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("pointerdown", onDown);
  window.addEventListener("pointerup", onUp);
});

onBeforeUnmount(() => {
  stopTracking();
  mediaQuery?.removeEventListener("change", onMediaChange);
  window.removeEventListener("pointermove", onMove);
  document.removeEventListener("mouseout", onLeave);
  document.removeEventListener("visibilitychange", onVisibilityChange);
  window.removeEventListener("pointerdown", onDown);
  window.removeEventListener("pointerup", onUp);
});
</script>

<template>
  <div
    v-if="enabled"
    class="cyber-cursor"
    :class="{ visible, locked, pressed }"
    aria-hidden="true"
  >
    <div
      class="cursor-dot"
      :style="{ transform: `translate(${pointer.x}px, ${pointer.y}px)` }"
    />
    <div
      class="cursor-frame"
      :style="{
        transform: `translate(${frame.x}px, ${frame.y}px)`,
        width: `${frame.width}px`,
        height: `${frame.height}px`
      }"
    >
      <span class="corner tl" />
      <span class="corner tr" />
      <span class="corner bl" />
      <span class="corner br" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.cyber-cursor {
  position: fixed;
  inset: 0;
  z-index: 100000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;

  &.visible {
    opacity: 1;
  }
}

.cursor-dot {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;

  // Crosshair made of two short lines
  &::before,
  &::after {
    content: "";
    position: absolute;
    background: vars.$accent-color;
    box-shadow: 0 0 4px vars.$accent-color;
  }

  &::before {
    width: 10px;
    height: 2px;
    left: -5px;
    top: -1px;
  }

  &::after {
    width: 2px;
    height: 10px;
    left: -1px;
    top: -5px;
  }
}

.cursor-frame {
  position: absolute;
  top: 0;
  left: 0;
  transition:
    transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1),
    width 0.18s cubic-bezier(0.2, 0.8, 0.2, 1),
    height 0.18s cubic-bezier(0.2, 0.8, 0.2, 1);

  .corner {
    position: absolute;
    width: 7px;
    height: 7px;
    border: 2px solid vars.$accent-color;
    opacity: 0.7;
    transition:
      opacity 0.2s ease,
      transform 0.15s ease;

    &.tl {
      top: 0;
      left: 0;
      border-right: none;
      border-bottom: none;
    }
    &.tr {
      top: 0;
      right: 0;
      border-left: none;
      border-bottom: none;
    }
    &.bl {
      bottom: 0;
      left: 0;
      border-right: none;
      border-top: none;
    }
    &.br {
      bottom: 0;
      right: 0;
      border-left: none;
      border-top: none;
    }
  }
}

.locked .corner {
  opacity: 1;
  width: 10px;
  height: 10px;
}

.pressed .corner {
  transform: scale(0.8);
}

:root[data-motion="reduced"] .cursor-frame {
  transition: none;
}
</style>
