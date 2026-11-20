import router from "@/router";
import { currentLocale, leetMode, setLocale, t, toggleLocale, type Locale } from "@/i18n";
import { getProjectsForLocale } from "@/model/project.ts";
import { staticPages } from "@/config/seo.ts";
import socials from "@assets/socials";
import { secretThemes, setThemePreference, themes, type ThemePreference } from "@/hook/useTheme.ts";
import { hasAchievement, isSecretThemeUnlocked } from "@/utils/achievements.ts";
import { preferences } from "@/hook/usePreferences.ts";
import { openTerminal } from "@/hook/useOverlays.ts";
import { openExternal } from "@/utils/uiSounds.ts";
import { playConfirm } from "@/utils/synthSounds.ts";
import { triggerGlitch } from "@/utils/glitchFx.ts";

export type CommandGroup = "navigation" | "projects" | "theme" | "system" | "links";

export interface Command {
  id: string;
  group: CommandGroup;
  label: string;
  hint?: string;
  keywords: string;
  run: () => void;
}

export const pages = {
  entrypoint: staticPages["Core.Entrypoint"].path,
  file: staticPages["Core.File"].path,
  projects: staticPages["Core.Projects"].path,
  activity: staticPages["Core.Activity"].path,
  cv: staticPages["Core.CV"].path,
  uplink: staticPages["Core.Uplink"].path
} as const;

export type PageName = keyof typeof pages;

export const navigate = (path: string) => router.push(path);

export function applyTheme(value: ThemePreference) {
  setThemePreference(value);
  triggerGlitch("ambient");
  playConfirm();
}

export function setSound(enabled: boolean) {
  preferences.soundEnabled = enabled;
  if (enabled) playConfirm();
}

export function switchLanguage(locale?: Locale) {
  if (leetMode.value) return setLocale(locale ?? "en");
  if (!locale || locale !== currentLocale.value) toggleLocale();
}

export function openSocial(key: string): boolean {
  const social = socials[key];
  if (!social) return false;
  openExternal(social.link, true);
  return true;
}

export function availableThemes(): ThemePreference[] {
  const list: ThemePreference[] = ["random"];
  if (hasAchievement("chameleon")) list.push("chameleon");
  return [...list, ...themes, ...secretThemes.filter(isSecretThemeUnlocked)];
}

export function getCommands(locale: Locale): Command[] {
  const navigation: Command[] = (Object.keys(pages) as PageName[]).map((name) => ({
    id: `page:${name}`,
    group: "navigation",
    label: t(`nav.${name}`),
    hint: pages[name],
    keywords: `${name} ${pages[name]} go cd page`,
    run: () => navigate(pages[name])
  }));


  const projects: Command[] = getProjectsForLocale(locale).map((project) => ({
    id: `project:${project.id}`,
    group: "projects",
    label: project.name,
    hint: project.id,
    keywords: `${project.id} ${project.description} ${project.stack.join(" ")}`,
    run: () => navigate(`${pages.projects}/${project.id}`)
  }));

  const themeCommands: Command[] = availableThemes().map((name) => ({
    id: `theme:${name}`,
    group: "theme",
    label: t(`theme.${name}`),
    hint: "theme",
    keywords: `theme color ${name}`,
    run: () => applyTheme(name)
  }));

  const system: Command[] = [
    {
      id: "system:terminal",
      group: "system",
      label: t("palette.openTerminal"),
      hint: "`",
      keywords: "terminal shell console",
      run: openTerminal
    },
    {
      id: "system:sound",
      group: "system",
      label: t("palette.toggleSound"),
      hint: preferences.soundEnabled ? t("settings.on") : t("settings.off"),
      keywords: "sound audio mute volume",
      run: () => setSound(!preferences.soundEnabled)
    },
    {
      id: "system:motion",
      group: "system",
      label: t("palette.toggleMotion"),
      hint: t(`settings.motionModes.${preferences.motion}`),
      keywords: "motion animation reduced",
      run: () => {
        preferences.motion = preferences.motion === "full" ? "reduced" : "full";
      }
    },
    {
      id: "system:language",
      group: "system",
      label: t("palette.switchLanguage"),
      hint: locale === "en" ? "RU" : "EN",
      keywords: "language locale english russian lang",
      run: () => switchLanguage()
    }
  ];

  const links: Command[] = Object.entries(socials).map(([key, social]) => ({
    id: `link:${key}`,
    group: "links",
    label: social.name,
    hint: new URL(social.link).host,
    keywords: `${key} social link`,
    run: () => openSocial(key)
  }));

  return [...navigation, ...projects, ...themeCommands, ...system, ...links];
}
