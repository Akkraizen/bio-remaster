import sjImg from "@assets/projects/SJ.png";
import hisokaMorrowImg from "@assets/projects/HisokaMorrowBot.jpg";
import linariBotImg from "@assets/projects/LinariBot.jpg";
import akhsImg from "@assets/projects/AKHS.jpg";
import reverseImg from "@assets/projects/Reverse.jpg";
import type { Locale } from "@/i18n";

export interface Project {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  source?: string;
  demo?: string;
  image?: string;
  stack: string[];
}

export interface LocalizedProjectItem {
  id: string;
  name: string;
  en: {
    description: string;
    fullDescription: string;
  };
  ru: {
    description: string;
    fullDescription: string;
  };
  source?: string;
  demo?: string;
  image?: string;
  stack: string[];
}

export const rawProjects: LocalizedProjectItem[] = [
  {
    id: "001",
    name: "SJ",
    en: {
      description: "Service that uses Tinder-like mechanism for job hunting.",
      fullDescription:
        "SJ is a modern platform designed to revolutionize the job hunting process. It uses a swipe-based mechanism where employers and candidates can express mutual interest. The platform focuses on quick interactions and reducing the friction in initial recruitment steps."
    },
    ru: {
      description: "Сервис для поиска работы с механикой в стиле Tinder.",
      fullDescription:
        "SJ — это современная платформа, призванная кардинально изменить процесс поиска работы. Она использует свайп-механику, позволяя работодателям и кандидатам мгновенно проявлять взаимный интерес, сокращая время до первого контакта."
    },
    demo: "https://swapjob.ru",
    image: sjImg,
    stack: ["docker", "ts", "git", "python"]
  },
  {
    id: "002",
    name: "Hisoka Morrow Bot",
    en: {
      description:
        "Multifunctional Discord bot stylized as Hisoka Morrow from Hunter x Hunter. Bot was written on Kotlin.",
      fullDescription:
        "A sophisticated Discord bot themed after the enigmatic character Hisoka Morrow. Developed using Kotlin and the Kord library, it features interactive games, moderation tools, and role-play commands, all delivered with Hisoka's signature personality."
    },
    ru: {
      description:
        "Многофункциональный Discord-бот, стилизованный под Хисоку Мороу из Hunter x Hunter. Написан на Kotlin.",
      fullDescription:
        "Продвинутый Discord-бот в стилистике персонажа Хисока Мороу. Разработан на Kotlin с использованием библиотеки Kord. Включает интерактивные мини-игры, инструменты модерации и ролевые команды с фирменным стилем персонажа."
    },
    source: "https://github.com/Akkraizen/Hisoka",
    demo: "https://discord.com/oauth2/authorize?client_id=1271073974356279396&permissions=8&integration_type=0&scope=bot",
    image: hisokaMorrowImg,
    stack: ["kotlin", "gradle", "docker", "git"]
  },
  {
    id: "003",
    name: "LinariBot",
    en: {
      description: "Telegram bot for Linari community.",
      fullDescription:
        "Custom-built Telegram bot specifically designed for the Linari community. It manages group interactions, provides utility and moderation commands."
    },
    ru: {
      description: "Telegram-бот для сообщества Linari.",
      fullDescription:
        "Специализированный Telegram-бот, созданный для сообщества Linari. Управляет групповыми взаимодействиями, предоставляет утилиты и команды модерации."
    },
    source: "https://github.com/Akkraizen/linari-bot",
    demo: "https://t.me/linarime_chat",
    image: linariBotImg,
    stack: ["python", "git"]
  },
  {
    id: "004",
    name: "AKHS",
    en: {
      description:
        "Collection of services for automation tasks, written on Kotlin with Spring Framework.",
      fullDescription:
        "AKHS — is a collection of services for automation tasks, written on Kotlin with Spring Framework\n All services linked with each other with the help of Apache Kafka. This project can be fine tuned using environment variables."
    },
    ru: {
      description:
        "Комплекс микросервисов для автоматизации, написанный на Kotlin и Spring Framework.",
      fullDescription:
        "AKHS — это комплекс сервисов для задач автоматизации, разработанный на Kotlin и Spring Framework.\n Все сервисы взаимодействуют друг с другом через Apache Kafka. Проект гибко настраивается через переменные окружения."
    },
    source: "https://github.com/Akkraizen/AKHS",
    image: akhsImg,
    stack: ["kotlin", "spring", "gradle", "docker", "git"]
  },
  {
    id: "005",
    name: "Reverse Rewrite",
    en: {
      description:
        "Rewrote version of my first project and my first Discord bot.",
      fullDescription:
        "A complete overhaul and modernisation of my very first project. This Discord bot has been completely rewritten to improve performance, fix bugs and introduce new features that were not available in the original version."
    },
    ru: {
      description:
        "Переписанная версия моего самого первого проекта и Discord-бота.",
      fullDescription:
        "Полная переработка и модернизация первого проекта. Discord-бот был полностью переписан с нуля для повышения производительности, устранения ошибок и внедрения новых функций."
    },
    source: "https://github.com/Akkraizen/ReverseRewrite",
    demo: "https://discord.com/oauth2/authorize?client_id=979745072843206686&permissions=8&integration_type=0&scope=bot",
    image: reverseImg,
    stack: ["python", "git"]
  },
  {
    id: "006",
    name: "Leetcode-rs",
    en: {
      description: "My owned Leetcode problems solves, written on Rust.",
      fullDescription:
        "A repository dedicated to solving algorithmic challenges on LeetCode using Rust. It focuses on idiomatic Rust code, performance optimizations, and deep diving into Rust's features."
    },
    ru: {
      description: "Мои решения алгоритмических задач LeetCode на языке Rust.",
      fullDescription:
        "Репозиторий с решениями алгоритмических задач на LeetCode на языке Rust. Фокусируется на идиоматичном коде Rust, оптимизации производительности и изучении возможностей языка."
    },
    source: "https://github.com/Akkraizen/leetcode-rs",
    stack: ["rust"]
  },
  {
    id: "007",
    name: "Bio",
    en: {
      description: "My own bio website, written on TypeScript and Vue.js.",
      fullDescription:
        "The current website you are visiting. It's a personal portfolio and biography site built with Vue 3, TypeScript, and Vite, featuring a futuristic 'cyber' aesthetic and smooth transitions."
    },
    ru: {
      description: "Персональный сайт-портфолио, написанный на TypeScript и Vue.js.",
      fullDescription:
        "Сайт, на котором вы сейчас находитесь. Это личное портфолио и страница биографии на Vue 3, TypeScript и Vite с футуристической киберпанк-эстетикой и плавными переходами."
    },
    source: "https://github.com/Akkraizen/bio-remaster",
    demo: "/",
    stack: ["ts", "vue", "git"]
  },
  {
    id: "008",
    name: "Zenit VA",
    en: {
      description: "Simple Voice Assistant, written on Python",
      fullDescription:
        "A Python-based voice assistant capable of performing basic tasks like searching the web, checking weather, and system control. It utilizes speech recognition and text-to-speech libraries for natural interaction."
    },
    ru: {
      description: "Простой голосовой ассистент на Python.",
      fullDescription:
        "Голосовой ассистент на Python, способный выполнять базовые задачи: поиск в интернете, проверка погоды и управление системой. Использует библиотеки распознавания и синтеза речи."
    },
    source: "https://github.com/Akkraizen/zenit-va",
    stack: ["python", "git"]
  }
];

export function getProjectsForLocale(locale: Locale): Project[] {
  return rawProjects.map((item) => ({
    id: item.id,
    name: item.name,
    description: item[locale]?.description || item.en.description,
    fullDescription: item[locale]?.fullDescription || item.en.fullDescription,
    source: item.source,
    demo: item.demo,
    image: item.image,
    stack: item.stack
  }));
}

export const projects: Project[] = getProjectsForLocale("en");
