export default {
  nav: {
    entrypoint: "Core.Entrypoint",
    file: "Core.File",
    projects: "Core.Projects",
    menu: "[ MENU ]",
    close: "[ CLOSE ]",
    systemNavLinking: "SYSTEM_NAV_LINKING...",
    authGranted: "AUTH_REQ: GRANTED"
  },
  init: {
    title: "SYSTEM.INIT",
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
      'Привет! Я <a>Kotlin</a>, <a>Go</a> &amp; <a>Rust</a> любитель. Более чем четыре года я пишу ботов, серверные приложения, скрипты и SPA. Я нацелен стать лучше в <a>backend</a> и <a>frontend</a> разработке. Чуть-чуть DevOps.<br> Я люблю шахматы и котиков! Und Ich lerne <a>Deutsch</a>!<br> Вы можете подписаться на мои соц. сети или написать мне в личные сообщения. Удачи, читатель :3',
    stackTitle: "File.Stack",
    nicknamesTitle: "File.Nicknames",
    nicknames: ["Akkraizen", "kiNgchev", "Кто ещё?.."],
    linksTitle: "File.Links",
    dataTitle: "File.Data",
    timezone: "Часовой пояс:",
    timezoneValue: "UTC+3, Москва",
    age: "Возраст:",
    ageValue: "19",
    location: "Локация:",
    locationValue: "Москва, Россия",
    expTitle: "File.Exp",
    yearsOfExperience: "Года <br /> опыта"
  },
  projects: {
    title: "~/Core/Projects/",
    subtitle: "DATABASE ENTRIES: {count} | SYSTEM VERSION {version}",
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
    linksTitle: "Project.Links"
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
  }
} as const;
