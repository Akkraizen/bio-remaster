<script setup lang="ts">
import CyberOutline from "@components/CyberOutline.vue";

interface Props {
  image: string;
  text: string;
  link?: string;
}

const props = defineProps<Props>();

const handleClick = () => {
  if (props.link) {
    window.location.href = props.link;
  }
};
</script>

<template>
  <div
    class="technology-container"
    @click="handleClick"
    :class="{ 'has-link': !!link }"
  >
    <div class="cyber-border-left">
      <svg width="100%" height="100%" preserveAspectRatio="none">
        <defs>
          <pattern
            id="cyber-pattern-tech"
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
        <rect width="100%" height="100%" fill="url(#cyber-pattern-tech)" />
      </svg>
    </div>
    <div class="technology-content">
      <cyber-outline
        :shape="'bottom-right'"
        :corner-size="10"
        hover-background-color="var(--accent-color, #c6ff33)"
      >
        <div class="tech-wrapper">
          <div class="image-wrapper">
            <img :src="image" :alt="text" class="tech-image" />
          </div>

          <div class="text-wrapper">
            <span class="tech-text">{{ text }}</span>
          </div>
        </div>
      </cyber-outline>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.technology-container {
  width: 125px;
  height: 40px;
  position: relative;
  cursor: default;

  &.has-link {
    cursor: pointer;
  }

  &:hover {
    .tech-text {
      color: black;
    }

    .tech-image {
      filter: grayscale(1) brightness(0);
    }
  }
}

.technology-content {
  position: absolute;
  display: flex;
  flex-direction: row;
  align-items: center;
  left: 4px;
  width: 121px;
  height: 100%;
  background: rgba(vars.$bg-color, 0.8);
  backdrop-filter: blur(5px);
}

.tech-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
}

.cyber-border-left {
  position: absolute;
  z-index: 3;
  top: 0;
  left: 0;
  bottom: 0;
  width: 10px;
  background: vars.$accent-color;
  animation: borderReveal 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  transition: background 0.3s ease;
}

.image-wrapper {
  width: 25px;
  height: 25px;
  margin-left: 10px;
  overflow: hidden;
  animation: reveal 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.tech-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.3s ease;
}

.text-wrapper {
  flex: 1;
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  animation: reveal 0.9s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.tech-text {
  color: vars.$text-color;
  font-family: "JetBrains Mono", monospace;
  font-weight: bold;
  font-size: 1rem;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
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

@keyframes borderReveal {
  from {
    height: 0;
  }
  to {
    height: 100%;
  }
}
</style>
