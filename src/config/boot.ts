export const themes = [
  "acid",
  "neon",
  "matrix",
  "ice",
  "amber",
  "blood",
  "vapor",
  "sakura",
  "cobalt",
  "ghost"
] as const;

export type Theme = (typeof themes)[number];

export const storageKeys = {
  themePreference: "theme",
  lastTheme: "theme-last",
  preferences: "preferences"
} as const;

export const logoPath = { prefix: "/logos/logo-", suffix: ".svg" } as const;

export const themeLogoUrl = (theme: Theme) =>
  `${logoPath.prefix}${theme}${logoPath.suffix}`;

export const secretThemes = ["overclock", "midnight", "root"] as const;

export type SecretTheme = (typeof secretThemes)[number];

export const themeModes = ["random", "chameleon"] as const;

export const bootConfig = { themes, secretThemes, storageKeys, logoPath };
