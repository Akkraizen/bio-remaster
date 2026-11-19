export default {
  nav: {
    entrypoint: "Core.Entrypoint",
    file: "Core.File",
    projects: "Core.Projects",
    activity: "Core.Activity",
    cv: "Core.CV",
    uplink: "Core.Uplink",
    menu: "[ MENU ]",
    close: "[ CLOSE ]",
    systemNavLinking: "SYSTEM_NAV_LINKING...",
    authGranted: "AUTH_REQ: GRANTED",
    skip: "Skip to content"
  },
  settings: {
    title: "CONFIG",
    open: "Open settings",
    menuSubtitle: "SYSTEM_CONFIG_LINKING...",
    language: "Language",
    theme: "Theme",
    sound: "Sound",
    volume: "Volume",
    ambient: "Ambient",
    themeSounds: "Theme sounds",
    motion: "Motion",
    cursor: "Cursor",
    screensaver: "Screensaver",
    secrets: "Secrets",
    secretsFound: "Found {found} / {total}",
    secretLocked: "???",
    secretBadge: "SECRET",
    cursorStyle: "Cursor style",
    cursorStyles: {
      crosshair: "CROSSHAIR",
      cat: "CAT"
    },
    screensaverMode: "Screensaver mode",
    screensaverModes: {
      rain: "RAIN",
      stars: "STARS",
      scope: "WAVE"
    },
    vimKeys: "Vim keys",
    rank: "Clearance",
    nextRank: "Next: {rank} at {count}",
    shareCard: "Share",
    downloadCard: "Download",
    shareTitle: "My secrets on akkraizen.dev",
    finale: "Replay finale",
    on: "ON",
    off: "OFF",
    motionModes: {
      full: "FULL",
      reduced: "REDUCED"
    },
    languages: {
      en: "English",
      ru: "Русский",
      l33t: "1337 5P34K"
    }
  },
  theme: {
    random: "RANDOM",
    acid: "ACID",
    neon: "NEON",
    matrix: "MATRIX",
    ice: "ICE",
    amber: "AMBER",
    blood: "BLOOD",
    vapor: "VAPOR",
    sakura: "SAKURA",
    cobalt: "COBALT",
    ghost: "GHOST",
    overclock: "OVERCLOCK",
    midnight: "MIDNIGHT",
    root: "ROOT",
    chameleon: "CHAMELEON"
  },
  init: {
    title: "SYSTEM.INIT",
    setupTitle: "FIRST_BOOT.CONFIG",
    setupHint: "Reduced motion removes flashes and glitches. Everything can be changed later in CONFIG.",
    button: "Initialize session!"
  },
  boot: {
    title: "SYSTEM.BOOT",
    steps: [
      "INITIALIZING_CORE",
      "LOADING_SYSTEM_RESOURCES",
      "ESTABLISHING_SECURE_LINK",
      "DECRYPTING_DATA_VAULT",
      "FINALIZING_BOOT_SEQUENCE"
    ]
  },
  entrypoint: {
    title: "AKKRAIZEN",
    subtitle: "A true magician never runs out of tricks."
  },
  file: {
    title: "~/Core/File.prtf",
    subtitle: "AKKRAIZEN FILE",
    biographyTitle: "File.Biography",
    biographyText:
      'Hi! I\'m a <a href="https://kotlinlang.org/" target="_blank" rel="noopener">Kotlin</a>, <a href="https://go.dev/" target="_blank" rel="noopener">Go</a> &amp; <a href="https://www.rust-lang.org/" target="_blank" rel="noopener">Rust</a> enjoyer. For more than four years I have been writing bots, server apps, scripts and SPAs. I aim to get better at <a>backend</a> and <a>frontend</a> development. A little bit of DevOps.<br> I love chess and cats! Und Ich lerne <a>Deutsch</a>!<br> You can follow my socials or send me a direct message. Good luck, reader :3',
    stackTitle: "File.Stack",
    nicknamesTitle: "File.Nicknames",
    nicknames: ["Akkraizen", "kiNgchev", "What else?.."],
    linksTitle: "File.Links",
    dataTitle: "File.Data",
    age: "Age:",
    ageValue: "19",
    location: "Location:",
    locationValue: "Moscow, Russia",
    expTitle: "File.Exp",
    clockTitle: "Local.Time",
    clockVisitor: "Your time",
    clockZone: "MSK · UTC+3",
    statusTitle: "System.Status",
    statusFocus: "Current focus",
    statusUptime: "Uptime",
    statusRepos: "Repos",
    statusStars: "Stars",
    statusUnrated: "UNRATED",
    openCv: "CV",
    langTitle: "Lang.Share",
    langRepos: "repos",
    yearsOfExperience: "Years of <br /> experience"
  },
  projects: {
    searchPlaceholder: "Search projects: name, description, stack…",
    filterStack: "Stack",
    filterHas: "Has",
    filterDemo: "Demo",
    filterSource: "Source",
    searchResults: "Shown: {shown} / {total}",
    searchReset: "Reset filters",
    searchEmpty: "NO ENTRIES MATCH THE QUERY",
    title: "~/Core/Projects/",
    subtitle: "DATABASE ENTRIES: {count} // SYSTEM VERSION {version}",
    encrypted: "ENCRYPTED",
    demo: "Demo",
    source: "Source",
    liveDemo: "Live Demo",
    sourceCode: "Source Code",
    backToList: "Back to List",
    notFoundTitle: "Error.NotFound",
    notFoundSubtitle: "PROJECT ENTRY NOT FOUND IN DATABASE",
    returnToProjects: "Return to Projects",
    descriptionTitle: "Project.Description",
    stackTitle: "Project.Stack",
    linksTitle: "Project.Links",
    openImage: "Open image",
    repoTitle: "Project.Telemetry",
    repoStars: "Stars",
    repoForks: "Forks",
    repoPushed: "Last push",
    repoCreated: "Created",
    repoLicense: "License",
    repoStatus: "Status",
    repoArchived: "Archived",
    repoNote: "// GitHub data as of the latest site build"
  },
  technologies: {
    kotlin:
      "A modern, cross-platform, statically typed, general-purpose programming language with type inference. Kotlin is designed to interoperate fully with Java.",
    go: "An open-source programming language that makes it easy to build simple, reliable, and efficient software.",
    rust: "A multi-paradigm, general-purpose programming language that emphasizes performance, type safety, and concurrency.",
    gradle:
      "An open-source build automation system that builds upon the concepts of Apache Ant and Apache Maven.",
    spring:
      "A comprehensive programming and configuration model for modern Java-based enterprise applications.",
    java: "A high-level, class-based, object-oriented programming language that is designed to have as few implementation dependencies as possible.",
    groovy:
      "A powerful, multi-faceted language for the Java platform, combining static and dynamic capabilities.",
    scala:
      "A strong statically typed general-purpose programming language which supports both object-oriented programming and functional programming.",
    csharp:
      "A modern, object-oriented, and type-safe programming language developed by Microsoft that runs on the .NET platform.",
    js: "A programming language that is one of the core technologies of the World Wide Web, alongside HTML and CSS.",
    ts: "A strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.",
    vue: "A progressive framework for building user interfaces, designed to be incrementally adoptable.",
    nuxt: "An open-source framework under MIT license that makes web development intuitive and powerful.",
    docker:
      "A set of platform as a service products that use OS-level virtualization to deliver software in packages called containers.",
    git: "A free and open source distributed version control system designed to handle everything from small to very large projects with speed and efficiency.",
    dotnet:
      "A free, open-source, cross-platform framework for building many different types of applications.",
    python:
      "A high-level, interpreted, general-purpose programming language that emphasizes code readability and simplicity."
  },
  timeline: {
    title: "File.Timeline",
    showProjects: "Projects from {year}",
    yearLabel: "Year",
    stagesTitle: "Timeline"
  },
  activity: {
    heatmapTitle: "Uplink.Commits",
    heatmapContributions: "contributions",
    heatmapActiveDays: "active days",
    heatmapStreak: "current streak",
    heatmapLongest: "longest streak",
    heatmapTotal: "{count} contributions in the last year",
    heatmapDay: "{count} on {date}",
    heatmapLess: "less",
    heatmapMore: "more",
    title: "~/Core/Activity.log",
    subtitle: "LIVE CHANNEL // SYSTEM VERSION {version}",
    githubTitle: "Uplink.GitHub",
    feedTitle: "Uplink.Feed",
    chessTitle: "Uplink.Chess",
    codeforcesTitle: "Uplink.Codeforces",
    hobbiesTitle: "File.Hobbies",
    repos: "Repos",
    stars: "Stars",
    followers: "Followers",
    languages: "Top languages",
    blitz: "Blitz",
    best: "Best",
    tactics: "Tactics",
    games: "Games",
    record: "W / L / D",
    rating: "Rating",
    maxRating: "Max",
    rank: "Rank",
    unrated: "UNRATED",
    loading: "ESTABLISHING_LINK...",
    offline: "LINK_LOST: source unavailable",
    pushed: "pushed to",
    created: "created",
    starred: "starred",
    opened: "opened",
    released: "released",
    open: "Open profile"
  },
  palette: {
    placeholder: "Type a command or search...",
    empty: "NO MATCHES",
    hint: "↑↓ select // ↵ run // esc close",
    groups: {
      navigation: "Navigation",
      projects: "Projects",
      theme: "Theme",
      system: "System",
      links: "Links"
    },
    openTerminal: "Open terminal",
    toggleSound: "Toggle sound",
    toggleMotion: "Toggle animations",
    switchLanguage: "Switch language"
  },
  terminal: {
    title: "akkraizen{'@'}core: {path}",
    open: "Open terminal",
    welcome: "AKKRAIZEN SHELL {version}. Type 'help' to list commands.",
    unknown: "command not found: {command}. Type 'help'.",
    help: {
      help: "list commands",
      man: "manual for a command (man cd)",
      whoami: "who is behind this file",
      ls: "list the current directory",
      cd: "change directory and page (cd projects/berill, cd ..)",
      pwd: "current directory",
      cat: "read a file (cat cv, cat readme.txt)",
      projects: "list projects",
      open: "open project or link (open 001, open github)",
      socials: "list links",
      stats: "live ratings",
      theme: "theme [name{'|'}random]",
      lang: "lang [en{'|'}ru]",
      sound: "sound [on{'|'}off]",
      date: "current time",
      hint: "intercept a clue (needs clearance)",
      snake: "mini-game, arrows to steer",
      clear: "clear screen",
      cv: "open printable CV",
      exit: "close terminal"
    }
  },
  footer: {
    hints: "[`] TERMINAL // [CTRL+K] COMMANDS"
  },
  secrets: {
    konami: "TRICK UNLOCKED: OVERDRIVE",
    console: "Curious one, aren't you? Press ` to open the terminal.",
    overclockOn: "SECRET THEME: OVERCLOCK",
    overclockOff: "OVERCLOCK DISENGAGED"
  },
  uplink: {
    title: "~/Core/Uplink.lnk",
    subtitle: "SECURE CHANNEL // SYSTEM VERSION {version}",
    transmitTitle: "Uplink.Transmit",
    transmitIntro: "A direct line to me: the message lands in my Telegram right away. Leave a contact if you expect a reply.",
    logTitle: "Uplink.Log",
    logIntro: "The guestbook. Entries show up after moderation.",
    fields: {
      name: "Name",
      contact: "Contact",
      message: "Message"
    },
    optional: "(optional)",
    contactPlaceholder: "email or {'@'}telegram",
    send: "Transmit",
    sign: "Sign",
    pending: "awaiting moderation",
    loading: "> syncing the log...",
    offline: "[ERR] The log is unreachable. Try again later.",
    empty: "The log is empty. Be the first.",
    status: {
      sending: "> transmitting...",
      sent: "[OK] Signal delivered. Thank you!",
      queued: "[OK] Entry sent for moderation.",
      invalid: "[ERR] Check the field: {field}",
      rate_limited: "[ERR] Too frequent. Wait a few minutes.",
      unavailable: "[ERR] The channel is temporarily unavailable.",
      network: "[ERR] No connection to the server."
    }
  },
  achievements: {
    catPet: "*purrs*",
    unlocked: "ACHIEVEMENT: {name}",
    items: {
      konami: "Overdrive",
      sudo: "Not in sudoers",
      rmrf: "Nice try",
      hisoka: "Magician",
      matrix: "Wake up",
      teapot: "I'm a teapot",
      cat: "Meow",
      vim: "Caught",
      overclock: "Overclock",
      screensaver: "AFK",
      explorer: "Explorer",
      archivist: "Archivist",
      lost: "Lost in the net",
      chameleon: "Chameleon",
      polyglot: "Polyglot",
      nightowl: "Night owl",
      snake: "Hungry",
      signal: "Signal sent"
    }
  },
  screensaver: {
    idle: "SESSION_IDLE",
    resume: "Move the mouse or press any key",
    locked: "Locked",
    idleFor: "Idle for",
    mode: "Mode"
  },
  finale: {
    title: "ALL SECRETS FOUND",
    line1: "INTRUSION DETECTED",
    line2: "{total}/{total} SECRETS COMPROMISED",
    line3: "ESCALATING PRIVILEGES...",
    line4: "DECRYPTING PERSONAL MESSAGE...",
    thanks: "You found all eighteen. You pressed keys nobody should press, waited while nothing happened and read the files nobody reads. That kind of curiosity is exactly why I build places like this one. Thanks for playing: you are officially root here.",
    reward: "Reward: ROOT theme and a badge in the footer. The finale can be replayed from settings.",
    applyRoot: "Apply ROOT",
    close: "Close"
  },
  secretProject: {
    badge: "[DECLASSIFIED]",
    name: "PROJECT_NEXT",
    status: "STATUS: ON THE WORKBENCH",
    description: "The next thing I am building. Codename, stack and screenshots are still under seal, but you have earned proof that it exists. Keep an eye on this list."
  },
  footerRoot: "ROOT ACCESS",
  update: {
    available: "NEW VERSION AVAILABLE",
    reload: "Reload",
    later: "Later"
  },
  cv: {
    title: "~/Core/CV.pdf",
    subtitle: "PRINTABLE FILE",
    download: "Download PDF",
    print: "Print",
    fallback: "The CV is only available in Russian for now.",
    contents: "Contents",
    location: "Location",
    empty: "CV file not found."
  }
} as const;
