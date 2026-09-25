<script setup lang="ts">
import CyberCard from "@components/CyberCard.vue";
import CyberHero from "@components/CyberHero.vue";
import Social from "@components/Social.vue";
import CyberImage from "@components/CyberImage.vue";
import socials from "@assets/socials";
import TechVerticalCarousel from "@components/TechVerticalCarousel.vue";
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import Typed from "typed.js";
import { useVersion } from "@/hook/useVersion";
import { useResponsive } from "@/hook/useResponsive";
import { useI18n, translations } from "@/i18n";

const version = useVersion();
const { locale, t } = useI18n();
const years = ref(0);
const typedElement = ref<HTMLElement | null>(null);

let typedInstance: Typed | null = null;
const { getResponsiveShape } = useResponsive();

const nicknames = computed(() => translations[locale.value].file.nicknames);

const initTyped = () => {
  if (!typedElement.value) return;

  typedInstance?.destroy();

  typedInstance = new Typed(typedElement.value, {
    strings: [translations[locale.value].file.biographyText],
    typeSpeed: 20,
    showCursor: true,
    cursorChar: "_",
    contentType: "html"
  });
};

const countYears = () => {
  let intId = setInterval(() => {
    if (years.value < 4) {
      years.value += 1;
    } else {
      clearInterval(intId);
      return;
    }
  }, 250);
};

onMounted(() => {
  countYears();
  initTyped();
});

watch(locale, () => {
  initTyped();
});

onUnmounted(() => {
  typedInstance?.destroy();
});

const calculateStackCorners = getResponsiveShape({
  large: "top-corners",
  default: "top-right"
});

const calculateLinksCorners = getResponsiveShape("rectangle");

const calculateNicknamesCorners = getResponsiveShape({
  large: "rectangle",
  default: "bottom-left"
});

const calculateInfoCorners = getResponsiveShape({
  mobile: "rectangle",
  large: "bottom-left",
  default: "rectangle"
});

const calculateExpCorners = getResponsiveShape({
  large: "bottom-corners",
  default: "bottom-right"
});
</script>

<template>
  <main class="view">
    <CyberHero
      :title="t('file.title')"
      :subtitle="`${t('file.subtitle')} ${version}`"
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
          <div class="bio-text-container">
            <h1>{{ t('file.biographyTitle') }}</h1>
            <p class="bio-text"><span ref="typedElement"></span></p>
          </div>
        </section>

        <section class="tech-section">
          <CyberCard :title="t('file.stackTitle')" :shape="calculateStackCorners">
            <TechVerticalCarousel />
          </CyberCard>
        </section>
      </div>

      <div class="cards-group">
        <section class="nicknames-section">
          <CyberCard :title="t('file.nicknamesTitle')" :shape="calculateNicknamesCorners">
            <ul class="nicknames-list">
              <li v-for="(nick, index) in nicknames" :key="index">
                {{ nick }}
              </li>
            </ul>
          </CyberCard>
        </section>

        <section class="contact-section">
          <CyberCard :title="t('file.linksTitle')" :shape="calculateLinksCorners">
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
        <section class="info-section">
          <CyberCard
            :title="t('file.dataTitle')"
            class="info-grid"
            :shape="calculateInfoCorners"
          >
            <table class="info-table">
              <tbody>
                <tr>
                  <td class="table-ceil">
                    <h3 class="table-header">{{ t('file.timezone') }}</h3>
                  </td>
                  <td class="table-ceil">
                    <a>{{ t('file.timezoneValue') }}</a>
                  </td>
                </tr>
                <tr>
                  <td class="table-ceil">
                    <h3 class="table-header">{{ t('file.age') }}</h3>
                  </td>
                  <td class="table-ceil">
                    <a>{{ t('file.ageValue') }}</a>
                  </td>
                </tr>
                <tr>
                  <td class="table-ceil">
                    <h3 class="table-header">{{ t('file.location') }}</h3>
                  </td>
                  <td class="table-ceil">
                    <a
                      href="https://yandex.ru/maps/geo/moskva/53166393/"
                      target="_blank"
                    >
                      {{ t('file.locationValue') }}
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </CyberCard>
        </section>
        <section class="exp-section">
          <CyberCard
            :title="t('file.expTitle')"
            class="info-grid"
            :shape="calculateExpCorners"
          >
            <div class="exp-container">
              <h3>{{ years }}</h3>
              <p v-html="t('file.yearsOfExperience')"></p>
            </div>
          </CyberCard>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use "@style/_vars";
@use "@style/_mixins";

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

.bio-text-container {
  padding: 15px;
  height: 100%;
  @include mixins.glass-effect(vars.$accent-color, 0.1);
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

.info-table {
  display: flex;
  align-items: center;
  align-content: space-evenly;

  h3 {
    text-decoration: none;
  }
}

td,
th {
  padding-top: 6px;
  padding-bottom: 6px;
}

.table-header {
  border-left: 2px solid vars.$warning-color;
  padding-left: 1rem;
  margin: 0;
}

.table-ceil:nth-child(odd) {
  width: 30%;
  text-align: start;
  vertical-align: top;
}

.table-ceil:nth-child(even) {
  padding-left: 1rem;
}

.table-ceil a {
  font-size: 0.95rem;
  font-weight: 500;
}

.exp-container {
  @include mixins.glass-effect(vars.$accent-color, 0.1);
  text-align: center;
  height: 100%;
  padding: 15px;

  h3 {
    margin: 0;
    font-size: 1.5rem;
  }

  p {
    margin: 5px 0 0;
    font-size: 0.9rem;
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

  .info-section,
  .exp-section {
    flex: 1 1;
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
