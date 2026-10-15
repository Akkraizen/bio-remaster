<script setup lang="ts">
import CyberButton from "@components/CyberButton.vue";
import { soundsLoaded, preloadSounds } from "@/utils/playTransitionSound.ts";
import { ref, onMounted } from "vue";
import GlitchText from "@components/GlitchText.vue";
import { translations, useI18n, type Locale } from "@/i18n";
import { usePreferences, type MotionMode } from "@/hook/usePreferences.ts";
import { playConfirm, playTransitionSound } from "@/utils/synthSounds.ts";

const isInit = ref<boolean>(false);
const emit = defineEmits<{ finished: [] }>();
const { t, locale, setLocale } = useI18n();
const { preferences } = usePreferences();

const showSetup = !preferences.setupCompleted;
const locales = Object.keys(translations) as Locale[];
const motionModes: MotionMode[] = ["full", "reduced"];
const toggleValues = [true, false];

const optionProps = {
  variant: "solid",
  shape: "diagonal-tr-bl",
  cornerSize: 8,
  fullWidth: true,
  silent: true
} as const;

const selectLocale = (value: Locale) => {
  setLocale(value);
  playConfirm();
};

const selectSound = (enabled: boolean) => {
  preferences.soundEnabled = enabled;
  playConfirm();
};

const selectMotion = (mode: MotionMode) => {
  preferences.motion = mode;
  playConfirm();
};

onMounted(() => {
  preloadSounds();
});

const init = () => {
  if (!soundsLoaded.value) return;
  preferences.setupCompleted = true;
  emit("finished");
};
</script>

<template>
  <transition
    class="glitch"
    @before-enter="playTransitionSound()"
    @after-leave="playTransitionSound()"
  >
    <div v-if="!isInit" class="init-screen">
      <div class="init-container">
        <GlitchText :text="t('init.title')" />

        <div
          v-if="showSetup"
          class="setup"
          data-cursor-group=".cyber-button-container:not(:has(.is-disabled))"
        >
          <p class="setup-title">{{ t("init.setupTitle") }}</p>

          <div class="setup-row">
            <span class="setup-label">{{ t("settings.language") }}</span>
            <div class="setup-options">
              <CyberButton
                v-for="code in locales"
                :key="code"
                v-bind="optionProps"
                :active="locale === code"
                @click="selectLocale(code)"
              >
                {{ code.toUpperCase() }}
              </CyberButton>
            </div>
          </div>

          <div class="setup-row">
            <span class="setup-label">{{ t("settings.sound") }}</span>
            <div class="setup-options">
              <CyberButton
                v-for="enabled in toggleValues"
                :key="String(enabled)"
                v-bind="optionProps"
                :active="preferences.soundEnabled === enabled"
                @click="selectSound(enabled)"
              >
                {{ t(enabled ? "settings.on" : "settings.off") }}
              </CyberButton>
            </div>
          </div>

          <div class="setup-row">
            <span class="setup-label">{{ t("settings.motion") }}</span>
            <div class="setup-options">
              <CyberButton
                v-for="mode in motionModes"
                :key="mode"
                v-bind="optionProps"
                :active="preferences.motion === mode"
                @click="selectMotion(mode)"
              >
                {{ t(`settings.motionModes.${mode}`) }}
              </CyberButton>
            </div>
          </div>

          <p class="setup-hint">{{ t("init.setupHint") }}</p>
        </div>
        <CyberButton
          :disabled="!soundsLoaded"
          @click="init()"
          shape="rectangle"
          variant="solid"
        >
          {{ t("init.button") }}
        </CyberButton>

        <div class="terminal-decor">
          <div class="scanline-loader"></div>
          <div class="decor-corner top-left"></div>
          <div class="decor-corner top-right"></div>
          <div class="decor-corner bottom-left"></div>
          <div class="decor-corner bottom-right"></div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped lang="scss">
@use "@style/_vars";
@use "@style/_mixins";

.init-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: vars.$bg-color;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.init-container {
  position: relative;
  width: 400px;
  max-width: 90vw;
  padding: 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.setup {
  width: 100%;
  margin: 1rem 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  text-align: left;

  .setup-title {
    margin: 0;
    font-size: 0.75rem;
    letter-spacing: 2px;
    color: vars.$accent-color;
    // Same marker as the File.Nicknames items
    padding-left: 1rem;
    border-left: 2px solid vars.$warning-color;
  }

  .setup-row {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .setup-label {
    font-size: 0.65rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    opacity: 0.6;
  }

  .setup-options {
    display: flex;
    gap: 0.5rem;

    & > * {
      flex: 1;
    }

    :deep(.cyber-button) {
      padding: 0.45rem 0.6rem;
      font-size: 0.8rem;
      letter-spacing: 1px;
    }
  }

  .setup-hint {
    margin: 0;
    font-size: 0.65rem;
    opacity: 0.6;
  }
}

.terminal-decor {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  @include mixins.glass-effect(vars.$accent-color, 0.05);
  border: 1px solid vars.alpha(vars.$accent-color, 0.1);

  .decor-corner {
    position: absolute;
    width: 15px;
    height: 15px;
    border: 2px solid vars.$accent-color;

    &.top-left {
      top: -2px;
      left: -2px;
      border-right: none;
      border-bottom: none;
    }
    &.top-right {
      top: -2px;
      right: -2px;
      border-left: none;
      border-bottom: none;
    }
    &.bottom-left {
      bottom: -2px;
      left: -2px;
      border-right: none;
      border-top: none;
    }
    &.bottom-right {
      bottom: -2px;
      right: -2px;
      border-left: none;
      border-top: none;
    }
  }
}

.scanline-loader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: vars.alpha(vars.$accent-color, 0.2);
  opacity: 0.5;
  animation: scan 2s linear infinite;
}

@keyframes scan {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(180px);
  }
}
</style>
