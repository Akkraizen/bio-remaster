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
    skip: "Перейти к содержимому"
  },
  settings: {
    title: "CONFIG",
    open: "Открыть настройки",
    menuSubtitle: "SYSTEM_CONFIG_LINKING...",
    language: "Language",
    theme: "Theme",
    sound: "Sound",
    volume: "Volume",
    ambient: "Ambient",
    themeSounds: "Звуки темы",
    motion: "Motion",
    cursor: "Cursor",
    screensaver: "Screensaver",
    secrets: "Secrets",
    secretsFound: "Найдено {found} / {total}",
    secretLocked: "???",
    secretBadge: "СЕКРЕТ",
    cursorStyle: "Cursor style",
    cursorStyles: {
      crosshair: "ПРИЦЕЛ",
      cat: "КОТ"
    },
    screensaverMode: "Screensaver mode",
    screensaverModes: {
      rain: "ДОЖДЬ",
      stars: "ЗВЁЗДЫ",
      scope: "ВОЛНА"
    },
    vimKeys: "Vim keys",
    rank: "Допуск",
    nextRank: "Дальше: {rank} с {count}",
    shareCard: "Поделиться",
    downloadCard: "Скачать",
    shareTitle: "Мои секреты на akkraizen.dev",
    finale: "Повторить финал",
    on: "ВКЛ",
    off: "ВЫКЛ",
    motionModes: {
      full: "ПОЛНОЕ",
      reduced: "УМЕНЬШЕННОЕ"
    },
    languages: {
      en: "English",
      ru: "Русский",
      l33t: "1337 5P34K"
    }
  },
  theme: {
    random: "СЛУЧАЙНАЯ",
    acid: "КИСЛОТА",
    neon: "НЕОН",
    matrix: "МАТРИЦА",
    ice: "ЛЁД",
    amber: "ЯНТАРЬ",
    blood: "КРОВЬ",
    vapor: "ВЕЙПОР",
    sakura: "САКУРА",
    cobalt: "КОБАЛЬТ",
    ghost: "ПРИЗРАК",
    overclock: "РАЗГОН",
    midnight: "ПОЛНОЧЬ",
    root: "ROOT",
    chameleon: "ХАМЕЛЕОН"
  },
  init: {
    title: "SYSTEM.INIT",
    setupTitle: "FIRST_BOOT.CONFIG",
    setupHint: "Уменьшенное движение убирает вспышки и глитчи. Всё можно изменить позже в CONFIG.",
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
    subtitle: "У настоящего фокусника никогда не заканчиваются фокусы."
  },
  file: {
    title: "~/Core/File.prtf",
    subtitle: "AKKRAIZEN FILE",
    biographyTitle: "File.Biography",
    biographyText:
      'Привет! Я <a href="https://kotlinlang.org/" target="_blank" rel="noopener">Kotlin</a>, <a href="https://go.dev/" target="_blank" rel="noopener">Go</a> &amp; <a href="https://www.rust-lang.org/" target="_blank" rel="noopener">Rust</a> любитель. Более чем четыре года я пишу ботов, серверные приложения, скрипты и SPA. Я нацелен стать лучше в <a>backend</a> и <a>frontend</a> разработке. Чуть-чуть DevOps.<br> Я люблю шахматы и котиков! Und Ich lerne <a>Deutsch</a>!<br> Вы можете подписаться на мои соц. сети или написать мне в личные сообщения. Удачи, читатель :3',
    stackTitle: "File.Stack",
    nicknamesTitle: "File.Nicknames",
    nicknames: ["Akkraizen", "kiNgchev", "Кто ещё?.."],
    linksTitle: "File.Links",
    dataTitle: "File.Data",
    age: "Возраст:",
    ageValue: "19",
    location: "Локация:",
    locationValue: "Москва, Россия",
    expTitle: "File.Exp",
    clockTitle: "Local.Time",
    clockVisitor: "Ваше время",
    clockZone: "МСК · UTC+3",
    statusTitle: "System.Status",
    statusFocus: "Текущий фокус",
    statusUptime: "Аптайм",
    statusRepos: "Репо",
    statusStars: "Звёзды",
    statusUnrated: "UNRATED",
    openCv: "РЕЗЮМЕ",
    langTitle: "Lang.Share",
    langRepos: "реп.",
    yearsOfExperience: "Года <br /> опыта"
  },
  projects: {
    searchPlaceholder: "Поиск проектов: название, описание, стек…",
    filterStack: "Стек",
    filterHas: "Есть",
    filterDemo: "Демо",
    filterSource: "Исходники",
    searchResults: "Показано: {shown} / {total}",
    searchReset: "Сбросить фильтры",
    searchEmpty: "НИ ОДНА ЗАПИСЬ НЕ ПОДХОДИТ ПОД ЗАПРОС",
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
    returnToProjects: "Вернуться к проектам",
    descriptionTitle: "Project.Description",
    stackTitle: "Project.Stack",
    linksTitle: "Project.Links",
    openImage: "Открыть изображение",
    repoTitle: "Project.Telemetry",
    repoStars: "Звёзды",
    repoForks: "Форки",
    repoPushed: "Последний пуш",
    repoCreated: "Создан",
    repoLicense: "Лицензия",
    repoStatus: "Статус",
    repoArchived: "В архиве",
    repoNote: "// данные GitHub на момент сборки сайта"
  },
  technologies: {
    kotlin:
      "Современный кроссплатформенный статически типизированный язык программирования общего назначения с выводом типов, созданный для полной совместимости с Java.",
    go: "Язык программирования с открытым исходным кодом, позволяющий легко создавать простое, надежное и эффективное программное обеспечение.",
    rust: "Мультипарадигменный язык программирования общего назначения, ориентированный на высокую производительность, безопасность типов и параллелизм.",
    gradle:
      "Система автоматизации сборки с открытым исходным кодом, основанная на концепциях Apache Ant и Apache Maven.",
    spring:
      "Комплексная модель программирования и конфигурации для современных корпоративных приложений на базе Java.",
    java: "Высокоуровневый объектно-ориентированный язык программирования на основе классов, спроектированный так, чтобы иметь минимум зависимостей реализации.",
    groovy:
      "Мощный многогранный язык для платформы Java, сочетающий в себе статические и динамические возможности.",
    scala:
      "Язык программирования общего назначения со строгой статической типизацией, поддерживающий как объектно-ориентированное, так и функциональное программирование.",
    csharp:
      "Современный объектно-ориентированный и типобезопасный язык программирования от Microsoft, работающий на платформе .NET.",
    js: "Язык программирования, являющийся одной из ключевых технологий Всемирной паутины наряду с HTML и CSS.",
    ts: "Язык программирования со строгой типизацией, расширяющий возможности JavaScript и предоставляющий продвинутые инструменты разработки для проектов любого масштаба.",
    vue: "Прогрессивный фреймворк для создания пользовательских интерфейсов, спроектированный для постепенного и гибкого внедрения.",
    nuxt: "Фреймворк с открытым исходным кодом под лицензией MIT, делающий веб-разработку интуитивно понятной и мощной.",
    docker:
      "Набор PaaS-продуктов, использующих виртуализацию на уровне ОС для доставки программного обеспечения в виде изолированных пакетов — контейнеров.",
    git: "Бесплатная распределенная система управления версиями с открытым исходным кодом, предназначенная для быстрой и эффективной работы с проектами любого масштаба.",
    dotnet:
      "Бесплатная кроссплатформенная среда разработки с открытым исходным кодом для создания самых разнообразных типов приложений.",
    python:
      "Высокоуровневый интерпретируемый язык программирования общего назначения с упором на читаемость кода и простоту."
  },
  timeline: {
    title: "File.Timeline",
    showProjects: "Проекты {year} года",
    yearLabel: "Год",
    stagesTitle: "Хронология"
  },
  activity: {
    heatmapTitle: "Uplink.Commits",
    heatmapContributions: "вкладов",
    heatmapActiveDays: "активных дней",
    heatmapStreak: "серия сейчас",
    heatmapLongest: "лучшая серия",
    heatmapTotal: "{count} вкладов за последний год",
    heatmapDay: "{count} — {date}",
    heatmapLess: "меньше",
    heatmapMore: "больше",
    title: "~/Core/Activity.log",
    subtitle: "ЖИВОЙ КАНАЛ // ВЕРСИЯ СИСТЕМЫ {version}",
    githubTitle: "Uplink.GitHub",
    feedTitle: "Uplink.Feed",
    chessTitle: "Uplink.Chess",
    codeforcesTitle: "Uplink.Codeforces",
    hobbiesTitle: "File.Hobbies",
    repos: "Репозитории",
    stars: "Звёзды",
    followers: "Подписчики",
    languages: "Топ языков",
    blitz: "Блиц",
    best: "Лучший",
    tactics: "Тактика",
    games: "Партии",
    record: "П / П / Н",
    rating: "Рейтинг",
    maxRating: "Макс.",
    rank: "Ранг",
    unrated: "БЕЗ РЕЙТИНГА",
    loading: "УСТАНОВКА_СВЯЗИ...",
    offline: "LINK_LOST: source unavailable",
    pushed: "запушил в",
    created: "создал",
    starred: "отметил",
    opened: "открыл",
    released: "выпустил",
    open: "Открыть профиль"
  },
  palette: {
    placeholder: "Введите команду или поиск...",
    empty: "НЕТ СОВПАДЕНИЙ",
    hint: "↑↓ выбор // ↵ запуск // esc закрыть",
    groups: {
      navigation: "Навигация",
      projects: "Проекты",
      theme: "Тема",
      system: "Система",
      links: "Ссылки"
    },
    openTerminal: "Открыть терминал",
    toggleSound: "Переключить звук",
    toggleMotion: "Переключить анимации",
    switchLanguage: "Сменить язык"
  },
  terminal: {
    title: "akkraizen{'@'}core: {path}",
    open: "Открыть терминал",
    welcome: "AKKRAIZEN SHELL {version}. Введите 'help', чтобы увидеть команды.",
    unknown: "команда не найдена: {command}. Введите 'help'.",
    help: {
      help: "список команд",
      man: "справка по команде (man cd)",
      whoami: "кто стоит за этим файлом",
      ls: "содержимое текущей папки",
      cd: "сменить папку и страницу (cd projects/berill, cd ..)",
      pwd: "текущая папка",
      cat: "прочитать файл (cat cv, cat readme.txt)",
      projects: "список проектов",
      open: "открыть проект или ссылку (open 001, open github)",
      socials: "список ссылок",
      stats: "живые рейтинги",
      theme: "theme [название{'|'}random]",
      lang: "lang [en{'|'}ru]",
      sound: "sound [on{'|'}off]",
      date: "текущее время",
      hint: "перехватить подсказку (нужен допуск)",
      snake: "мини-игра, управление стрелками",
      clear: "очистить экран",
      cv: "открыть резюме для печати",
      exit: "закрыть терминал"
    }
  },
  footer: {
    hints: "[`] ТЕРМИНАЛ // [CTRL+K] КОМАНДЫ"
  },
  secrets: {
    konami: "ФОКУС РАЗБЛОКИРОВАН: OVERDRIVE",
    console: "Любопытный, да? Нажми `, чтобы открыть терминал.",
    overclockOn: "СЕКРЕТНАЯ ТЕМА: РАЗГОН",
    overclockOff: "РАЗГОН ОТКЛЮЧЁН"
  },
  uplink: {
    title: "~/Core/Uplink.lnk",
    subtitle: "SECURE CHANNEL // SYSTEM VERSION {version}",
    transmitTitle: "Uplink.Transmit",
    transmitIntro: "Прямой канал до меня: сообщение сразу уходит в Telegram. Оставьте контакт, если ждёте ответа.",
    logTitle: "Uplink.Log",
    logIntro: "Гостевая книга. Записи появляются после модерации.",
    fields: {
      name: "Имя",
      contact: "Контакт",
      message: "Сообщение"
    },
    optional: "(необязательно)",
    contactPlaceholder: "email или {'@'}telegram",
    send: "Передать",
    sign: "Подписать",
    pending: "на модерации",
    loading: "> синхронизация журнала...",
    offline: "[ERR] журнал недоступен. Попробуйте позже.",
    empty: "Журнал пуст. Будьте первым.",
    status: {
      sending: "> передача...",
      sent: "[OK] Сигнал доставлен. Спасибо!",
      queued: "[OK] Запись отправлена на модерацию.",
      invalid: "[ERR] Проверьте поле: {field}",
      rate_limited: "[ERR] Слишком часто. Подождите несколько минут.",
      unavailable: "[ERR] Канал временно недоступен.",
      network: "[ERR] Нет связи с сервером."
    }
  },
  achievements: {
    catPet: "*мурчит*",
    unlocked: "ДОСТИЖЕНИЕ: {name}",
    items: {
      konami: "Овердрайв",
      sudo: "Не в sudoers",
      rmrf: "Хорошая попытка",
      hisoka: "Фокусник",
      matrix: "Проснись",
      teapot: "Я чайник",
      cat: "Мяу",
      vim: "Пойман",
      overclock: "Разгон",
      screensaver: "АФК",
      explorer: "Исследователь",
      archivist: "Архивариус",
      lost: "Потерялся в сети",
      chameleon: "Хамелеон",
      polyglot: "Полиглот",
      nightowl: "Сова",
      snake: "Голодный",
      signal: "Сигнал отправлен"
    }
  },
  screensaver: {
    idle: "SESSION_IDLE",
    resume: "Пошевелите мышью или нажмите клавишу",
    locked: "Заблокировано",
    idleFor: "Простой",
    mode: "Режим"
  },
  finale: {
    title: "ВСЕ СЕКРЕТЫ НАЙДЕНЫ",
    line1: "ОБНАРУЖЕНО ВТОРЖЕНИЕ",
    line2: "{total}/{total} СЕКРЕТОВ СКОМПРОМЕТИРОВАНО",
    line3: "ПОВЫШЕНИЕ ПРИВИЛЕГИЙ...",
    line4: "РАСШИФРОВКА ЛИЧНОГО СООБЩЕНИЯ...",
    thanks: "Ты нашёл все восемнадцать. Нажимал то, что нажимать не стоило, ждал, когда ничего не происходило, и читал то, что никто не читает. Ради такого любопытства я и делаю подобные места. Спасибо за игру: теперь у тебя здесь root.",
    reward: "Награда: тема ROOT и значок в футере. Финал можно повторить из настроек.",
    applyRoot: "Включить ROOT",
    close: "Закрыть"
  },
  secretProject: {
    badge: "[РАССЕКРЕЧЕНО]",
    name: "PROJECT_NEXT",
    status: "СТАТУС: ON THE WORKBENCH",
    description: "Следующее, что я строю. Кодовое имя, стек и скриншоты пока под грифом, но ты заслужил доказательство, что оно существует. Следи за этим списком."
  },
  footerRoot: "ROOT ACCESS",
  update: {
    available: "ДОСТУПНА НОВАЯ ВЕРСИЯ",
    reload: "Обновить",
    later: "Позже"
  },
  cv: {
    title: "~/Core/CV.pdf",
    subtitle: "ФАЙЛ ДЛЯ ПЕЧАТИ",
    download: "Скачать PDF",
    print: "Печать",
    fallback: "Резюме пока доступно только на русском.",
    contents: "Содержание",
    location: "Локация",
    empty: "Файл резюме не найден."
  }
} as const;
