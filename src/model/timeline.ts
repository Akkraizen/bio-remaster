import type { Locale } from "@/i18n";

export interface TimelineEntry {
  year: string;
  projects: string[];
  title: string;
  text: string;
  tags: string[];
}

interface LocalizedTimelineEntry {
  year: string;
  projects: string[];
  tags: string[];
  en: { title: string; text: string };
  ru: { title: string; text: string };
}

const rawTimeline: LocalizedTimelineEntry[] = [
  {
    year: "2022",
    projects: [],
    tags: ["python"],
    en: {
      title: "SESSION_START",
      text: "Joined GitHub and wrote my first project: Reverse, a Discord bot in Python."
    },
    ru: {
      title: "SESSION_START",
      text: "Зарегистрировался на GitHub и написал первый проект — Discord-бота Reverse на Python."
    }
  },
  {
    year: "2023",
    projects: ["009"],
    tags: ["ts", "kotlin"],
    en: {
      title: "FIRST_FILE",
      text: "Built the first version of this bio site on TypeScript and moved to Kotlin with Card-Bot."
    },
    ru: {
      title: "FIRST_FILE",
      text: "Сделал первую версию этого сайта на TypeScript и перешёл на Kotlin с Card-Bot."
    }
  },
  {
    year: "2024",
    projects: ["004", "005", "007"],
    tags: ["kotlin", "spring", "docker"],
    en: {
      title: "BACKEND_MODE",
      text: "AKHS automation services (now Projekt-Mastodont) on Spring and Kafka, my own Discord libraries mircord.kt and fcord.kt (no longer relevant :)), the Hisoka bot and a full rewrite of Reverse."
    },
    ru: {
      title: "BACKEND_MODE",
      text: "Сервисы автоматизации AKHS (ныне Projekt-Mastodont) на Spring и Kafka, собственные Discord-библиотеки mircord.kt и fcord.kt (уже неактуально :)), бот Hisoka и полная переработка Reverse."
    }
  },
  {
    year: "2025",
    projects: ["002", "009"],
    tags: ["kotlin", "vue"],
    en: {
      title: "WAVEDOT_PROTOCOL",
      text: "Started building the Wavedot player. Rebuilt this site from scratch on Vue."
    },
    ru: {
      title: "WAVEDOT_PROTOCOL",
      text: "Начал разработку плеера Wavedot. Пересобрал этот сайт с нуля на Vue."
    }
  },
  {
    year: "2026",
    projects: ["011", "008", "006", "001", "002"],
    tags: ["kotlin", "rust", "python"],
    en: {
      title: "MULTIPLATFORM",
      text: "LeetCode in Rust, LinariBot and VIO, then Berill and the Wavedot player on Kotlin Multiplatform."
    },
    ru: {
      title: "MULTIPLATFORM",
      text: "LeetCode на Rust, LinariBot и VIO, а затем Berill и плеер Wavedot на Kotlin Multiplatform."
    }
  }
];

export function getTimelineForLocale(locale: Locale): TimelineEntry[] {
  return rawTimeline.map((entry) => ({
    year: entry.year,
    projects: entry.projects,
    tags: entry.tags,
    ...(entry[locale] ?? entry.en)
  }));
}

export function getProjectYears(): Map<string, string[]> {
  const years = new Map<string, string[]>();
  for (const entry of rawTimeline)
    for (const id of entry.projects) years.set(id, [...(years.get(id) ?? []), entry.year]);
  return years;
}

export const timelineYears = rawTimeline.map((entry) => entry.year);
