<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { currentLocale, useI18n } from "@/i18n";
import { useTheme } from "@/hook/useTheme.ts";
import { preferences, reducedMotion, type ScreensaverMode } from "@/hook/usePreferences.ts";
import { screensaverActive } from "@/hook/useScreensaver.ts";
import { hasAchievement, unlockAchievement } from "@/utils/achievements.ts";
import { startIdleTrack, stopIdleTrack } from "@/utils/synthSounds.ts";
import { triggerGlitch } from "@/utils/glitchFx.ts";

const IDLE_MS = 60_000;
const CHECK_MS = 2_000;
const GRACE_MS = 500;
const FONT_SIZE = 16;
const FRAME_MS = 50;
const STAR_COUNT = 260;
const STAR_SPEED = 0.012;
const HOP_MS = 40_000;
const HOP_GLITCH_MS = 420;
const GLYPHS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>/{}#$%";

const { t } = useI18n();
const { logoUrl } = useTheme();

const canvas = ref<HTMLCanvasElement | null>(null);
const core = ref<HTMLElement | null>(null);
const now = ref(new Date());
const offset = ref({ x: 0, y: 0 });
const hopping = ref(false);

let lastActivity = Date.now();
let shownAt = 0;
let checkTimer: ReturnType<typeof setInterval> | null = null;
let clockTimer: ReturnType<typeof setInterval> | null = null;
let hopTimer: ReturnType<typeof setInterval> | null = null;
let hopTimeout: ReturnType<typeof setTimeout> | null = null;
let frame = 0;
let drops: number[] = [];
let lastFrame = 0;
let lastColorRead = 0;
let colors = { bg: "#000", accent: "#fff", text: "#fff" };

const pad = (value: number) => String(value).padStart(2, "0");
const hours = computed(() => pad(now.value.getHours()));
const minutes = computed(() => pad(now.value.getMinutes()));
const seconds = computed(() => pad(now.value.getSeconds()));
const date = computed(() =>
  now.value.toLocaleDateString(currentLocale.value === "ru" ? "ru-RU" : "en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  })
);
const idleFor = computed(() => {
  const total = Math.max(0, Math.floor((now.value.getTime() - shownAt) / 1000));
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
});
const minuteProgress = computed(() => now.value.getSeconds() / 59);
const coreStyle = computed(() => ({
  transform: `translate(calc(-50% + ${offset.value.x}px), calc(-50% + ${offset.value.y}px))`
}));

function readColors() {
  const styles = getComputedStyle(document.documentElement);
  colors = {
    bg: styles.getPropertyValue("--c-bg").trim() || colors.bg,
    accent: styles.getPropertyValue("--c-accent").trim() || colors.accent,
    text: styles.getPropertyValue("--c-text").trim() || colors.text
  };
}

interface Star {
  x: number;
  y: number;
  z: number;
}

let stars: Star[] = [];

const width = () => window.innerWidth;
const height = () => window.innerHeight;

const activeMode = (): ScreensaverMode =>
  hasAchievement("matrix") ? preferences.screensaverMode : "rain";

const spawnStar = (z = Math.random()): Star => ({
  x: Math.random() * 2 - 1,
  y: Math.random() * 2 - 1,
  z: Math.max(z, 0.02)
});

function resize() {
  const element = canvas.value;
  if (!element) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  element.width = width() * ratio;
  element.height = height() * ratio;
  element.getContext("2d")?.setTransform(ratio, 0, 0, ratio, 0, 0);
  const columns = Math.ceil(width() / FONT_SIZE);
  drops = Array.from({ length: columns }, () => Math.floor((Math.random() * -height()) / FONT_SIZE));
  stars = Array.from({ length: STAR_COUNT }, () => spawnStar());
}

function fade(context: CanvasRenderingContext2D, amount: number) {
  context.globalAlpha = amount;
  context.fillStyle = colors.bg;
  context.fillRect(0, 0, width(), height());
  context.globalAlpha = 1;
}

function drawRain(context: CanvasRenderingContext2D) {
  fade(context, 0.12);
  context.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;
  for (let index = 0; index < drops.length; index++) {
    const y = drops[index] * FONT_SIZE;
    const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    context.fillStyle = Math.random() < 0.04 ? colors.text : colors.accent;
    context.fillText(glyph, index * FONT_SIZE, y);
    if (y > height() && Math.random() > 0.975) drops[index] = 0;
    else drops[index]++;
  }
}

function drawStars(context: CanvasRenderingContext2D) {
  fade(context, 0.35);
  const centerX = width() / 2;
  const centerY = height() / 2;
  const scale = Math.max(width(), height()) / 2;
  for (let index = 0; index < stars.length; index++) {
    const star = stars[index];
    const prevX = centerX + (star.x / star.z) * scale;
    const prevY = centerY + (star.y / star.z) * scale;
    star.z -= STAR_SPEED;
    if (star.z <= 0.02) {
      stars[index] = spawnStar(1);
      continue;
    }
    const x = centerX + (star.x / star.z) * scale;
    const y = centerY + (star.y / star.z) * scale;
    if (x < 0 || x > width() || y < 0 || y > height()) {
      stars[index] = spawnStar(1);
      continue;
    }
    context.strokeStyle = index % 7 === 0 ? colors.text : colors.accent;
    context.lineWidth = Math.max(0.5, (1 - star.z) * 2.5);
    context.beginPath();
    context.moveTo(prevX, prevY);
    context.lineTo(x, y);
    context.stroke();
  }
}

function drawScope(context: CanvasRenderingContext2D, now: number) {
  fade(context, 0.22);
  const w = width();
  const h = height();
  const seconds = now / 1000;

  context.strokeStyle = colors.accent;
  context.globalAlpha = 0.12;
  context.lineWidth = 1;
  for (let x = 0; x <= w; x += 60) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, h);
    context.stroke();
  }
  for (let y = h / 2 % 60; y <= h; y += 60) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(w, y);
    context.stroke();
  }
  context.globalAlpha = 1;

  const amplitude = h * 0.18;
  context.lineWidth = 2;
  context.shadowColor = colors.accent;
  context.shadowBlur = 8;
  context.beginPath();
  for (let x = 0; x <= w; x += 4) {
    const phase = (x / w) * Math.PI * 2;
    const y =
      h / 2 +
      Math.sin(phase * 3 + seconds * 2.1) * amplitude * 0.6 +
      Math.sin(phase * 7 - seconds * 3.3) * amplitude * 0.25 +
      Math.sin(phase * 13 + seconds * 0.7) * amplitude * 0.15 * Math.sin(seconds * 0.4);
    if (x === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.stroke();
  context.shadowBlur = 0;
}

function draw(now: number) {
  frame = requestAnimationFrame(draw);
  if (now - lastFrame < FRAME_MS) return;
  lastFrame = now;

  const context = canvas.value?.getContext("2d");
  if (!context) return;
  if (now - lastColorRead > 500) {
    lastColorRead = now;
    readColors();
  }

  const mode = activeMode();
  if (mode === "stars") drawStars(context);
  else if (mode === "scope") drawScope(context, now);
  else drawRain(context);
}

function startRain() {
  readColors();
  resize();
  const context = canvas.value?.getContext("2d");
  if (context) {
    context.fillStyle = colors.bg;
    context.fillRect(0, 0, width(), height());
  }
  if (!reducedMotion()) frame = requestAnimationFrame(draw);
  if (hasAchievement("screensaver")) startIdleTrack();
}

function stopRain() {
  cancelAnimationFrame(frame);
  frame = 0;
  stopIdleTrack();
}

function dismiss() {
  if (!screensaverActive.value) return;
  screensaverActive.value = false;
  triggerGlitch("ambient");
  unlockAchievement("screensaver");
}

function onActivity() {
  lastActivity = Date.now();
  if (screensaverActive.value && lastActivity - shownAt > GRACE_MS) dismiss();
}

function checkIdle() {
  if (screensaverActive.value || !preferences.screensaver || document.hidden) return;
  if (document.documentElement.classList.contains("overlay-open")) return;
  if (Date.now() - lastActivity >= IDLE_MS) screensaverActive.value = true;
}

const activityEvents = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;

function hopRange() {
  const element = core.value;
  if (!element) return null;
  return {
    x: Math.max(0, (width() - element.offsetWidth) / 2 - 24),
    y: Math.max(0, (height() - element.offsetHeight) / 2 - 24)
  };
}

function clampOffset() {
  const range = hopRange();
  if (!range) return;
  const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));
  offset.value = { x: clamp(offset.value.x, range.x), y: clamp(offset.value.y, range.y) };
}

function hop() {
  const range = hopRange();
  if (!range) return;
  const next = () => ({
    x: Math.round((Math.random() * 2 - 1) * range.x),
    y: Math.round((Math.random() * 2 - 1) * range.y)
  });
  if (reducedMotion()) {
    offset.value = next();
    return;
  }
  hopping.value = true;
  hopTimeout = setTimeout(() => {
    offset.value = next();
    hopTimeout = setTimeout(() => (hopping.value = false), HOP_GLITCH_MS / 2);
  }, HOP_GLITCH_MS / 2);
}

function stopHops() {
  if (hopTimer) clearInterval(hopTimer);
  if (hopTimeout) clearTimeout(hopTimeout);
  hopTimer = null;
  hopTimeout = null;
  hopping.value = false;
  offset.value = { x: 0, y: 0 };
}

watch(screensaverActive, async (active) => {
  if (!active) {
    stopRain();
    stopHops();
    if (clockTimer) clearInterval(clockTimer);
    clockTimer = null;
    return;
  }
  shownAt = Date.now();
  now.value = new Date();
  clockTimer = setInterval(() => (now.value = new Date()), 1000);
  hopTimer = setInterval(hop, HOP_MS);
  await nextTick();
  startRain();
});

onMounted(() => {
  for (const name of activityEvents) window.addEventListener(name, onActivity, { passive: true, capture: true });
  window.addEventListener("resize", resize);
  window.addEventListener("resize", clampOffset);
  checkTimer = setInterval(checkIdle, CHECK_MS);
});

onBeforeUnmount(() => {
  for (const name of activityEvents) window.removeEventListener(name, onActivity, { capture: true });
  window.removeEventListener("resize", resize);
  window.removeEventListener("resize", clampOffset);
  if (checkTimer) clearInterval(checkTimer);
  if (clockTimer) clearInterval(clockTimer);
  stopHops();
  stopRain();
  screensaverActive.value = false;
});
</script>

<template>
  <Teleport to="body">
    <transition name="screensaver">
      <div v-if="screensaverActive" class="screensaver" aria-hidden="true" @click="dismiss">
        <canvas ref="canvas" class="rain"></canvas>
        <div ref="core" class="core" :class="{ hopping }" :style="coreStyle">
          <i class="frame"></i>
          <header class="core-head">
            <span class="tag">// SYS.IDLE</span>
            <span class="lock"><i class="dot"></i>{{ t("screensaver.locked") }}</span>
          </header>
          <div class="core-body">
            <div class="emblem">
              <svg class="orbit" viewBox="0 0 120 120">
                <circle class="orbit-outer" cx="60" cy="60" r="56" />
                <circle class="orbit-inner" cx="60" cy="60" r="48" />
              </svg>
              <img class="logo" :src="logoUrl" alt="" />
            </div>
            <div class="readout">
              <p class="idle" :data-text="t('screensaver.idle')">{{ t("screensaver.idle") }}</p>
              <p class="time">
                {{ hours }}<span class="colon">:</span>{{ minutes }}<span class="sec">{{ seconds }}</span>
              </p>
              <p class="date">{{ date }}</p>
              <div class="meter"><span :style="{ transform: `scaleX(${minuteProgress})` }"></span></div>
              <dl class="stats">
                <div>
                  <dt>{{ t("screensaver.idleFor") }}</dt>
                  <dd>{{ idleFor }}</dd>
                </div>
                <div>
                  <dt>{{ t("screensaver.mode") }}</dt>
                  <dd>{{ t(`settings.screensaverModes.${activeMode()}`) }}</dd>
                </div>
              </dl>
            </div>
          </div>
          <footer class="resume">&gt; {{ t("screensaver.resume") }}<span class="caret">_</span></footer>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.screensaver {
  position: fixed;
  inset: 0;
  z-index: 9500;
  background: vars.$bg-color;
  cursor: none;
  overflow: hidden;
}

.rain {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.55;
}

.core {
  position: absolute;
  top: 50%;
  left: 50%;
  --cut: 10px;
  width: min(560px, calc(100vw - 32px));
  background: vars.alpha(vars.$bg-color, 0.88);
  box-shadow: inset 0 0 30px vars.alpha(vars.$accent-color, 0.06);
  clip-path: polygon(0 0, calc(100% - var(--cut)) 0, 100% var(--cut), 100% 100%, var(--cut) 100%, 0 calc(100% - var(--cut)));
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(0deg, transparent 0 3px, vars.alpha(vars.$accent-color, 0.04) 3px 4px);
    pointer-events: none;
  }

  &.hopping {
    animation: hop-glitch 0.42s steps(1);
  }
}

.frame {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: vars.alpha(vars.$accent-color, 0.55);
  pointer-events: none;
  clip-path: polygon(
    evenodd,
    0 0,
    calc(100% - var(--cut)) 0,
    100% var(--cut),
    100% 100%,
    var(--cut) 100%,
    0 calc(100% - var(--cut)),
    0 0,
    1px 1px,
    1px calc(100% - var(--cut) - 0.4px),
    calc(var(--cut) + 0.4px) calc(100% - 1px),
    calc(100% - 1px) calc(100% - 1px),
    calc(100% - 1px) calc(var(--cut) + 0.4px),
    calc(100% - var(--cut) - 0.4px) 1px,
    1px 1px
  );
}

.core-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 2rem 0.5rem 1rem;
  font-size: 0.7rem;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: vars.$bg-color;
  background: vars.$accent-color;
}

.lock {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.dot {
  width: 7px;
  height: 7px;
  background: vars.$bg-color;
  animation: blink 1s steps(2) infinite;
}

.core-body {
  display: flex;
  align-items: center;
  gap: 1.75rem;
  padding: 1.5rem 1.75rem 1.25rem;
}

.emblem {
  position: relative;
  flex-shrink: 0;
  width: 132px;
  height: 132px;
  display: grid;
  place-items: center;
}

.orbit {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  fill: none;
  stroke: vars.$accent-color;
}

.orbit-outer {
  stroke-width: 1.5;
  stroke-dasharray: 60 12 4 12;
  opacity: 0.8;
  transform-origin: center;
  animation: spin 18s linear infinite;
}

.orbit-inner {
  stroke-width: 1;
  stroke-dasharray: 2 6;
  opacity: 0.5;
  transform-origin: center;
  animation: spin 30s linear infinite reverse;
}

.logo {
  width: 68px;
  height: 68px;
  filter: drop-shadow(0 0 16px vars.alpha(vars.$accent-color, 0.6));
  animation: logo-glitch 4s steps(1) infinite;
}

.readout {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.idle {
  position: relative;
  margin: 0 0 0.35rem;
  color: vars.$accent-color;
  font-size: 0.95rem;
  font-weight: bold;
  letter-spacing: 4px;

  &::before,
  &::after {
    content: attr(data-text);
    position: absolute;
    inset: 0;
    opacity: 0;
  }

  &::before {
    color: vars.$glitch-color-1;
    animation: idle-split 3.2s steps(1) infinite;
  }

  &::after {
    color: vars.$glitch-color-2;
    animation: idle-split 3.2s steps(1) 0.15s infinite reverse;
  }
}

.time {
  margin: 0;
  font-size: 3.4rem;
  line-height: 1;
  font-weight: bold;
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px;
  color: vars.$text-color;
  text-shadow: 0 0 18px vars.alpha(vars.$accent-color, 0.45);
}

.colon {
  color: vars.$accent-color;
  animation: blink 1s steps(2) infinite;
}

.sec {
  margin-left: 0.4rem;
  font-size: 1.2rem;
  color: vars.$accent-color;
  vertical-align: top;
}

.date {
  margin: 0.45rem 0 0.75rem;
  font-size: 0.75rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  opacity: 0.65;
}

.meter {
  height: 3px;
  background: vars.alpha(vars.$accent-color, 0.15);

  span {
    display: block;
    height: 100%;
    background: vars.$accent-color;
    box-shadow: 0 0 8px vars.$accent-color;
    transform-origin: left;
    transition: transform 0.9s linear;
  }
}

.stats {
  display: flex;
  gap: 1.5rem;
  margin: 0.75rem 0 0;
  font-size: 0.7rem;
  letter-spacing: 1px;
  text-transform: uppercase;

  dt {
    opacity: 0.5;
  }

  dd {
    margin: 0.15rem 0 0;
    color: vars.$accent-color;
    font-variant-numeric: tabular-nums;
  }
}

.resume {
  padding: 0.6rem 1.25rem 0.9rem;
  border-top: 1px dashed vars.alpha(vars.$accent-color, 0.3);
  font-size: 0.7rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  opacity: 0.7;
}

.caret {
  animation: blink 1s steps(2) infinite;
}

@media (max-width: 520px) {
  .core-body {
    flex-direction: column;
    gap: 1rem;
  }

  .readout {
    text-align: center;
  }

  .stats {
    justify-content: center;
  }

  .time {
    font-size: 2.6rem;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes hop-glitch {
  0% { opacity: 1; filter: none; }
  15% { opacity: 0.4; filter: hue-rotate(90deg); clip-path: polygon(0 10%, 100% 10%, 100% 45%, 0 45%); }
  35% { opacity: 0.9; filter: none; clip-path: polygon(0 55%, 100% 55%, 100% 90%, 0 90%); }
  50% { opacity: 0; }
  65% { opacity: 0.8; filter: hue-rotate(-90deg); clip-path: polygon(0 30%, 100% 30%, 100% 70%, 0 70%); }
  85% { opacity: 0.5; filter: none; }
}

@keyframes logo-glitch {
  0%, 92%, 100% { transform: none; filter: drop-shadow(0 0 16px vars.alpha(vars.$accent-color, 0.6)); }
  93% { transform: translate(-3px, 1px) skewX(8deg); }
  95% { transform: translate(3px, -1px) skewX(-6deg); filter: hue-rotate(90deg); }
  97% { transform: translate(-1px, 0); }
}

@keyframes idle-split {
  0%, 88%, 100% { opacity: 0; transform: none; }
  90% { opacity: 0.8; transform: translate(-3px, 0); clip-path: inset(10% 0 55% 0); }
  94% { opacity: 0.8; transform: translate(3px, 0); clip-path: inset(60% 0 5% 0); }
}

@keyframes blink {
  50% { opacity: 0.15; }
}

:root[data-motion="reduced"] .screensaver {
  .orbit-outer,
  .orbit-inner,
  .logo,
  .idle::before,
  .idle::after,
  .dot,
  .colon,
  .caret {
    animation: none;
  }
}

.screensaver-enter-active {
  animation: cyber-glitch-in 0.6s steps(1) forwards;
}

.screensaver-leave-active {
  animation: cyber-glitch-out 0.25s steps(1) forwards;
}
</style>
