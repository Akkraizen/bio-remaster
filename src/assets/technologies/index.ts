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

export interface Technology {
  id: number;
  name: string;
  link: string;
  icon: string;
  description: string;
}

const technologies: Record<string, Technology> = {
  kotlin: {
    id: 1,
    name: "Kotlin",
    link: "https://kotlinlang.org/",
    icon: kotlinSvg,
    description:
      "A modern, cross-platform, statically typed, general-purpose programming language with type inference. Kotlin is designed to interoperate fully with Java."
  },
  go: {
    id: 2,
    name: "Go",
    link: "https://go.dev/",
    icon: goSvg,
    description:
      "An open-source programming language that makes it easy to build simple, reliable, and efficient software."
  },
  rust: {
    id: 3,
    name: "Rust",
    link: "https://www.rust-lang.org/",
    icon: rustSvg,
    description:
      "A multi-paradigm, general-purpose programming language that emphasizes performance, type safety, and concurrency."
  },
  gradle: {
    id: 4,
    name: "Gradle",
    link: "https://gradle.org/",
    icon: gradleSvg,
    description:
      "An open-source build automation system that builds upon the concepts of Apache Ant and Apache Maven."
  },
  spring: {
    id: 5,
    name: "Spring",
    link: "https://spring.io/",
    icon: springSvg,
    description:
      "A comprehensive programming and configuration model for modern Java-based enterprise applications."
  },
  java: {
    id: 6,
    name: "Java",
    link: "https://www.java.com/",
    icon: javaSvg,
    description:
      "A high-level, class-based, object-oriented programming language that is designed to have as few implementation dependencies as possible."
  },
  groovy: {
    id: 7,
    name: "Groovy",
    link: "https://www.groovy-lang.org/",
    icon: groovySvg,
    description:
      "A powerful, multi-faceted language for the Java platform, combining static and dynamic capabilities."
  },
  scala: {
    id: 8,
    name: "Scala",
    link: "https://www.scala-lang.org/",
    icon: scalaSvg,
    description:
      "A strong statically typed general-purpose programming language which supports both object-oriented programming and functional programming."
  },
  csharp: {
    id: 9,
    name: "C#",
    link: "https://dotnet.microsoft.com/en-us/languages/csharp",
    icon: csharpSvg,
    description:
      "A modern, object-oriented, and type-safe programming language developed by Microsoft that runs on the .NET Framework."
  },
  js: {
    id: 10,
    name: "JS",
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    icon: jsSvg,
    description:
      "A programming language that is one of the core technologies of the World Wide Web, alongside HTML and CSS."
  },
  ts: {
    id: 11,
    name: "TS",
    link: "https://www.typescriptlang.org",
    icon: tsSvg,
    description:
      "A strongly typed programming language that builds on JavaScript, giving you better tooling at any scale."
  },
  vue: {
    id: 12,
    name: "Vue",
    link: "https://vuejs.org/",
    icon: vueSvg,
    description:
      "A progressive framework for building user interfaces, designed to be incrementally adoptable."
  },
  nuxt: {
    id: 13,
    name: "Nuxt",
    link: "https://nuxt.com/",
    icon: nuxtSvg,
    description:
      "An open-source framework under MIT license that makes web development intuitive and powerful."
  },
  docker: {
    id: 14,
    name: "Docker",
    link: "https://www.docker.com/",
    icon: dockerSvg,
    description:
      "A set of platform as a service products that use OS-level virtualization to deliver software in packages called containers."
  },
  git: {
    id: 15,
    name: "Git",
    link: "https://git-scm.com/",
    icon: gitSvg,
    description:
      "A free and open source distributed version control system designed to handle everything from small to very large projects with speed and efficiency."
  },
  dotnet: {
    id: 16,
    name: ".NET",
    link: "https://dotnet.microsoft.com/",
    icon: dotnetSvg,
    description:
      "A free, open-source, cross-platform framework for building many different types of applications."
  },
  python: {
    id: 17,
    name: "Python",
    link: "https://www.python.org/",
    icon: pythonSvg,
    description:
      "A high-level, interpreted, general-purpose programming language that emphasizes code readability and simplicity."
  }
};

export default technologies;
