import sjImg from "@assets/projects/SJ.png";
import hisokaMorrowImg from "@assets/projects/HisokaMorrowBot.jpg";
import linariBotImg from "@assets/projects/LinariBot.jpg";
import akhsImg from "@assets/projects/AKHS.jpg";
import reverseImg from "@assets/projects/Reverse.jpg";

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

export const projects: Project[] = [
  {
    id: "001",
    name: "SJ",
    description: "Service that uses Tinder-like mechanism for job hunting.",
    fullDescription:
      "SJ is a modern platform designed to revolutionize the job hunting process. It uses a swipe-based mechanism where employers and candidates can express mutual interest. The platform focuses on quick interactions and reducing the friction in initial recruitment steps.",
    demo: "https://swapjob.ru",
    image: sjImg,
    stack: ["docker", "ts", "git", "python"]
  },
  {
    id: "002",
    name: "Hisoka Morrow Bot",
    description:
      "Multifunctional Discord bot stylized as Hisoka Morrow from Hunter x Hunter. Bot was written on Kotlin.",
    fullDescription:
      "A sophisticated Discord bot themed after the enigmatic character Hisoka Morrow. Developed using Kotlin and the Kord library, it features interactive games, moderation tools, and role-play commands, all delivered with Hisoka's signature personality.",
    source: "https://github.com/Akkraizen/Hisoka",
    demo: "https://discord.com/oauth2/authorize?client_id=1271073974356279396&permissions=8&integration_type=0&scope=bot",
    image: hisokaMorrowImg,
    stack: ["kotlin", "gradle", "docker", "git"]
  },
  {
    id: "003",
    name: "LinariBot",
    description: "Telegram bot for Linari community.",
    fullDescription:
      "Custom-built Telegram bot specifically designed for the Linari community. It manages group interactions, provides utility and moderation commands.",
    source: "https://github.com/Akkraizen/linari-bot",
    demo: "https://t.me/linarime_chat",
    image: linariBotImg,
    stack: ["python", "git"]
  },
  {
    id: "004",
    name: "AKHS",
    description:
      "Collection of services for automation tasks, written on Kotlin with Spring Framework.",
    fullDescription:
      "AKHS — is a collection of services for automation tasks, written on Kotlin with Spring Framework\n All services linked with each other with the help of Apache Kafka. This project can be fine tuned using environment variables.",
    source: "https://github.com/Akkraizen/AKHS",
    image: akhsImg,
    stack: ["kotlin", "spring", "gradle", "docker", "git"]
  },
  {
    id: "005",
    name: "Reverse Rewrite",
    description:
      "Rewrote version of my first project and my first Discord bot.",
    fullDescription:
      "A complete overhaul and modernisation of my very first project. This Discord bot has been completely rewritten to improve performance, fix bugs and introduce new features that were not available in the original version.",
    source: "https://github.com/Akkraizen/ReverseRewrite",
    demo: "https://discord.com/oauth2/authorize?client_id=979745072843206686&permissions=8&integration_type=0&scope=bot",
    image: reverseImg,
    stack: ["python", "git"]
  },
  {
    id: "006",
    name: "Leetcode-rs",
    description: "My owned Leetcode problems solves, written on Rust.",
    fullDescription:
      "A repository dedicated to solving algorithmic challenges on LeetCode using Rust. It focuses on idiomatic Rust code, performance optimizations, and deep diving into Rust's features.",
    source: "https://github.com/Akkraizen/leetcode-rs",
    stack: ["rust"]
  },
  {
    id: "007",
    name: "Bio",
    description: "My own bio website, written on TypeScript and Vue.js.",
    fullDescription:
      "The current website you are visiting. It's a personal portfolio and biography site built with Vue 3, TypeScript, and Vite, featuring a futuristic 'cyber' aesthetic and smooth transitions.",
    source: "https://github.com/Akkraizen/bio-remaster",
    demo: "/",
    stack: ["ts", "vue", "git"]
  },
  {
    id: "008",
    name: "Zenit VA",
    description: "Simple Voice Assistant, written on Python",
    fullDescription:
      "A Python-based voice assistant capable of performing basic tasks like searching the web, checking weather, and system control. It utilizes speech recognition and text-to-speech libraries for natural interaction.",
    source: "https://github.com/Akkraizen/zenit-va",
    stack: ["python", "git"]
  }
];
