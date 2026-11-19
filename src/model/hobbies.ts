import type { Locale } from "@/i18n";

export interface Hobby {
  id: string;
  glyph: string;
  title: string;
  text: string;
  link?: string;
}

interface LocalizedHobby {
  id: string;
  glyph: string;
  link?: string;
  en: { title: string; text: string };
  ru: { title: string; text: string };
}

const rawHobbies: LocalizedHobby[] = [
  {
    id: "chess",
    glyph: "♞",
    link: "https://lichess.org/@/Akkraizen",
    en: { title: "Chess", text: "Blitz on Lichess and Chess.com. Live ratings are on the left." },
    ru: { title: "Шахматы", text: "Блиц на Lichess и Chess.com. Живые рейтинги — слева." }
  },
  {
    id: "cats",
    glyph: "=^.^=",
    en: { title: "Cats", text: "The best creatures in the net. No further comments." },
    ru: { title: "Котики", text: "Лучшие существа в сети. Без комментариев." }
  },
  {
    id: "deutsch",
    glyph: "DE",
    en: { title: "Deutsch", text: "Ich lerne Deutsch. Langsam, aber sicher." },
    ru: { title: "Немецкий", text: "Ich lerne Deutsch. Медленно, но верно." }
  },
  {
    id: "algorithms",
    glyph: "λ",
    link: "https://github.com/Akkraizen/leetcode-rs",
    en: { title: "Algorithms", text: "Codeforces rounds and LeetCode problems solved in Rust." },
    ru: { title: "Алгоритмы", text: "Раунды Codeforces и задачи LeetCode на Rust." }
  },
  {
    id: "nixos",
    glyph: "❄",
    link: "https://github.com/Akkraizen/nixos-config",
    en: { title: "NixOS", text: "My machines are described declaratively in a single config." },
    ru: { title: "NixOS", text: "Мои машины описаны декларативно в одном конфиге." }
  }
];

export function getHobbiesForLocale(locale: Locale): Hobby[] {
  return rawHobbies.map((hobby) => ({
    id: hobby.id,
    glyph: hobby.glyph,
    link: hobby.link,
    ...(hobby[locale] ?? hobby.en)
  }));
}
