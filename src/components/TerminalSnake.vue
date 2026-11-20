<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef } from "vue";
import { createSnake, step, tickDelay, turn, type Direction } from "@/utils/snake.ts";
import { playAlarm, playConfirm, playTypeTick } from "@/utils/synthSounds.ts";
import { isTouch } from "@/hook/useOverlays.ts";

const WIDTH = 28;
const HEIGHT = 12;
const SWIPE_MIN = 24;

const emit = defineEmits<{ finish: [score: number] }>();

const state = shallowRef(createSnake(WIDTH, HEIGHT));
let timer: ReturnType<typeof setTimeout> | undefined;
let finished = false;
let swipeStart: { x: number; y: number } | null = null;

const keys: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
  k: "up",
  j: "down",
  h: "left",
  l: "right"
};

const cells = computed(() => {
  const { body, food, over } = state.value;
  const kinds: string[][] = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(""));
  body.forEach((part, index) => {
    if (kinds[part.y]?.[part.x] !== undefined) kinds[part.y][part.x] = index === 0 ? (over ? "dead" : "head") : "body";
  });
  if (food.x >= 0) kinds[food.y][food.x] = "food";
  return kinds;
});

function finish() {
  if (finished) return;
  finished = true;
  clearTimeout(timer);
  emit("finish", state.value.score);
}

function tick() {
  const previous = state.value.score;
  state.value = step(state.value);
  if (state.value.score > previous) playConfirm();
  if (state.value.over) {
    playAlarm(true);
    timer = setTimeout(finish, 700);
    return;
  }
  timer = setTimeout(tick, tickDelay(state.value.score));
}

function steer(direction: Direction) {
  const next = { ...state.value, queue: [...state.value.queue] };
  turn(next, direction);
  state.value = next;
  playTypeTick();
}

function onPointerDown(event: PointerEvent) {
  swipeStart = { x: event.clientX, y: event.clientY };
}

function onPointerMove(event: PointerEvent) {
  if (!swipeStart) return;
  const dx = event.clientX - swipeStart.x;
  const dy = event.clientY - swipeStart.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN) return;
  steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
  swipeStart = { x: event.clientX, y: event.clientY };
}

function onPointerUp() {
  swipeStart = null;
}

function onKey(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (key === "q") {
    event.preventDefault();
    event.stopPropagation();
    finish();
    return;
  }
  const direction = keys[key];
  if (!direction) return;
  event.preventDefault();
  event.stopPropagation();
  steer(direction);
}

onMounted(() => {
  window.addEventListener("keydown", onKey, true);
  timer = setTimeout(tick, 400);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKey, true);
  clearTimeout(timer);
});
</script>

<template>
  <div class="snake" role="application" aria-label="Snake">
    <div class="snake-hud">
      <span>SNAKE.EXE</span>
      <span>SCORE {{ String(state.score).padStart(3, "0") }}</span>
    </div>
    <div
      class="snake-field"
      :style="{ '--w': WIDTH }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <template v-for="(row, y) in cells" :key="y">
        <span v-for="(kind, x) in row" :key="x" class="cell" :class="kind" />
      </template>
    </div>
    <div v-if="isTouch" class="snake-pad">
      <button type="button" class="pad-up" aria-label="Up" @click.stop="steer('up')">↑</button>
      <button type="button" class="pad-left" aria-label="Left" @click.stop="steer('left')">←</button>
      <button type="button" class="pad-quit" @click.stop="finish">QUIT</button>
      <button type="button" class="pad-right" aria-label="Right" @click.stop="steer('right')">→</button>
      <button type="button" class="pad-down" aria-label="Down" @click.stop="steer('down')">↓</button>
    </div>
    <p v-if="isTouch" class="snake-help">swipe on the field or use the arrows</p>
    <p v-else class="snake-help">←↑↓→ · WASD · hjkl — q: quit</p>
  </div>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.snake {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.6rem;
  width: fit-content;
  max-width: 100%;
}

.snake-hud {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  color: vars.$accent-color;
  font-size: 0.8rem;
  letter-spacing: 1px;
}

.snake-field {
  --cell: clamp(7px, calc((100vw - 64px) / var(--w) - 2px), 14px);
  display: grid;
  grid-template-columns: repeat(var(--w), var(--cell));
  grid-auto-rows: var(--cell);
  touch-action: none;
  gap: 2px;
  padding: 4px;
  border: 1px solid vars.alpha(vars.$accent-color, 0.4);
}

.cell {
  background: vars.alpha(vars.$accent-color, 0.06);

  &.body {
    background: vars.alpha(vars.$accent-color, 0.7);
  }

  &.head {
    background: vars.$accent-color;
    box-shadow: 0 0 6px vars.$accent-color;
  }

  &.food {
    background: vars.$warning-color;
    clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  }

  &.dead {
    background: vars.$warning-color;
  }
}

.snake-pad {
  display: grid;
  grid-template-columns: repeat(3, 56px);
  grid-template-rows: repeat(3, 44px);
  grid-template-areas:
    ". up ."
    "left quit right"
    ". down .";
  gap: 6px;
  align-self: center;
  margin-top: 0.4rem;

  button {
    background: vars.alpha(vars.$accent-color, 0.08);
    border: 1px solid vars.alpha(vars.$accent-color, 0.45);
    color: vars.$accent-color;
    font: inherit;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    touch-action: manipulation;

    &:active {
      background: vars.$accent-color;
      color: vars.$on-accent-color;
    }
  }

  .pad-up { grid-area: up; }
  .pad-down { grid-area: down; }
  .pad-left { grid-area: left; }
  .pad-right { grid-area: right; }

  .pad-quit {
    grid-area: quit;
    font-size: 0.65rem;
    letter-spacing: 1px;
  }
}

.snake-help {
  margin: 0;
  font-size: 0.75rem;
  opacity: 0.6;
}
</style>
