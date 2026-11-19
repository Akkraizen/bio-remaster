<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import CyberBadge from "@components/CyberBadge.vue";
import CyberOutline from "@components/CyberOutline.vue";
import CyberHero from "@components/CyberHero.vue";
import CyberButton from "@components/CyberButton.vue";
import { translations, useI18n, type Locale } from "@/i18n";
import { activeThemeName, secretThemes, useTheme, type ThemePreference } from "@/hook/useTheme.ts";
import {
  cursorStyles,
  screensaverModes,
  usePreferences,
  type CursorStyle,
  type MotionMode,
  type ScreensaverMode,
  type VolumeLevel
} from "@/hook/usePreferences.ts";
import {
  playCloseSweep,
  playConfirm,
  playOpenSweep,
  playRoulette,
  playStatic
} from "@/utils/synthSounds.ts";
import { triggerGlitch } from "@/utils/glitchFx.ts";
import { useResponsive } from "@/hook/useResponsive.ts";
import { lockScroll } from "@/hook/useScrollLock.ts";
import { registerExclusiveOverlay } from "@/hook/useOverlays.ts";
import {
  achievementCount,
  achievementIds,
  achievements,
  allUnlocked,
  currentRank,
  hasAchievement,
  isSecretThemeUnlocked,
  nextRank
} from "@/utils/achievements.ts";
import { startFinale } from "@/hook/useFinale.ts";
import { downloadCard, shareCard } from "@/utils/shareCard.ts";
import { showToast } from "@/utils/easterEggs.ts";
import { track } from "@/utils/analytics.ts";

const route = useRoute();
const { locale, setLocale, setLeet, leetMode, t } = useI18n();
const { theme, preference, isRandom, themes, setThemePreference } = useTheme();
const { preferences, volumeLevels } = usePreferences();
const { isLarge } = useResponsive();

const fullscreen = isLarge;
const outlineProps = {
  shape: "diagonal-tr-bl",
  cornerSize: 15,
  backgroundColor: "var(--c-bg)",
  hoverBackgroundColor: "var(--c-bg)",
  cursorFocus: false
} as const;

const locales = Object.keys(translations) as Locale[];
const LEET = "l33t";
const languageOptions = computed(() => [...locales, ...(hasAchievement("polyglot") ? [LEET] : [])]);
const isLanguageActive = (code: string) =>
  code === LEET ? leetMode.value : !leetMode.value && code === locale.value;
const unlockedSecretThemes = computed(() => secretThemes.filter(isSecretThemeUnlocked));
const motionModes: MotionMode[] = ["full", "reduced"];
const toggleValues = [true, false];

const optionProps = {
  class: "option",
  variant: "solid",
  shape: "diagonal-tr-bl",
  cornerSize: 8,
  fullWidth: true,
  silent: true
} as const;

const isOpen = ref(false);
lockScroll(isOpen);
registerExclusiveOverlay(isOpen);
const root = ref<HTMLElement | null>(null);
const panel = ref<HTMLElement | null>(null);
const panelPosition = ref({ top: 0, left: 0, maxHeight: 0 });
const hasFinePointer = ref(false);

const updatePosition = () => {
  if (!root.value) return;
  const rect = root.value.getBoundingClientRect();

  if (fullscreen.value) {
    const navbar = document.querySelector(".cyber-navbar");
    const top = navbar?.getBoundingClientRect().bottom ?? rect.bottom;
    panelPosition.value = { top, left: 0, maxHeight: window.innerHeight - top };
    return;
  }

  const top = rect.bottom + 14;
  panelPosition.value = {
    top,
    left: rect.left,
    maxHeight: window.innerHeight - top - 16
  };
};

const toggle = () => {
  if (!isOpen.value) updatePosition();
  isOpen.value = !isOpen.value;
};

const close = () => {
  isOpen.value = false;
};

const selectLocale = (value: string) => {
  playConfirm();
  if (value === LEET) {
    if (!leetMode.value) setLeet();
    return;
  }
  if (value !== locale.value || leetMode.value) setLocale(value as Locale);
};

const setScreensaverMode = (value: ScreensaverMode) => {
  preferences.screensaverMode = value;
  playConfirm();
};

const setCursorStyle = (value: CursorStyle) => {
  preferences.cursorStyle = value;
  playConfirm();
};

const setVimKeys = (enabled: boolean) => {
  preferences.vimKeys = enabled;
  playConfirm();
};

const sharing = ref(false);

const share = async () => {
  if (sharing.value) return;
  sharing.value = true;
  playConfirm();
  try {
    track("share_card", { result: await shareCard() });
  } catch {
    showToast("SHARE_FAILED");
  } finally {
    sharing.value = false;
  }
};

const download = async () => {
  playConfirm();
  try {
    await downloadCard();
  } catch {
    showToast("EXPORT_FAILED");
  }
};

const replayFinale = () => {
  close();
  setTimeout(startFinale, 250);
};

const setSound = (enabled: boolean) => {
  if (enabled === preferences.soundEnabled) return;
  // The confirmation is played while sound is on: after enabling, before disabling
  if (enabled) {
    preferences.soundEnabled = true;
    playConfirm();
  } else {
    playCloseSweep();
    preferences.soundEnabled = false;
  }
};

const setVolume = (value: VolumeLevel) => {
  preferences.volume = value;
  playConfirm();
};

const setAmbient = (enabled: boolean) => {
  preferences.ambient = enabled;
  playConfirm();
};

const setThemeSounds = (enabled: boolean) => {
  preferences.themeSounds = enabled;
  playConfirm();
};

const setMotion = (value: MotionMode) => {
  preferences.motion = value;
  playConfirm();
};

const setScreensaver = (enabled: boolean) => {
  preferences.screensaver = enabled;
  playConfirm();
};

const setCursor = (enabled: boolean) => {
  preferences.cursor = enabled;
  playConfirm();
};

const selectTheme = (value: ThemePreference) => {
  if (value !== "random" && value !== "chameleon" && value === preference.value) {
    playConfirm();
    return;
  }
  setThemePreference(value);
  triggerGlitch("strong");
  playStatic();
  if (value === "random" || value === "chameleon") playRoulette();
  else playConfirm();
};

let previewing = false;

const previewTheme = (name: string) => {
  if (!hasFinePointer.value) return;
  previewing = true;
  document.documentElement.dataset.theme = name;
};

const endPreview = () => {
  if (!previewing) return;
  previewing = false;
  document.documentElement.dataset.theme = activeThemeName();
};

watch(isOpen, (open) => {
  if (!open) endPreview();
});

const onClickOutside = (event: MouseEvent) => {
  const path = event.composedPath();
  if ((root.value && path.includes(root.value)) || (panel.value && path.includes(panel.value))) return;
  close();
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") close();
};

onMounted(() => {
  hasFinePointer.value = window.matchMedia("(pointer: fine)").matches;
  document.addEventListener("click", onClickOutside);
  document.addEventListener("keydown", onKeydown);
  window.addEventListener("resize", updatePosition);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onClickOutside);
  document.removeEventListener("keydown", onKeydown);
  window.removeEventListener("resize", updatePosition);
});

watch(() => route.path, close);
</script>

<template>
  <div ref="root" class="cyber-settings">
    <CyberBadge
      :text="t('settings.title')"
      :title="t('settings.open')"
      :aria-label="t('settings.open')"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      type="status"
      shape="diagonal-tr-bl"
      :active="isOpen"
      interactive
      @click="toggle"
    />

    <Teleport to="body">
      <transition name="settings-backdrop">
        <div v-if="isOpen && !fullscreen" class="settings-backdrop" aria-hidden="true"></div>
      </transition>
      <transition
        name="settings-panel"
        @before-enter="playOpenSweep()"
        @before-leave="playCloseSweep()"
      >
        <div
          v-if="isOpen"
          ref="panel"
          class="settings-panel"
          :class="{ fullscreen }"
          :style="{
            top: `${panelPosition.top}px`,
            left: `${panelPosition.left}px`,
            '--panel-max-height': `${panelPosition.maxHeight}px`
          }"
        >
          <component
            :is="fullscreen ? 'div' : CyberOutline"
            v-bind="fullscreen ? { class: 'settings-surface' } : outlineProps"
          >
            <div v-if="fullscreen" class="menu-header">
              <CyberHero
                title=""
                :subtitle="t('settings.menuSubtitle')"
                variant="small"
              />
            </div>
            <div
              class="settings-content"
              data-cursor-group=".cyber-button-container:not(:has(.is-disabled))"
            >
              <div class="settings-column">
              <section class="settings-section">
                <h4 class="section-title">{{ t("settings.language") }}</h4>
                <div class="options" :class="{ 'options-row': languageOptions.length < 3 }">
                  <CyberButton
                    v-for="code in languageOptions"
                    :key="code"
                    v-bind="optionProps"
                    :active="isLanguageActive(code)"
                    @click="selectLocale(code)"
                  >
                    <span class="option-code">{{ code.toUpperCase() }}</span>
                    <span class="option-label">{{
                      t(`settings.languages.${code}`)
                    }}</span>
                  </CyberButton>
                </div>
              </section>

              <section class="settings-section">
                <h4 class="section-title">{{ t("settings.sound") }}</h4>
                <div class="options options-row">
                  <CyberButton
                    v-for="enabled in toggleValues"
                    :key="String(enabled)"
                    v-bind="optionProps"
                    :active="preferences.soundEnabled === enabled"
                    @click="setSound(enabled)"
                  >
                    <span class="option-label">{{
                      t(enabled ? "settings.on" : "settings.off")
                    }}</span>
                  </CyberButton>
                </div>

                <h5 class="subsection-title">{{ t("settings.volume") }}</h5>
                <div class="options options-row">
                  <CyberButton
                    v-for="level in volumeLevels"
                    :key="level"
                    v-bind="optionProps"
                    class="option-compact"
                    :active="preferences.volume === level"
                    :disabled="!preferences.soundEnabled"
                    :aria-label="`${level * 100}%`"
                    @click="setVolume(level)"
                  >
                    <span class="volume-bars" aria-hidden="true">
                      <span
                        v-for="bar in volumeLevels"
                        :key="bar"
                        class="bar"
                        :class="{ filled: bar <= level }"
                      />
                    </span>
                  </CyberButton>
                </div>

                <h5 class="subsection-title">{{ t("settings.ambient") }}</h5>
                <div class="options options-row">
                  <CyberButton
                    v-for="enabled in toggleValues"
                    :key="String(enabled)"
                    v-bind="optionProps"
                    :active="preferences.ambient === enabled"
                    :disabled="!preferences.soundEnabled"
                    @click="setAmbient(enabled)"
                  >
                    <span class="option-label">{{
                      t(enabled ? "settings.on" : "settings.off")
                    }}</span>
                  </CyberButton>
                </div>

                <h5 class="subsection-title">{{ t("settings.themeSounds") }}</h5>
                <div class="options options-row">
                  <CyberButton
                    v-for="enabled in toggleValues"
                    :key="String(enabled)"
                    v-bind="optionProps"
                    :active="preferences.themeSounds === enabled"
                    :disabled="!preferences.soundEnabled"
                    @click="setThemeSounds(enabled)"
                  >
                    <span class="option-label">{{
                      t(enabled ? "settings.on" : "settings.off")
                    }}</span>
                  </CyberButton>
                </div>
              </section>
              </div>

              <div class="settings-column">
              <section class="settings-section">
                <h4 class="section-title">{{ t("settings.motion") }}</h4>
                <div class="options options-row">
                  <CyberButton
                    v-for="mode in motionModes"
                    :key="mode"
                    v-bind="optionProps"
                    :active="preferences.motion === mode"
                    @click="setMotion(mode)"
                  >
                    <span class="option-label">{{
                      t(`settings.motionModes.${mode}`)
                    }}</span>
                  </CyberButton>
                </div>

                <h5 class="subsection-title">{{ t("settings.screensaver") }}</h5>
                <div class="options options-row">
                  <CyberButton
                    v-for="enabled in toggleValues"
                    :key="String(enabled)"
                    v-bind="optionProps"
                    :active="preferences.screensaver === enabled"
                    @click="setScreensaver(enabled)"
                  >
                    <span class="option-label">{{
                      t(enabled ? "settings.on" : "settings.off")
                    }}</span>
                  </CyberButton>
                </div>

                <template v-if="hasAchievement('matrix')">
                  <h5 class="subsection-title">{{ t("settings.screensaverMode") }}</h5>
                  <div class="options options-row">
                    <CyberButton
                      v-for="mode in screensaverModes"
                      :key="mode"
                      v-bind="optionProps"
                      class="option-compact"
                      :active="preferences.screensaverMode === mode"
                      :disabled="!preferences.screensaver"
                      @click="setScreensaverMode(mode)"
                    >
                      <span class="option-label">{{ t(`settings.screensaverModes.${mode}`) }}</span>
                    </CyberButton>
                  </div>
                </template>
              </section>

              <section v-if="hasFinePointer" class="settings-section">
                <h4 class="section-title">{{ t("settings.cursor") }}</h4>
                <div class="options options-row">
                  <CyberButton
                    v-for="enabled in toggleValues"
                    :key="String(enabled)"
                    v-bind="optionProps"
                    :active="preferences.cursor === enabled"
                    @click="setCursor(enabled)"
                  >
                    <span class="option-label">{{
                      t(enabled ? "settings.on" : "settings.off")
                    }}</span>
                  </CyberButton>
                </div>

                <template v-if="hasAchievement('cat')">
                  <h5 class="subsection-title">{{ t("settings.cursorStyle") }}</h5>
                  <div class="options options-row">
                    <CyberButton
                      v-for="style in cursorStyles"
                      :key="style"
                      v-bind="optionProps"
                      :active="preferences.cursorStyle === style"
                      :disabled="!preferences.cursor"
                      @click="setCursorStyle(style)"
                    >
                      <span class="option-label">{{ t(`settings.cursorStyles.${style}`) }}</span>
                    </CyberButton>
                  </div>
                </template>
              </section>
              </div>

              <div class="settings-column settings-column--wide">
              <section class="settings-section settings-section--theme">
                <h4 class="section-title">{{ t("settings.theme") }}</h4>
                <div class="options" @mouseleave="endPreview">
                  <CyberButton
                    v-bind="optionProps"
                    :active="isRandom"
                    @mouseenter="endPreview"
                    @click="selectTheme('random')"
                  >
                    <span class="swatch swatch-random" aria-hidden="true"
                      >?</span
                    >
                    <span class="option-label">{{ t("theme.random") }}</span>
                    <span v-if="isRandom" class="option-hint">{{
                      t(`theme.${theme}`)
                    }}</span>
                  </CyberButton>
                  <CyberButton
                    v-if="hasAchievement('chameleon')"
                    v-bind="optionProps"
                    :active="preference === 'chameleon'"
                    @mouseenter="endPreview"
                    @click="selectTheme('chameleon')"
                  >
                    <span class="swatch swatch-random" aria-hidden="true">~</span>
                    <span class="option-label">{{ t("theme.chameleon") }}</span>
                    <span class="option-hint">{{
                      preference === "chameleon" ? t(`theme.${theme}`) : t("settings.secretBadge")
                    }}</span>
                  </CyberButton>
                  <CyberButton
                    v-for="name in themes"
                    :key="name"
                    v-bind="optionProps"
                    @mouseenter="previewTheme(name)"
                    :active="name === preference"
                    @click="selectTheme(name)"
                  >
                    <span class="swatch" :data-theme="name" aria-hidden="true">
                      <span class="swatch-accent" />
                      <span class="swatch-secondary" />
                    </span>
                    <span class="option-label">{{ t(`theme.${name}`) }}</span>
                  </CyberButton>
                  <CyberButton
                    v-for="name in unlockedSecretThemes"
                    :key="name"
                    v-bind="optionProps"
                    @mouseenter="previewTheme(name)"
                    class="option-secret"
                    :active="preference === name"
                    @click="selectTheme(name)"
                  >
                    <span
                      class="swatch"
                      :class="{ 'swatch-secret': name === 'overclock' }"
                      :data-theme="name === 'overclock' ? undefined : name"
                      aria-hidden="true"
                    >
                      <span class="swatch-accent" />
                      <span v-if="name !== 'overclock'" class="swatch-secondary" />
                    </span>
                    <span class="option-label">{{ t(`theme.${name}`) }}</span>
                    <span class="option-hint">{{ t("settings.secretBadge") }}</span>
                  </CyberButton>
                </div>
              </section>
              </div>

              <section class="settings-section settings-section--secrets">
                <h4 class="section-title">{{ t("settings.secrets") }}</h4>
                <p class="secrets-rank">
                  <span class="rank-label">{{ t("settings.rank") }}</span>
                  <span class="rank-value">{{ currentRank.label }}</span>
                  <span v-if="nextRank" class="rank-next">{{
                    t("settings.nextRank", { rank: nextRank.label, count: nextRank.from })
                  }}</span>
                </p>
                <p class="secrets-count">
                  {{ t("settings.secretsFound", { found: achievementCount, total: achievementIds.length }) }}
                </p>
                <div
                  class="secrets-bar"
                  role="progressbar"
                  :aria-valuenow="achievementCount"
                  aria-valuemin="0"
                  :aria-valuemax="achievementIds.length"
                  :aria-label="t('settings.secrets')"
                >
                  <span
                    v-for="item in achievements"
                    :key="item.id"
                    class="secrets-cell"
                    :class="{ filled: item.unlocked }"
                  />
                </div>
                <ul class="secrets-list">
                  <li
                    v-for="item in achievements"
                    :key="item.id"
                    :class="{ unlocked: item.unlocked }"
                  >
                    {{ item.unlocked ? t(`achievements.items.${item.id}`) : t("settings.secretLocked") }}
                  </li>
                </ul>
                <template v-if="hasAchievement('vim')">
                  <h5 class="subsection-title">{{ t("settings.vimKeys") }}</h5>
                  <div class="options options-row secrets-vim">
                    <CyberButton
                      v-for="enabled in toggleValues"
                      :key="String(enabled)"
                      v-bind="optionProps"
                      :active="preferences.vimKeys === enabled"
                      @click="setVimKeys(enabled)"
                    >
                      <span class="option-label">{{ t(enabled ? "settings.on" : "settings.off") }}</span>
                    </CyberButton>
                  </div>
                </template>
                <div class="secrets-actions">
                  <button type="button" class="secrets-link" :disabled="sharing" @click="share">
                    {{ t("settings.shareCard") }}
                  </button>
                  <button type="button" class="secrets-link" @click="download">
                    {{ t("settings.downloadCard") }}
                  </button>
                  <button v-if="allUnlocked" type="button" class="secrets-link" @click="replayFinale">
                    {{ t("settings.finale") }}
                  </button>
                </div>
              </section>
            </div>
            <div v-if="fullscreen" class="menu-footer">
              <p>{{ t("nav.authGranted") }}</p>
            </div>
          </component>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
@use "@style/_vars";
@use "@style/_mixins";

.cyber-settings {
  position: relative;
  display: flex;
}

.settings-panel {
  position: fixed;
  z-index: 1100;
  width: min(280px, calc(100vw - 2rem));
  filter: drop-shadow(0 0 12px vars.alpha(vars.$accent-color, 0.15));
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1rem 1.1rem 1.2rem;
  max-height: var(--panel-max-height, 80vh);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: vars.$accent-color transparent;
}

.settings-panel.fullscreen {
  right: 0;
  width: auto;
  height: var(--panel-max-height);
  background: vars.$bg-color;
  filter: none;

  .settings-surface {
    box-sizing: border-box;
    height: 100%;
    padding: 15px;
    display: flex;
    flex-direction: column;
  }

  .menu-header {
    padding-bottom: 5px;
    font-size: 0.8rem;
    color: vars.$accent-color;
    border-bottom: 1px solid vars.alpha(vars.$accent-color, 0.3);

    :deep(.subtitle) {
      font-size: 1.1rem;

      @media (max-width: 370px) {
        font-size: 0.9rem;
      }
    }
  }

  .settings-content {
    flex: 1;
    min-height: 0;
    max-height: none;
    padding: 1.25rem 12px 0 0;
  }

  .menu-footer {
    margin-top: 1rem;
    font-size: 0.7rem;
    opacity: 0.65;

    p {
      margin: 0;
    }
  }
}

.settings-column {
  display: contents;
}

.settings-panel:not(.fullscreen) {
  width: min(840px, calc(100vw - 2rem));

  .settings-content {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-content: start;
    gap: 1.5rem;
  }

  .settings-column--wide {
    grid-column: 1 / -1;
  }

  .settings-section--theme .options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 0.4rem 0.5rem;
  }

  .settings-column {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    min-width: 0;
  }

  .settings-section--secrets {
    grid-column: 1 / -1;
  }
}

@media (min-width: 769px) and (max-width: 1200px) {
  .settings-panel.fullscreen .settings-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    align-content: start;
    gap: 1.5rem 2rem;
    padding: 1.5rem 12px 0 0;
  }

  .settings-section--theme,
  .settings-section--secrets {
    grid-column: 1 / -1;

    .options {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  }
}

.section-title {
  margin: 0 0 0.6rem;
  font-size: 0.75rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-decoration: none;
  color: vars.$accent-color;
  // Same marker as the File.Nicknames items
  padding-left: 1rem;
  border-left: 2px solid vars.$warning-color;
}

.subsection-title {
  margin: 0.8rem 0 0.4rem;
  font-size: 0.65rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-decoration: none;
  opacity: 0.6;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  &.options-row {
    flex-direction: row;
    gap: 0.5rem;

    .option {
      flex: 1;
    }
  }
}

.option {
  :deep(.cyber-button) {
    justify-content: flex-start;
    padding: 0.45rem 0.8rem;
    font-size: 0.85rem;
    letter-spacing: 1px;
  }

  :deep(.button-content) {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .option-label {
    opacity: 0.85;
  }

  :deep(.is-active) .option-label {
    opacity: 1;
  }

  .option-hint {
    margin-left: auto;
    font-size: 0.7rem;
    opacity: 0.7;
  }
}

.option-code {
  min-width: 2.6em;
}

.option-compact :deep(.cyber-button) {
  justify-content: center;
  padding: 0.45rem 0.3rem;
}

.volume-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 12px;

  .bar {
    width: 3px;
    background: currentColor;
    opacity: 0.25;

    &:nth-child(1) {
      height: 25%;
    }
    &:nth-child(2) {
      height: 50%;
    }
    &:nth-child(3) {
      height: 75%;
    }
    &:nth-child(4) {
      height: 100%;
    }

    &.filled {
      opacity: 1;
    }
  }
}

.swatch {
  position: relative;
  display: flex;
  flex-shrink: 0;
  width: 26px;
  height: 14px;
  background: vars.$bg-color;
  border: 1px solid vars.$accent-color;

  .swatch-accent,
  .swatch-secondary {
    flex: 1;
    margin: 2px;
  }

  .swatch-accent {
    background: vars.$accent-color;
    margin-right: 1px;
  }

  .swatch-secondary {
    background: vars.$secondary-accent;
    margin-left: 1px;
  }
}

.swatch-secret .swatch-accent {
  margin: 2px;
  background: linear-gradient(90deg, #ff2bd6, #ff6a2b, #e8ff2b, #2bff7a, #2bc8ff, #ff2bd6);
  background-size: 200% 100%;
  animation: swatch-cycle 3s linear infinite;
}

@keyframes swatch-cycle {
  to {
    background-position: 200% 0;
  }
}

.swatch-random {
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  line-height: 1;
  color: vars.$accent-color;
}

.option :deep(.is-active) .swatch-random {
  color: vars.$bg-color;
  background: transparent;
}

.option :deep(.is-active) .swatch {
  border-color: vars.$bg-color;
}

.secrets-rank {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem 0.6rem;
  margin: 0 0 0.4rem;
  font-size: 0.7rem;
  letter-spacing: 1px;
  text-transform: uppercase;

  .rank-label {
    opacity: 0.7;
  }

  .rank-value {
    color: vars.$accent-color;
    font-size: 0.9rem;
    font-weight: bold;
    letter-spacing: 2px;
  }

  .rank-next {
    opacity: 0.65;
  }
}

.secrets-vim {
  max-width: 280px;
}

.secrets-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  margin-top: 0.9rem;
}

.secrets-link {
  padding: 0;
  border: none;
  font: inherit;
  font-size: 0.7rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  @include mixins.cyber-link;

  &:disabled {
    opacity: 0.5;
    cursor: wait;
  }
}

.secrets-count {
  margin: 0 0 0.5rem;
  font-size: 0.7rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.7;
}

.secrets-bar {
  display: flex;
  gap: 3px;
  height: 8px;
  margin-bottom: 0.75rem;

  .secrets-cell {
    flex: 1;
    background: vars.alpha(vars.$accent-color, 0.15);

    &.filled {
      background: vars.$accent-color;
    }
  }
}

.secrets-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.35rem 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.7rem;
  letter-spacing: 1px;
  text-transform: uppercase;

  li {
    padding-left: 0.6rem;
    border-left: 2px solid vars.alpha(vars.$text-color, 0.2);
    opacity: 0.6;

    &.unlocked {
      border-left-color: vars.$accent-color;
      color: vars.$accent-color;
      opacity: 1;
    }
  }
}

.settings-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1099;
  background: vars.$overlay-dim;
  backdrop-filter: blur(2px);
}

.settings-backdrop-enter-active,
.settings-backdrop-leave-active {
  transition: opacity 0.2s ease;
}

.settings-backdrop-enter-from,
.settings-backdrop-leave-to {
  opacity: 0;
}

.settings-panel-enter-active {
  animation: cyber-glitch-in 0.3s steps(1) forwards;
}

.settings-panel-leave-active {
  animation: cyber-glitch-out 0.25s steps(1) forwards;
}

.settings-panel-enter-from,
.settings-panel-leave-to {
  opacity: 0;
}
</style>
