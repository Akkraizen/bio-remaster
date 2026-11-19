<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from "vue";
import GlitchText from "@components/GlitchText.vue";
import {
  playProgressBarSound,
  stopProgressBarSound
} from "@/utils/playTransitionSound.ts";
import { playTransitionSound, playTypeTick } from "@/utils/synthSounds.ts";
import { useI18n, translations } from "@/i18n";
import { useVersion } from "@/hook/useVersion";
import { createBootLog } from "@/utils/bootLog.ts";

const { locale, t } = useI18n();
const progress = ref(0);
const isFinished = ref(false);
const emit = defineEmits<{ finished: [] }>();

const loadingSteps = computed(() => translations[locale.value].boot.steps);

const currentStepIndex = ref(0);
const currentStep = computed(() => loadingSteps.value[currentStepIndex.value] || loadingSteps.value[0]);
let timer: ReturnType<typeof setInterval> | null = null;

const bootLog = createBootLog(useVersion());
const logElement = ref<HTMLElement | null>(null);
const visibleLines = computed(() =>
  bootLog.slice(0, Math.min(bootLog.length, Math.ceil((progress.value / 92) * bootLog.length)))
);

watch(
  () => visibleLines.value.length,
  async () => {
    playTypeTick();
    await nextTick();
    if (logElement.value) logElement.value.scrollTop = logElement.value.scrollHeight;
  }
);

onMounted(() => {
  const duration = 3200;
  const interval = 30;
  const increment = 100 / (duration / interval);

  playProgressBarSound();

  timer = setInterval(() => {
    progress.value += increment;

    const stepIndex = Math.floor((progress.value / 100) * loadingSteps.value.length);
    if (stepIndex < loadingSteps.value.length) {
      currentStepIndex.value = stepIndex;
    }

    if (progress.value >= 100) {
      progress.value = 100;
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      setTimeout(() => {
        isFinished.value = true;
        setTimeout(() => {
          stopProgressBarSound();
          playTransitionSound();
          emit("finished");
        }, 600);
      }, 500);
    }
  }, interval);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
  stopProgressBarSound();
});
</script>

<template>
  <transition
    name="glitch"
    @before-enter="playTransitionSound()"
    @after-leave="playTransitionSound()"
  >
    <div v-if="!isFinished" class="loading-screen">
      <div class="loader-container">
        <GlitchText :text="t('boot.title')"/>
        
        <div class="progress-wrapper">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <div class="progress-details">
            <span class="step-text">{{ currentStep }}</span>
            <span class="percentage">{{ Math.floor(progress) }}%</span>
          </div>
        </div>

        <div ref="logElement" class="boot-log" aria-hidden="true">
          <p v-for="(line, index) in visibleLines" :key="index" class="boot-line" :class="line.status">
            <span v-if="line.status === 'ok'" class="tag">[  OK  ]</span>
            <span v-else-if="line.status === 'warn'" class="tag">[ WARN ]</span>
            {{ line.text }}
          </p>
        </div>

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

.loading-screen {
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

.loader-container {
  position: relative;
  width: 640px;
  max-width: 90vw;
  padding: 40px;
  text-align: center;
}

.progress-wrapper {
  position: relative;
  margin-top: 2rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: repeating-linear-gradient(
    to right,
    vars.alpha(vars.$accent-color, 0.2) 0 calc(100% / 24 - 3px),
    transparent calc(100% / 24 - 3px) calc(100% / 24)
  );
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: vars.$accent-color;
  @include mixins.neon-glow(vars.$accent-color, 15px, 0.6);
  transition: width 0.1s linear;
}

.progress-details {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  @include mixins.font-mono;
  font-size: 0.7rem;
  color: vars.$accent-color;
  letter-spacing: 1px;
}

.boot-log {
  margin-top: 1.5rem;
  height: 11rem;
  overflow: hidden;
  text-align: left;
  @include mixins.font-mono;
  font-size: 0.7rem;
  line-height: 1.55;
  color: vars.alpha(vars.$text-color, 0.75);
  mask-image: linear-gradient(to bottom, transparent, black 30%);
}

.boot-line {
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .tag {
    white-space: pre;
  }

  &.kernel {
    opacity: 0.6;
  }

  &.ok .tag {
    color: vars.$accent-color;
  }

  &.warn .tag {
    color: vars.$warning-color;
  }
}

@media (max-width: 600px) {
  .loader-container {
    padding: 24px;
  }

  .boot-log {
    font-size: 0.6rem;
    height: 9rem;
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
