import githubSvg from "./github.svg?url";
import discordSvg from "./discord.svg?url";
import xSvg from "./x.svg?url";
import twitchSvg from "./twitch.svg?url";
import telegramSvg from "./telegram.svg?url";
import youtubeSvg from "./youtube.svg?url";
import lichessSvg from "./lichess.svg?url";
import chessdotcomSvg from "./chessdotcom.svg?url";
import codeforcesSvg from "./codeforces.svg?url";
import steamSvg from "./steam.svg?url";

export interface Social {
  id: number;
  name: string;
  link: string;
  icon: string;
}

const socials: Record<string, Social> = {
  github: {
    id: 1,
    name: "GitHub",
    link: "https://github.com/Akkraizen",
    icon: githubSvg
  },
  discord: {
    id: 2,
    name: "Discord",
    link: "https://discord.com/users/743878110747033691",
    icon: discordSvg
  },
  x: {
    id: 3,
    name: "X",
    link: "https://x.com/TheKiNgchev",
    icon: xSvg
  },
  twitch: {
    id: 4,
    name: "Twitch",
    link: "https://www.twitch.tv/k1ngchev",
    icon: twitchSvg
  },
  telegram: {
    id: 5,
    name: "Telegram",
    link: "https://t.me/akkraizenhere",
    icon: telegramSvg
  },
  youtube: {
    id: 6,
    name: "Youtube",
    link: "https://www.youtube.com/@_k1ngchev",
    icon: youtubeSvg
  },
  lichess: {
    id: 7,
    name: "Lichess",
    link: "https://lichess.org/@/TheKiNgchev",
    icon: lichessSvg
  },
  chessdotcom: {
    id: 8,
    name: "Chess.com",
    link: "https://www.chess.com/member/TheKiNgchev",
    icon: chessdotcomSvg
  },
  codeforces: {
    id: 9,
    name: "Codeforces",
    link: "https://codeforces.com/profile/kiNgchev",
    icon: codeforcesSvg
  },
  steam: {
    id: 10,
    name: "Steam",
    link: "https://steamcommunity.com/id/akkraizen/",
    icon: steamSvg
  }
};

export default socials;
