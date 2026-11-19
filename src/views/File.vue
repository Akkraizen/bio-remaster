<script setup lang="ts">
import CyberCard from "@components/CyberCard.vue";
import CyberButton from "@components/CyberButton.vue";
import { useRouter } from "vue-router";
import { staticPages } from "@/config/seo.ts";
import CyberHero from "@components/CyberHero.vue";
import Social from "@components/Social.vue";
import CyberImage from "@components/CyberImage.vue";
import socials from "@assets/socials";
import TechVerticalCarousel from "@components/TechVerticalCarousel.vue";
import StackLanguages from "@components/StackLanguages.vue";
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import Typed from "typed.js";
import { useVersion } from "@/hook/useVersion";
import { useResponsive } from "@/hook/useResponsive";
import { useI18n, translations } from "@/i18n";
import DecryptText from "@components/DecryptText.vue";
import CountUp from "@components/CountUp.vue";
import CyberTimeline from "@components/CyberTimeline.vue";
import CyberClock from "@components/CyberClock.vue";
import CyberStatus from "@components/CyberStatus.vue";
import { reducedMotion } from "@/hook/usePreferences.ts";
import { playTypeTick } from "@/utils/synthSounds.ts";
import { scrambleTextIn } from "@/utils/scrambleText.ts";
import { toggleOverclock } from "@/utils/easterEggs.ts";

const version = useVersion();
const router = useRouter();
const openCv = () => router.push(staticPages["Core.CV"].path);

const AVATAR_TAPS = 5;
const AVATAR_TAP_WINDOW = 2000;
let avatarTaps: number[] = [];

const onAvatarTap = () => {
  const now = Date.now();
  avatarTaps = [...avatarTaps.filter((time) => now - time < AVATAR_TAP_WINDOW), now];
  if (avatarTaps.length < AVATAR_TAPS) return;
  avatarTaps = [];
  toggleOverclock();
};
const { locale, t } = useI18n();
const typedElement = ref<HTMLElement | null>(null);
// Typed.js removes its cursor on destroy; this one replaces it after a language switch
const showStaticCursor = ref(false);

let typedInstance: Typed | null = null;
let typingObserver: MutationObserver | null = null;
const { getResponsiveShape } = useResponsive();

const nicknames = computed(() => translations[locale.value].file.nicknames);

const biographyText = computed(() => translations[locale.value].file.biographyText);

const ageValue = computed(() => Number(t("file.ageValue")));


// Typed.js has no per-character hook, so typing is detected through DOM mutations
const observeTyping = (element: HTMLElement) => {
  typingObserver?.disconnect();
  typingObserver = new MutationObserver(() => playTypeTick());
  typingObserver.observe(element, { childList: true, characterData: true, subtree: true });
};

const initTyped = () => {
  if (!typedElement.value) return;

  typedInstance?.destroy();
  typedInstance = null;
  showStaticCursor.value = false;

  // Reduced motion: show the whole text at once
  if (reducedMotion()) {
    typingObserver?.disconnect();
    typedElement.value.innerHTML = translations[locale.value].file.biographyText;
    return;
  }

  observeTyping(typedElement.value);
  typedInstance = new Typed(typedElement.value, {
    strings: [translations[locale.value].file.biographyText],
    typeSpeed: 20,
    showCursor: true,
    cursorChar: "_",
    contentType: "html",
    onComplete: () => typingObserver?.disconnect()
  });
};

onMounted(() => {
  initTyped();
});

// Language switch: the new text appears at once and decrypts chaotically, like the rest of the page
const decryptBiography = () => {
  const element = typedElement.value;
  if (!element || reducedMotion()) return initTyped();

  typedInstance?.destroy();
  typedInstance = null;
  typingObserver?.disconnect();

  element.innerHTML = translations[locale.value].file.biographyText;
  showStaticCursor.value = true;
  scrambleTextIn(element, 1300);
};

watch(locale, decryptBiography);

onUnmounted(() => {
  typedInstance?.destroy();
  typingObserver?.disconnect();
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
  mobile: "bottom-corners",
  large: "bottom-right",
  default: "bottom-right"
});
</script>

<template>
  <div class="view">
    <CyberHero
      :title="t('file.title')"
      :subtitle="`${t('file.subtitle')} ${version}`"
      variant="medium"
    />

    <div class="portfolio-container">
      <div class="top-row">
        <div class="avatar-group">
          <section @click="onAvatarTap">
            <CyberImage
              src="/avatar.webp"
              alt="Avatar"
              :corner-size="30"
              :boardWidth="10"
              class="avatar-image"
            />
          </section>
          <CyberClock class="avatar-clock" />
        </div>

        <section class="bio-section">
          <div class="bio-text-container">
            <div class="bio-header">
              <h1><DecryptText :text="t('file.biographyTitle')" /></h1>
              <CyberButton
                class="bio-cv"
                variant="solid"
                shape="rectangle"
                :corner-size="8"
                @click="openCv"
              >
                &gt; {{ t("file.openCv") }}
              </CyberButton>
            </div>
            <!-- Excluded from the page-wide scramble: it runs its own (decryptBiography) -->
            <p class="bio-text" data-no-scramble>
              <span class="bio-ghost" aria-hidden="true"><span v-html="biographyText"></span>_</span>
              <span class="bio-live"
                ><span ref="typedElement"></span
                ><span
                  v-if="showStaticCursor"
                  class="typed-cursor typed-cursor--blink"
                  aria-hidden="true"
                  >_</span
                ></span
              >
            </p>
          </div>
          <CyberStatus />
        </section>

        <section class="tech-section">
          <CyberCard :title="t('file.stackTitle')" :shape="calculateStackCorners">
            <div class="stack-carousel">
              <TechVerticalCarousel :rows="3" />
            </div>
            <StackLanguages class="stack-languages" />
          </CyberCard>
        </section>
      </div>

      <div class="cards-group" data-cursor-group=".cyber-card-container">
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
            <div class="contact-grid" data-cursor-group=".social-square">
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
                    <h3 class="table-header">{{ t('file.age') }}</h3>
                  </td>
                  <td class="table-ceil">
                    <a>
                      <CountUp v-if="!Number.isNaN(ageValue)" :value="ageValue" />
                      <template v-else>{{ t('file.ageValue') }}</template>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td class="table-ceil">
                    <h3 class="table-header">{{ t('file.location') }}</h3>
                  </td>
                  <td class="table-ceil">
                    <a href="https://yandex.ru/maps/geo/moskva/53166393/" target="_blank">{{ t('file.locationValue') }}</a>
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
              <h3><CountUp :value="4" :duration="1000" /></h3>
              <p v-html="t('file.yearsOfExperience')"></p>
            </div>
          </CyberCard>
        </section>
      </div>

      <section class="timeline-section">
        <CyberCard :title="t('timeline.title')" shape="diagonal-tl-br">
          <CyberTimeline />
        </CyberCard>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@style/_vars";
@use "@style/_mixins";

.portfolio-container {
  --side-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.top-row {
  display: flex;
  gap: 1.5rem;
  align-items: stretch;
}

.avatar-group {
  width: 250px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.avatar-clock {
  flex: 1;
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
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.bio-section .cyber-status {
  flex: none;
  height: auto;
}

.tech-section :deep(.card-content) {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stack-carousel {
  flex: 1;
  display: flex;
  align-items: center;
}

.bio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  h1 {
    margin: 0;
  }
}

.bio-cv {
  flex-shrink: 0;

  :deep(.cyber-button) {
    padding: 0.3rem 0.9rem;
    font-size: 0.75rem;
    white-space: nowrap;
  }
}

.bio-text-container {
  display: flex;
  flex-direction: column;
  padding: 15px;
  flex: 1;
  @include mixins.glass-effect(vars.$accent-color, 0.1);
}

.bio-text {
  display: grid;
  line-height: 1.6;

  :deep(.typed-cursor) {
    color: vars.$accent-color;
    font-weight: bold;
  }
}

.bio-ghost,
.bio-live {
  grid-area: 1 / 1;
}

.bio-ghost {
  visibility: hidden;
  pointer-events: none;
  user-select: none;
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

@media (min-width: 769px) {
  .top-row {
    display: grid;
    grid-template-columns: 250px minmax(0, 1fr) auto;
    grid-template-rows: auto auto;
    gap: 1.5rem;
  }

  .avatar-group,
  .bio-section {
    display: contents;
  }

  .avatar-group > section {
    grid-area: 1 / 1;
    align-self: start;
  }

  .avatar-clock {
    grid-area: 2 / 1;
  }

  .bio-text-container {
    grid-area: 1 / 2;
    min-width: 0;
  }

  .bio-section .cyber-status {
    grid-area: 2 / 2;
    height: 100%;
  }

  .tech-section {
    grid-area: 1 / 3 / 3 / 4;
  }
}

@media (min-width: 1201px) {
  .top-row {
    grid-template-columns: 250px minmax(0, 1fr) var(--side-width);
  }

  .exp-section {
    flex: 0 0 var(--side-width);
    min-width: 0;
  }
}

@media (min-width: 769px) and (max-width: 1200px) {
  .top-row {
    grid-template-columns: 200px minmax(0, 1fr);
  }

  .tech-section {
    grid-area: 3 / 1 / 4 / 3;
  }
}

@media (max-width: 1200px) {
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

  .stack-languages {
    display: none;
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
