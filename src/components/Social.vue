<script setup lang="ts">
import { useCyberShape } from "@/hook/useCyberShape";

const props = defineProps<{
  icon: string;
  cornerSize?: number;
  borderWidth?: number;
}>();

// @ts-ignore
const { containerRef, getPath, getClipPath } = useCyberShape(() => ({
  variant: "all-corners",
  cornerSize: props.cornerSize ?? 8,
  borderWidth: props.borderWidth ?? 2
}));
</script>

<template>
  <div ref="containerRef" class="social-square" :style="{ clipPath: getClipPath }">
    <svg class="social-border" width="100%" height="100%">
      <path :d="getPath" fill="none" stroke="currentColor" :stroke-width="borderWidth ?? 2" />
    </svg>
    <div class="social-content">
      <img :src="icon" class="social-icon" alt="social icon" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.social-square {
  position: relative;
  width: 50px;
  height: 50px;
  background: rgba(vars.$accent-color, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: vars.$accent-color;

  &:hover {
    background: vars.$accent-color;
    transform: translateY(-2px);
    color: #000;

    .social-icon {
      filter: brightness(0);
    }
  }

  .social-border {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
  }

  .social-content {
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .social-icon {
    width: 24px;
    height: 24px;
    transition: all 0.3s ease;
    object-fit: contain;
  }
}
</style>
