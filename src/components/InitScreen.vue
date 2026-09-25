<script setup lang="ts">
import CyberButton from "@components/CyberButton.vue";
import { playTransitionSound, soundsLoaded, preloadSounds } from "@/utils/playTransitionSound.ts";
import { ref, onMounted } from "vue";
import GlitchText from "@components/GlitchText.vue";
import { useI18n } from "@/i18n";

const isInit = ref<boolean>(false);
const emit = defineEmits<{ finished: [] }>();
const { t } = useI18n();

onMounted(() => {
  preloadSounds();
});

const init = () => {
  if (!soundsLoaded.value) return;
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
        <CyberButton
          :disabled="!soundsLoaded"
          @click="init()"
          shape="rectangle"
          variant="solid"
        >
          {{ t('init.button') }}
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
  background: rgba(vars.$accent-color, 0.2);
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
