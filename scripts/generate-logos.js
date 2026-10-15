/**
 * Generates a logo variant per color theme.
 *
 * Template: public/logo.svg, drawn in white. Every white fill/stroke is replaced
 * with the theme's accent from src/common/style/_themes.scss.
 * Output:   public/logos/logo-<theme>.svg (git-ignored, regenerated before dev/build).
 *
 * Usage: npm run logos
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = {
  template: resolve(root, "public/logo.svg"),
  themes: resolve(root, "src/common/style/_themes.scss"),
  themeList: resolve(root, "src/config/boot.ts"),
  output: resolve(root, "public/logos")
};

const fail = (message) => {
  console.error(`[logos] ${message}`);
  process.exit(1);
};

/** Theme name -> accent color, parsed from the $themes map */
function readThemeAccents() {
  const scss = readFileSync(paths.themes, "utf8");
  const accents = new Map();
  // Matches each "  name: (" block of the $themes map and its "accent:" entry
  const blockPattern = /^ {2}([\w-]+): \(\s*$([\s\S]*?)^ {2}\)/gm;

  for (const [, name, body] of scss.matchAll(blockPattern)) {
    const accent = body.match(/^\s*accent:\s*(#[0-9a-fA-F]{3,8})\s*,?\s*$/m);
    if (!accent) fail(`theme "${name}" has no hex "accent" in _themes.scss`);
    accents.set(name, accent[1]);
  }

  if (accents.size === 0) fail("no themes found in _themes.scss");
  return accents;
}

/** Theme names in src/config/boot.ts, used by the app and the inline boot script */
function readAppThemes() {
  const source = readFileSync(paths.themeList, "utf8");
  const list = source.match(/export const themes = \[([\s\S]*?)\]/);
  if (!list) fail("could not find `export const themes = [...]` in src/config/boot.ts");
  return [...list[1].matchAll(/"([\w-]+)"/g)].map(([, name]) => name);
}

// White in any common spelling, inside fill/stroke attributes or inline styles
const WHITE = /((?:fill|stroke|stop-color)\s*[=:]\s*["']?)(#fff(?:fff)?(?:ff)?|white)\b/gi;

function main() {
  const template = readFileSync(paths.template, "utf8");
  if (!WHITE.test(template))
    fail("public/logo.svg has no white fill/stroke to recolor; draw the template in #ffffff");
  WHITE.lastIndex = 0;

  const accents = readThemeAccents();
  const appThemes = readAppThemes();

  // Catch a theme added in only one of the two places
  const missingInScss = appThemes.filter((name) => !accents.has(name));
  const missingInApp = [...accents.keys()].filter((name) => !appThemes.includes(name));
  if (missingInScss.length || missingInApp.length) {
    fail(
      "theme lists are out of sync:" +
        (missingInScss.length ? `\n  in src/config/boot.ts only: ${missingInScss.join(", ")}` : "") +
        (missingInApp.length ? `\n  in _themes.scss only: ${missingInApp.join(", ")}` : "")
    );
  }

  // Start clean so logos of removed themes don't linger
  rmSync(paths.output, { recursive: true, force: true });
  mkdirSync(paths.output, { recursive: true });

  for (const [name, accent] of accents) {
    const svg = template.replace(WHITE, (_, prefix) => `${prefix}${accent}`);
    writeFileSync(resolve(paths.output, `logo-${name}.svg`), svg);
  }

  const files = readdirSync(paths.output);
  console.log(`[logos] ${files.length} variants -> public/logos (${[...accents.keys()].join(", ")})`);
}

main();
