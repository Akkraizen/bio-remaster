import { watch } from "vue";
import { preferences } from "@/hook/usePreferences.ts";
import { getSfxOutput, isSoundEnabled } from "@/utils/playTransitionSound.ts";

const between = (min: number, max: number) => min + Math.random() * (max - min);

const output = () => (isSoundEnabled() ? getSfxOutput() : null);

type NoiseColor = "white" | "pink";
const noiseBuffers: Partial<Record<NoiseColor, AudioBuffer>> = {};

function getNoiseBuffer(ctx: AudioContext, color: NoiseColor = "pink") {
  const cached = noiseBuffers[color];
  if (cached) return cached;

  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0,
    b1 = 0,
    b2 = 0,
    b3 = 0,
    b4 = 0,
    b5 = 0,
    b6 = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    if (color === "white") {
      data[i] = white;
      continue;
    }
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  noiseBuffers[color] = buffer;
  return buffer;
}

function stutter(
  param: AudioParam,
  start: number,
  duration: number,
  gain: number,
  density: number
) {
  const end = start + duration;
  param.setValueAtTime(0, start);
  for (let t = start; t < end; t += between(0.008, 0.045)) {
    const on = Math.random() < density;
    param.setValueAtTime(
      on ? gain * between(0.45, 1) : gain * between(0, 0.06),
      t
    );
  }
  param.setValueAtTime(0, end);
}

interface StaticOptions {
  duration: number;
  gain: number;
  /** Центры полосовых фильтров, Гц */
  bands: number[];
  q?: number;
  /** Во сколько раз уходят частоты полос к концу звука */
  sweep?: number;
  density?: number;
  delay?: number;
  color?: NoiseColor;
}

function staticBurst({
  duration,
  gain,
  bands,
  q = 1.4,
  sweep,
  density = 0.75,
  delay = 0,
  color = "pink"
}: StaticOptions) {
  const out = output();
  if (!out) return;
  const { ctx, bus } = out;

  const start = ctx.currentTime + delay;
  const end = start + duration;

  const source = ctx.createBufferSource();
  source.buffer = getNoiseBuffer(ctx, color);

  const env = ctx.createGain();
  stutter(env.gain, start, duration, gain, density);

  for (const freq of bands) {
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = q;
    filter.frequency.setValueAtTime(freq, start);
    if (sweep) filter.frequency.exponentialRampToValueAtTime(freq * sweep, end);
    source.connect(filter).connect(env);
  }

  env.connect(bus);
  source.start(start, Math.random() * 1.5, duration + 0.05);
  source.onended = () => env.disconnect();
}

const crushCurves = new Map<number, Float32Array<ArrayBuffer>>();

// Квантование амплитуды до нескольких уровней — "битый" цифровой звук
function crushCurve(levels: number) {
  let curve = crushCurves.get(levels);
  if (!curve) {
    curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) {
      const x = (i / (curve.length - 1)) * 2 - 1;
      curve[i] = Math.round(x * levels) / levels;
    }
    crushCurves.set(levels, curve);
  }
  return curve;
}

interface DataToneOptions {
  freq: number;
  freqEnd?: number;
  /** Разброс случайных скачков частоты, доля от текущей */
  spread?: number;
  duration: number;
  gain: number;
  type?: OscillatorType;
  levels?: number;
  density?: number;
  delay?: number;
}

// Тон с частотой, скачущей ступеньками, как у передачи данных
function dataTone({
  freq,
  freqEnd = freq,
  spread = 0.2,
  duration,
  gain,
  type = "sawtooth",
  levels = 4,
  density = 0.85,
  delay = 0
}: DataToneOptions) {
  const out = output();
  if (!out) return;
  const { ctx, bus } = out;

  const start = ctx.currentTime + delay;
  const end = start + duration;

  const osc = ctx.createOscillator();
  osc.type = type;
  for (let t = start; t < end; t += between(0.008, 0.016)) {
    const progress = (t - start) / duration;
    const base = freq * Math.pow(freqEnd / freq, progress);
    osc.frequency.setValueAtTime(base * (1 + between(-spread, spread)), t);
  }

  const crusher = ctx.createWaveShaper();
  crusher.curve = crushCurve(levels);

  const env = ctx.createGain();
  stutter(env.gain, start, duration, gain, density);

  osc.connect(crusher).connect(env).connect(bus);
  osc.start(start);
  osc.stop(end + 0.02);
  osc.onended = () => env.disconnect();
}

function throttle<T extends unknown[]>(fn: (...args: T) => void, ms: number) {
  let last = 0;
  return (...args: T) => {
    const now = performance.now();
    if (now - last < ms) return;
    last = now;
    fn(...args);
  };
}

const TRANSITION_CONTOUR = [
  0.2, 0.7, 0.97, 1, 0.89, 0.28, 0.25, 0.27, 0.39, 0.19, 0.35, 0.43, 0.88, 0.49,
  0.19, 0.53, 0.56, 0.81, 0.82, 0.4, 0.19, 0.24, 0.19, 0.24, 0.19, 0.19
];
const TRANSITION_STEP = 0.02;
const TRANSITION_GAIN = 0.77;
const TRANSITION_BANDS: [number, number][] = [
  [500, 1],
  [1000, 0.9],
  [2500, 0.8],
  [3500, 1.4],
  [6000, 3.2]
];
const TRANSITION_MS = TRANSITION_CONTOUR.length * TRANSITION_STEP * 1000;

let lastTransitionAt = -Infinity;

export function playTransitionSound() {
  const now = performance.now();
  if (now - lastTransitionAt < TRANSITION_MS) return;
  lastTransitionAt = now;

  const out = output();
  if (!out) return;
  const { ctx, bus } = out;

  const start = ctx.currentTime;
  const duration = TRANSITION_MS / 1000;

  const source = ctx.createBufferSource();
  source.buffer = getNoiseBuffer(ctx);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0, start);
  TRANSITION_CONTOUR.forEach((level, i) => {
    env.gain.setValueAtTime(
      TRANSITION_GAIN * level * between(0.75, 1.15),
      start + i * TRANSITION_STEP
    );
  });
  env.gain.setValueAtTime(0, start + duration);

  for (const [freq, weight] of TRANSITION_BANDS) {
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 1.4;
    filter.frequency.value = freq;
    const bandGain = ctx.createGain();
    bandGain.gain.value = weight;
    source.connect(filter).connect(bandGain).connect(env);
  }

  env.connect(bus);
  source.start(start, Math.random() * 1.3, duration + 0.05);
  source.onended = () => env.disconnect();
}

export const playHoverTick = throttle(() => {
  staticBurst({
    duration: 0.03,
    gain: 0.35,
    bands: [6000],
    density: 0.9,
    color: "white"
  });
}, 45);

export const playTypeTick = throttle(() => {
  staticBurst({
    duration: 0.018,
    gain: 0.3,
    bands: [between(2500, 5000)],
    q: 2,
    density: 1,
    color: "white"
  });
}, 28);

export const playCarouselTick = throttle(() => {
  staticBurst({ duration: 0.05, gain: 0.35, bands: [500, 6000] });
  dataTone({ freq: 1200, spread: 0.3, duration: 0.04, gain: 0.05 });
}, 60);

export function playOpenSweep() {
  staticBurst({ duration: 0.22, gain: 0.4, bands: [400, 3000], sweep: 3 });
  dataTone({
    freq: 200,
    freqEnd: 900,
    spread: 0.25,
    duration: 0.2,
    gain: 0.06
  });
}

export function playCloseSweep() {
  staticBurst({ duration: 0.18, gain: 0.4, bands: [3000, 6000], sweep: 0.25 });
  dataTone({
    freq: 900,
    freqEnd: 180,
    spread: 0.25,
    duration: 0.16,
    gain: 0.06
  });
}

export function playConfirm() {
  staticBurst({ duration: 0.04, gain: 0.35, bands: [1500], q: 3, density: 1 });
  staticBurst({
    duration: 0.05,
    gain: 0.35,
    bands: [3000],
    q: 3,
    density: 1,
    delay: 0.06
  });
  dataTone({
    freq: 1100,
    spread: 0.1,
    duration: 0.08,
    gain: 0.05,
    type: "square"
  });
}

export function playRoulette() {
  for (let i = 0; i < 9; i++) {
    const delay = i * 0.03 + i * i * 0.004;
    staticBurst({
      duration: 0.03,
      gain: 0.3,
      bands: [between(800, 5000)],
      q: 2.5,
      density: 1,
      delay
    });
    dataTone({
      freq: between(500, 1500),
      spread: 0.15,
      duration: 0.03,
      gain: 0.05,
      type: "square",
      delay
    });
  }
}

const playSoftAlarm = throttle(() => {
  dataTone({ freq: 140, spread: 0.05, duration: 0.2, gain: 0.12, levels: 3 });
  staticBurst({ duration: 0.2, gain: 0.3, bands: [500], density: 0.6 });
}, 1500);

export function playAlarm(soft = false) {
  if (soft) {
    playSoftAlarm();
    return;
  }
  for (let i = 0; i < 2; i++) {
    const delay = i * 0.32;
    dataTone({
      freq: 170,
      freqEnd: 110,
      spread: 0.06,
      duration: 0.25,
      gain: 0.16,
      levels: 3,
      delay
    });
    staticBurst({
      duration: 0.25,
      gain: 0.4,
      bands: [500, 1000],
      density: 0.6,
      delay
    });
  }
}

export function playDisconnect() {
  staticBurst({
    duration: 0.4,
    gain: 0.5,
    bands: [3000, 6000],
    sweep: 0.08,
    density: 0.6
  });
  dataTone({
    freq: 1400,
    freqEnd: 60,
    spread: 0.3,
    duration: 0.35,
    gain: 0.08
  });
}

export function playStatic() {
  staticBurst({
    duration: 0.3,
    gain: 0.45,
    bands: [500, 2500, 6000],
    density: 0.75
  });
}

let ambientNodes: { stop: () => void } | null = null;
let ambientAllowed = false;

function startAmbient() {
  if (ambientNodes) return;
  const out = getSfxOutput();
  if (!out) return;
  const { ctx, bus } = out;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 2);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 180;

  // Two detuned low oscillators give a slow beating hum
  const oscillators = [55, 55.4, 110.3].map((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = i === 2 ? "sine" : "sawtooth";
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = i === 2 ? 0.15 : 0.3;
    osc.connect(g).connect(filter);
    osc.start();
    return osc;
  });

  filter.connect(master).connect(bus);

  // Шипение эфира и редкие потрескивания поверх гула
  const hiss = ctx.createBufferSource();
  hiss.buffer = getNoiseBuffer(ctx);
  hiss.loop = true;
  const hissFilter = ctx.createBiquadFilter();
  hissFilter.type = "lowpass";
  hissFilter.frequency.value = 1100;
  const hissGain = ctx.createGain();
  hissGain.gain.value = 0.08;
  hiss.connect(hissFilter).connect(hissGain).connect(master);
  hiss.start();

  let crackleTimer: ReturnType<typeof setTimeout>;
  const crackle = () => {
    crackleTimer = setTimeout(
      () => {
        staticBurst({
          duration: between(0.02, 0.07),
          gain: between(0.05, 0.12),
          bands: [between(400, 6000)],
          density: 0.7
        });
        crackle();
      },
      between(400, 3000)
    );
  };
  crackle();

  ambientNodes = {
    stop: () => {
      clearTimeout(crackleTimer);
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      oscillators.forEach((osc) => osc.stop(now + 0.7));
      hiss.stop(now + 0.7);
      setTimeout(() => master.disconnect(), 800);
    }
  };
}

function stopAmbient() {
  ambientNodes?.stop();
  ambientNodes = null;
}

function syncAmbient() {
  if (ambientAllowed && preferences.ambient && preferences.soundEnabled)
    startAmbient();
  else stopAmbient();
}

watch(() => [preferences.ambient, preferences.soundEnabled], syncAmbient);

export function enableAmbient() {
  ambientAllowed = true;
  syncAmbient();
}
