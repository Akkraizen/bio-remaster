<script setup lang="ts">
import { useCyberShape } from "@/hook/useCyberShape";

const props = defineProps<{
  src: string;
  alt?: string;
  cornerSize?: number;
  borderWidth?: number;
}>();

// @ts-ignore
const { containerRef, getClipPath } = useCyberShape(() => ({
  variant: "cyber-image-bottom",
  cornerSize: props.cornerSize ?? 20,
  borderWidth: props.borderWidth ?? 10
}));
</script>

<template>
  <div ref="containerRef" class="cyber-image-container">
    <div class="cyber-border-left">
      <svg width="100%" height="100%" preserveAspectRatio="none">
        <defs>
          <pattern
            id="cyber-pattern"
            x="0"
            y="0"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 0 10 L 10 0 M -1 1 L 1 -1 M 9 11 L 11 9"
              stroke="black"
              stroke-width="2"
              opacity="0.3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cyber-pattern)" />
      </svg>
    </div>
    <div class="image-container">
      <img
        :src="src"
        :alt="alt"
        class="cyber-image"
        :style="{ clipPath: getClipPath }"
        fetchpriority="high"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.cyber-image-container {
  position: relative;
  width: calc(100% - 10px);
  aspect-ratio: 1 / 1;
  display: block;
  overflow: hidden;
}

.cyber-image {
  height: 100%;
  width: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  animation: reveal 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes reveal {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.cyber-border-left {
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  bottom: 0;
  width: 10px;
  background: vars.$accent-color;
  animation: borderReveal 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes borderReveal {
  from {
    height: 0;
  }
  to {
    height: 100%;
  }
}

.image-container {
  position: absolute;
  left: 10px;
  width: calc(100% - 10px);
  height: 100%;
}
</style>
