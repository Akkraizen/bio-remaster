import type { CyberShape } from "@/hook/useCyberShape";
import type { ResponsiveShapeOption } from "@/hook/useResponsive";
import type { Locale } from "@/i18n";

export interface QuoteItem {
  id: number | string;
  quote: string;
  author?: string;
  source?: string;
  shape?: CyberShape;
  responsiveShape?: ResponsiveShapeOption;
  isWarning?: boolean;
}

export interface LocalizedQuoteItem {
  id: number | string;
  en: {
    quote: string;
    author?: string;
    source?: string;
  };
  ru: {
    quote: string;
    author?: string;
    source?: string;
  };
  shape?: CyberShape;
  responsiveShape?: ResponsiveShapeOption;
  isWarning?: boolean;
}

export const localizedQuotes: LocalizedQuoteItem[] = [
  {
    id: 1,
    en: {
      quote: "The moment you hesitate, it's all over",
      author: "Levi Ackerman",
      source: "Attack On Titan"
    },
    ru: {
      quote: "В тот момент, когда ты колеблешься, всё кончено",
      author: "Леви Аккерман",
      source: "Атака Титанов"
    },
    responsiveShape: {
      mobile: "top-corners",
      large: "top-corners",
      default: "diagonal-tl-br"
    }
  },
  {
    id: 2,
    en: {
      quote: "For so long, I sought the height of perfection.",
      author: "Isaac Netero",
      source: "Hunter x Hunter"
    },
    ru: {
      quote: "Так долго я стремился к вершине совершенства.",
      author: "Исаак Нетеро",
      source: "Hunter x Hunter"
    },
    responsiveShape: {
      mobile: "rectangle",
      large: "rectangle",
      default: "diagonal-tl-br"
    }
  },
  {
    id: 3,
    en: {
      quote: "I’m not a great programmer; I’m just a good programmer with great habits.",
      author: "Kent Beck",
      source: "Refactoring: Ruby Edition"
    },
    ru: {
      quote: "Я не великий программист; я просто хороший программист с великолепными привычками.",
      author: "Кент Бек",
      source: "Рефакторинг"
    },
    responsiveShape: {
      mobile: "bottom-corners",
      large: "bottom-corners",
      default: "diagonal-tl-br"
    }
  }
];

export function getQuotesForLocale(locale: Locale): QuoteItem[] {
  return localizedQuotes.map((item) => ({
    id: item.id,
    quote: item[locale]?.quote || item.en.quote,
    author: item[locale]?.author || item.en.author,
    source: item[locale]?.source || item.en.source,
    shape: item.shape,
    responsiveShape: item.responsiveShape,
    isWarning: item.isWarning
  }));
}

export const defaultQuotes: QuoteItem[] = getQuotesForLocale("en");
