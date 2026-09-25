import kotlinSvg from "@assets/technologies/kotlin.svg?url";
import goSvg from "@assets/technologies/go.svg?url";
import rustSvg from "@assets/technologies/rust.svg?url";
import gradleSvg from "@assets/technologies/gradle.svg?url";
import springSvg from "@assets/technologies/spring.svg?url";
import javaSvg from "@assets/technologies/java.svg?url";
import groovySvg from "@assets/technologies/groovy.svg?url";
import scalaSvg from "@assets/technologies/scala.svg?url";
import csharpSvg from "@assets/technologies/c-sharp.svg?url";
import jsSvg from "@assets/technologies/js.svg?url";
import tsSvg from "@assets/technologies/ts.svg?url";
import vueSvg from "@assets/technologies/vue.svg?url";
import nuxtSvg from "@assets/technologies/nuxt.svg?url";
import dockerSvg from "@assets/technologies/docker.svg?url";
import gitSvg from "@assets/technologies/git.svg?url";
import dotnetSvg from "@assets/technologies/dotnet.svg?url";
import pythonSvg from "@assets/technologies/python.svg?url";
import type { Locale } from "@/i18n";
import en from "@/i18n/locales/en";
import ru from "@/i18n/locales/ru";

export interface Technology {
  id: number;
  name: string;
  link: string;
  icon: string;
  description: string;
}

export interface TechnologyMeta {
  id: number;
  name: string;
  link: string;
  icon: string;
  descriptionKey: keyof typeof en.technologies;
}

export const rawTechnologies: Record<string, TechnologyMeta> = {
  kotlin: {
    id: 1,
    name: "Kotlin",
    link: "https://kotlinlang.org/",
    icon: kotlinSvg,
    descriptionKey: "kotlin"
  },
  go: {
    id: 2,
    name: "Go",
    link: "https://go.dev/",
    icon: goSvg,
    descriptionKey: "go"
  },
  rust: {
    id: 3,
    name: "Rust",
    link: "https://www.rust-lang.org/",
    icon: rustSvg,
    descriptionKey: "rust"
  },
  gradle: {
    id: 4,
    name: "Gradle",
    link: "https://gradle.org/",
    icon: gradleSvg,
    descriptionKey: "gradle"
  },
  spring: {
    id: 5,
    name: "Spring",
    link: "https://spring.io/",
    icon: springSvg,
    descriptionKey: "spring"
  },
  java: {
    id: 6,
    name: "Java",
    link: "https://www.java.com/",
    icon: javaSvg,
    descriptionKey: "java"
  },
  groovy: {
    id: 7,
    name: "Groovy",
    link: "https://www.groovy-lang.org/",
    icon: groovySvg,
    descriptionKey: "groovy"
  },
  scala: {
    id: 8,
    name: "Scala",
    link: "https://www.scala-lang.org/",
    icon: scalaSvg,
    descriptionKey: "scala"
  },
  csharp: {
    id: 9,
    name: "C#",
    link: "https://dotnet.microsoft.com/en-us/languages/csharp",
    icon: csharpSvg,
    descriptionKey: "csharp"
  },
  js: {
    id: 10,
    name: "JS",
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    icon: jsSvg,
    descriptionKey: "js"
  },
  ts: {
    id: 11,
    name: "TS",
    link: "https://www.typescriptlang.org",
    icon: tsSvg,
    descriptionKey: "ts"
  },
  vue: {
    id: 12,
    name: "Vue",
    link: "https://vuejs.org/",
    icon: vueSvg,
    descriptionKey: "vue"
  },
  nuxt: {
    id: 13,
    name: "Nuxt",
    link: "https://nuxt.com/",
    icon: nuxtSvg,
    descriptionKey: "nuxt"
  },
  docker: {
    id: 14,
    name: "Docker",
    link: "https://www.docker.com/",
    icon: dockerSvg,
    descriptionKey: "docker"
  },
  git: {
    id: 15,
    name: "Git",
    link: "https://git-scm.com/",
    icon: gitSvg,
    descriptionKey: "git"
  },
  dotnet: {
    id: 16,
    name: ".NET",
    link: "https://dotnet.microsoft.com/",
    icon: dotnetSvg,
    descriptionKey: "dotnet"
  },
  python: {
    id: 17,
    name: "Python",
    link: "https://www.python.org/",
    icon: pythonSvg,
    descriptionKey: "python"
  }
};

const localeDescriptions: Record<Locale, Record<string, string>> = {
  en: en.technologies,
  ru: ru.technologies
};

export function getTechnologiesForLocale(
  locale: Locale
): Record<string, Technology> {
  const descriptions = localeDescriptions[locale] || localeDescriptions.en;
  const result: Record<string, Technology> = {};

  for (const [key, item] of Object.entries(rawTechnologies)) {
    result[key] = {
      id: item.id,
      name: item.name,
      link: item.link,
      icon: item.icon,
      description: descriptions[item.descriptionKey] || en.technologies[item.descriptionKey]
    };
  }

  return result;
}

const technologies: Record<string, Technology> = getTechnologiesForLocale("en");

export default technologies;
