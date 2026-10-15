export const themes = [
  "acid",
  "neon",
  "matrix",
  "ice",
  "amber",
  "blood"
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

export const bootConfig = { themes, storageKeys, logoPath };
