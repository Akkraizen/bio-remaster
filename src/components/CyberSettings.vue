<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import CyberBadge from "@components/CyberBadge.vue";
import CyberOutline from "@components/CyberOutline.vue";
import CyberHero from "@components/CyberHero.vue";
import CyberButton from "@components/CyberButton.vue";
import { translations, useI18n, type Locale } from "@/i18n";
import { useTheme, type ThemePreference } from "@/hook/useTheme.ts";
import {
  usePreferences,
  type MotionMode,
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

const route = useRoute();
const { locale, setLocale, t } = useI18n();
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

const selectLocale = (value: Locale) => {
  playConfirm();
  if (value !== locale.value) setLocale(value);
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

const setMotion = (value: MotionMode) => {
  preferences.motion = value;
  playConfirm();
};

const setCursor = (enabled: boolean) => {
  preferences.cursor = enabled;
  playConfirm();
};

const selectTheme = (value: ThemePreference) => {
  if (value !== "random" && value === preference.value) {
    playConfirm();
    return;
  }
  setThemePreference(value);
  triggerGlitch("strong");
  playStatic();
  if (value === "random") playRoulette();
  else playConfirm();
};

const onClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (root.value?.contains(target) || panel.value?.contains(target)) return;
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
              <section class="settings-section">
                <h4 class="section-title">{{ t("settings.language") }}</h4>
                <div class="options options-row">
                  <CyberButton
                    v-for="code in locales"
                    :key="code"
                    v-bind="optionProps"
                    :active="code === locale"
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
              </section>

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
              </section>

              <section class="settings-section settings-section--theme">
                <h4 class="section-title">{{ t("settings.theme") }}</h4>
                <div class="options">
                  <CyberButton
                    v-bind="optionProps"
                    :active="isRandom"
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
                    v-for="name in themes"
                    :key="name"
                    v-bind="optionProps"
                    :active="name === preference"
                    @click="selectTheme(name)"
                  >
                    <span class="swatch" :data-theme="name" aria-hidden="true">
                      <span class="swatch-accent" />
                      <span class="swatch-secondary" />
                    </span>
                    <span class="option-label">{{ t(`theme.${name}`) }}</span>
                  </CyberButton>
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
    opacity: 0.5;

    p {
      margin: 0;
    }
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .settings-panel.fullscreen .settings-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    align-content: start;
    gap: 1.5rem 2rem;
    padding: 1.5rem 12px 0 0;
  }

  .settings-section--theme {
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
