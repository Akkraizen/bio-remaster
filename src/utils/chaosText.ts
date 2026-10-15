export const GLYPHS = "!<>-_\\/[]{}=+*^?#$%&01ABCDEFXZ";
export const CHAOS_GLYPHS = GLYPHS + "░▒▓█▀▄▌▐@§¥Ø0123456789";
export const KEEP = /[\s./~|:#-]/;

const WHITESPACE = /\s/;

export const pickGlyph = (glyphs: string) =>
  glyphs[Math.floor(Math.random() * glyphs.length)];

const between = (min: number, max: number) => min + Math.random() * (max - min);

export interface ScrambleFrame {
  value: string;
  changed: boolean;
  done: boolean;
}

export function createChaoticScramble(text: string, ms: number) {
  const chars = Array.from(text);

  // Lock moments in random order, bunched towards the end so the noise lingers
  const lockAt = chars.map(
    () => ms * (0.25 + 0.75 * Math.pow(Math.random(), 0.6))
  );
  const nextSwap = chars.map(() => 0);
  const relapseUntil = chars.map(() => 0);
  // Whitespace stays put, otherwise words would visually merge
  const shown = chars.map((char) =>
    WHITESPACE.test(char) ? char : pickGlyph(CHAOS_GLYPHS)
  );

  const startedAt = performance.now();
  let first = true;

  return (now: number): ScrambleFrame => {
    const elapsed = now - startedAt;

    if (elapsed >= ms) return { value: text, changed: true, done: true };

    let changed = first;
    first = false;

    chars.forEach((char, i) => {
      if (WHITESPACE.test(char)) return;

      const locked = elapsed >= lockAt[i];

      // A locked character occasionally breaks down again for a moment
      if (
        locked &&
        elapsed < ms * 0.85 &&
        now >= relapseUntil[i] &&
        Math.random() < 0.012
      ) {
        relapseUntil[i] = now + between(40, 140);
      }

      if (locked && now >= relapseUntil[i]) {
        if (shown[i] !== char) {
          shown[i] = char;
          changed = true;
        }
        return;
      }

      if (now >= nextSwap[i]) {
        // Separators glitch less often than letters
        const keepChance = KEEP.test(char) ? 0.6 : 0.08;
        shown[i] = Math.random() < keepChance ? char : pickGlyph(CHAOS_GLYPHS);
        nextSwap[i] = now + between(18, 110);
        changed = true;
      }
    });

    return { value: changed ? shown.join("") : "", changed, done: false };
  };
}
