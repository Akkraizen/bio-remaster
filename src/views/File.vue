<script setup lang="ts">
import CyberCard from "@components/CyberCard.vue";
import CyberHero from "@components/CyberHero.vue";
import Social from "@components/Social.vue";
import CyberImage from "@components/CyberImage.vue";
import socials from "@assets/socials";
import TechVerticalCarousel from "@components/TechVerticalCarousel.vue";
import { ref, onMounted, onUnmounted } from "vue";
import Typed from "typed.js";
import { useVersion } from "@/hook/useVersion";

const version = useVersion();
const typedElement = ref<HTMLElement | null>(null);
let typedInstance: Typed | null = null;

onMounted(() => {
  if (!typedElement.value) return;

  typedInstance = new Typed(typedElement.value, {
    strings: [
      "Hello! I'm a <a>Kotlin</a>, <a>Go</a> &amp; <a>Rust</a> enjoyer. For more than four years, I have been programming bots, server apps, scripts, and SPA.<br>Just a little DevOPS.<br> I love chess and cats. Und Ich lerne <a>Deutsch</a>.<br> <br> You may follow me in my socials, or send a message in DM. Good luck, reader.\n"
    ],
    typeSpeed: 20,
    showCursor: true,
    cursorChar: "_",
    contentType: "html"
  });
});

onUnmounted(() => {
  typedInstance?.destroy();
});
</script>

<template>
  <main class="view">
    <CyberHero
      title="~/Core/File.prtf"
      :subtitle="`AKKRAIZEN FILE ${version}`"
      variant="medium"
    />

    <div class="portfolio-container">
      <div class="top-row">
        <div class="avatar-group">
          <section>
            <CyberImage
              src="/avatar.jpg"
              alt="Avatar"
              :corner-size="30"
              class="avatar-image"
            />
          </section>
        </div>

        <section class="bio-section">
          <h1>File.Biography</h1>
          <p class="bio-text"><span ref="typedElement"></span></p>
        </section>

        <section class="tech-section">
          <CyberCard title="File.Stack" shape="all-corners">
            <TechVerticalCarousel />
          </CyberCard>
        </section>
      </div>

      <div class="cards-group">
        <section class="nicknames-section">
          <CyberCard title="File.Nicknames">
            <ul class="nicknames-list">
              <li>Akkraizen</li>
              <li>kiNgchev</li>
            </ul>
          </CyberCard>
        </section>

        <section class="contact-section">
          <CyberCard title="File.Links">
            <div class="contact-grid">
              <a
                v-for="social in socials"
                :key="social.id"
                :href="social.link"
                target="_blank"
                class="social-link"
              >
                <Social :icon="social.icon" />
              </a>
            </div>
          </CyberCard>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.portfolio-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.top-row {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.avatar-group {
  width: 250px;
}

.cards-group {
  display: flex;
  gap: 1.5rem;
  align-items: stretch;
}

.contact-section {
  flex: 1;
}

.tech-section {
  flex: 0 1;
}

.contact-section,
.tech-section {
  display: flex;
  flex-direction: column;
}

.nicknames-section {
  width: 250px;
  display: flex;
  flex-direction: column;
}

.avatar-image {
  width: 100%;
}

.bio-section {
  flex: 1;
}

.bio-text {
  line-height: 1.6;

  :deep(.typed-cursor) {
    color: vars.$accent-color;
    font-weight: bold;
  }
}

.nicknames-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  li {
    padding-left: 1rem;
    border-left: 2px solid vars.$warning-color;
  }
}

.contact-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;

  .social-link {
    text-decoration: none;
  }
}

@media (max-width: 1024px) {
  .top-row {
    flex-wrap: wrap;
  }

  .avatar-group {
    width: 200px;
  }

  .bio-section {
    flex: 1 1 calc(100% - 200px - 1.5rem);
  }

  .cards-group {
    flex-wrap: wrap;
  }

  .nicknames-section {
    width: 250px;
  }

  .contact-section {
    flex: 1 1 calc(100% - 250px - 1.5rem);
  }

  .tech-section {
    flex: 1 1 100%;
  }
}

@media (max-width: 768px) {
  .top-row,
  .cards-group {
    flex-direction: column;
  }

  .avatar-group,
  .nicknames-section,
  .contact-section,
  .tech-section {
    width: 100%;
    flex: none;
  }

  .avatar-image {
    width: 100%;
  }
}
</style>
