<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GlitchText from "@components/GlitchText.vue";

const progress = ref(0);
const isFinished = ref(false);
const emit = defineEmits<{ finished: [] }>();

const loadingSteps = [
  'INITIALIZING_CORE',
  'LOADING_SYSTEM_RESOURCES',
  'ESTABLISHING_SECURE_LINK',
  'DECRYPTING_DATA_VAULT',
  'FINALIZING_BOOT_SEQUENCE'
] as const;

const currentStep = ref<typeof loadingSteps[number]>(loadingSteps[0]);

onMounted(() => {
  const duration = 2500; // 2.5 seconds total
  const interval = 30;
  const increment = 100 / (duration / interval);

  const timer = setInterval(() => {
    progress.value += increment;
    
    const stepIndex = Math.floor((progress.value / 100) * loadingSteps.length);
    if (stepIndex < loadingSteps.length) {
      currentStep.value = loadingSteps[stepIndex];
    }

    if (progress.value >= 100) {
      progress.value = 100;
      clearInterval(timer);
      setTimeout(() => {
        isFinished.value = true;
        setTimeout(() => {
          emit('finished');
        }, 600);
      }, 500);
    }
  }, interval);
});
</script>

<template>
  <transition name="glitch">
    <div v-if="!isFinished" class="loading-screen">
      <div class="loader-container">
        <GlitchText text="SYSTEM.BOOT"/>
        
        <div class="progress-wrapper">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <div class="progress-details">
            <span class="step-text">{{ currentStep }}</span>
            <span class="percentage">{{ Math.floor(progress) }}%</span>
          </div>
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
  width: 400px;
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
  @include mixins.glass-effect(vars.$accent-color, 0.1);
  border: 1px solid rgba(vars.$accent-color, 0.3);
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

.terminal-decor {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  @include mixins.glass-effect(vars.$accent-color, 0.05);
  border: 1px solid rgba(vars.$accent-color, 0.1);

  .decor-corner {
    position: absolute;
    width: 15px;
    height: 15px;
    border: 2px solid vars.$accent-color;
    
    &.top-left { top: -2px; left: -2px; border-right: none; border-bottom: none; }
    &.top-right { top: -2px; right: -2px; border-left: none; border-bottom: none; }
    &.bottom-left { bottom: -2px; left: -2px; border-right: none; border-top: none; }
    &.bottom-right { bottom: -2px; right: -2px; border-left: none; border-top: none; }
  }
}

.scanline-loader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: rgba(vars.$accent-color, 0.2);
  opacity: 0.5;
  animation: scan 2s linear infinite;
}

@keyframes scan {
  from { transform: translateY(0); }
  to { transform: translateY(180px); }
}
</style>
