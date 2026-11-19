<script setup lang="ts">
import CyberOutline from "@components/CyberOutline.vue";
import { toast } from "@/utils/easterEggs.ts";
</script>

<template>
  <Teleport to="body">
    <transition name="toast">
      <div v-if="toast" :key="toast.id" class="cyber-toast" role="status">
        <CyberOutline shape="diagonal-tl-br" :corner-size="10" background-color="var(--c-bg)" hover-background-color="var(--c-bg)" :cursor-focus="false">
          <p class="toast-text">{{ toast.text }}</p>
        </CyberOutline>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.cyber-toast {
  position: fixed;
  left: 50%;
  bottom: 2rem;
  transform: translateX(-50%);
  z-index: 8500;
  max-width: calc(100vw - 32px);
}

.toast-text {
  margin: 0;
  padding: 0.75rem 1.5rem;
  color: vars.$accent-color;
  font-weight: bold;
  letter-spacing: 1px;
  text-align: center;
}

.toast-enter-active {
  animation: cyber-glitch-in 0.3s steps(1) forwards;
}

.toast-leave-active {
  animation: cyber-glitch-out 0.2s steps(1) forwards;
}
</style>
