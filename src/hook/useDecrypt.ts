import {
  onBeforeUnmount,
  onMounted,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter
} from "vue";
import { reducedMotion } from "@/hook/usePreferences.ts";
import {
  GLYPHS,
  KEEP,
  createChaoticScramble,
  pickGlyph
} from "@/utils/chaosText.ts";

const MIN_CHANGE_DURATION = 900;

export interface DecryptOptions {
  /** Duration of the initial reveal, ms */
  duration?: number;
  /** Duration of the reveal replayed on hover, ms */
  hoverDuration?: number;
  /**
   * Chaotic reveal: random lock order, each character flickers at its own rate,
   * locked characters may relapse into noise, and even separators glitch
   */
  chaotic?: boolean;
}

/**
 * "Decrypts" text: characters cycle through random glyphs and lock in left to right.
 * Replays chaotically when the text changes (e.g. locale switch); `replay()` can be bound to hover.
 */
export function useDecrypt(
  source: MaybeRefOrGetter<string>,
  options: DecryptOptions = {}
) {
  const { duration = 700, hoverDuration = 450, chaotic = false } = options;

  const display = ref(toValue(source));
  let frame = 0;
  let running = false;

  const stop = () => {
    cancelAnimationFrame(frame);
    running = false;
  };

  const run = (ms: number, useChaos = chaotic) => {
    const text = toValue(source);
    stop();

    if (reducedMotion() || !text) {
      display.value = text;
      return;
    }

    if (useChaos) {
      runChaotic(text, ms);
      return;
    }

    // Each character locks in at its own moment, roughly left to right
    const lockAt = Array.from(
      text,
      (_, i) => (i / text.length) * ms * 0.75 + Math.random() * ms * 0.25
    );
    const startedAt = performance.now();
    let lastSwap = 0;
    running = true;

    const step = (now: number) => {
      const elapsed = now - startedAt;

      // Swap glyphs ~every 40ms rather than every frame, so it reads as flicker, not noise
      if (now - lastSwap >= 40) {
        lastSwap = now;
        display.value = Array.from(text, (char, i) =>
          elapsed >= lockAt[i] || KEEP.test(char) ? char : pickGlyph(GLYPHS)
        ).join("");
      }

      if (elapsed < ms) {
        frame = requestAnimationFrame(step);
      } else {
        display.value = text;
        running = false;
      }
    };

    frame = requestAnimationFrame(step);
  };

  const runChaotic = (text: string, ms: number) => {
    const next = createChaoticScramble(text, ms);
    running = true;

    const step = (now: number) => {
      const { value, changed, done } = next(now);
      if (changed) display.value = value;

      if (done) running = false;
      else frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
  };

  const replay = () => {
    if (!running) run(hoverDuration);
  };

  watch(
    () => toValue(source),
    () => run(Math.max(duration, MIN_CHANGE_DURATION), true)
  );

  onMounted(() => run(duration));
  onBeforeUnmount(stop);

  return { display, replay };
}
