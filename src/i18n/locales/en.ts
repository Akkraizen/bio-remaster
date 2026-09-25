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
    subtitle: "A true magician never runs out of tricks."
  },
  file: {
    title: "~/Core/File.prtf",
    subtitle: "AKKRAIZEN FILE",
    biographyTitle: "File.Biography",
    biographyText:
      "Hello! I'm a <a>Kotlin</a>, <a>Go</a> &amp; <a>Rust</a> enjoyer. For more than four years, I have been programming bots, server apps, scripts, and SPA.<br>Just a little DevOPS.<br> I love chess and cats. Und Ich lerne <a>Deutsch</a>.<br> <br> You may follow me in my socials, or send a message in DM. Good luck, reader.\n",
    stackTitle: "File.Stack",
    nicknamesTitle: "File.Nicknames",
    nicknames: ["Akkraizen", "kiNgchev", "What else?.."],
    linksTitle: "File.Links",
    dataTitle: "File.Data",
    timezone: "Timezone:",
    timezoneValue: "UTC+3, Moscow",
    age: "Age:",
    ageValue: "19",
    location: "Location:",
    locationValue: "Moscow, Russia",
    expTitle: "File.Exp",
    yearsOfExperience: "Years of <br /> experience"
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
    returnToProjects: "Return to Projects",
    descriptionTitle: "Project.Description",
    stackTitle: "Project.Stack",
    linksTitle: "Project.Links"
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
      "A modern, object-oriented, and type-safe programming language developed by Microsoft that runs on the .NET Framework.",
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
  }
} as const;
