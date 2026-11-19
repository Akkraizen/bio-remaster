<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import CyberOutline from "@components/CyberOutline.vue";
import type { CyberShape } from "@/hook/useCyberShape";

interface Props {
  to: string;
  label: string;
  index?: number;
  isMobile?: boolean;
  borderColor?: string;
  borderWidth?: number;
  cornerSize?: number;
  backgroundColor?: string;
}

const route = useRoute();

const props = withDefaults(defineProps<Props>(), {
  borderColor: "var(--accent-color, #c6ff33)",
  borderWidth: 2,
  cornerSize: 10,
  backgroundColor: "rgba(0, 0, 0, 0)"
});

const isActive = computed(() => route.path === props.to);

const parts = computed(() => {
  const dot = props.label.indexOf(".");
  return dot === -1
    ? { prefix: "", name: props.label }
    : { prefix: props.label.slice(0, dot + 1), name: props.label.slice(dot + 1) };
});

const number = computed(() => String((props.index ?? 0) + 1).padStart(2, "0"));

const outlineShape = computed<CyberShape>(() => {
  if (!isActive.value) return "none";
  return props.isMobile ? "bottom-right" : "diagonal-tl-br";
});
</script>

<template>
  <div class="router-link-container" :class="{ mobile: isMobile }" :style="{ '--i': index ?? 0 }">
    <CyberOutline
      v-if="isMobile"
      :shape="outlineShape"
      :border-color="borderColor"
      :border-width="borderWidth"
      :corner-size="16"
      :background-color="backgroundColor"
    >
      <router-link
        :to="to"
        class="mobile-nav-link"
        :class="{ active: isActive }"
        :aria-current="isActive ? 'page' : undefined"
      >
        <span class="link-num">{{ number }}</span>
        <span class="link-label">{{ parts.name }}</span>
        <span class="link-path">{{ parts.prefix.replace(".", "") }} // {{ to }}</span>
        <span v-if="!isActive" class="link-arrow" aria-hidden="true">→</span>
      </router-link>
    </CyberOutline>

    <CyberOutline
      v-else
      :shape="outlineShape"
      :border-color="borderColor"
      :border-width="borderWidth"
      :corner-size="cornerSize"
      :background-color="backgroundColor"
    >
      <router-link :to="to" class="nav-link" :class="{ active: isActive }">
        <span class="link-prefix">{{ parts.prefix }}</span>{{ parts.name }}
      </router-link>
    </CyberOutline>
  </div>
</template>

<style lang="scss" scoped>
@use "@style/_vars";
@use "@style/_mixins";

.router-link-container {
  position: relative;
  display: flex;
}

.nav-link {
  text-decoration: none;
  text-transform: uppercase;
  color: vars.$text-color;
  font-weight: bold;
  font-size: 0.85rem;
  padding: 0.45rem 0.75rem;
  letter-spacing: 1px;
  position: relative;
  display: block;
  white-space: nowrap;

  .link-prefix {
    opacity: 0.4;
    transition: opacity 0.15s steps(2);
  }

  &:hover {
    color: vars.$secondary-accent;

    .link-prefix {
      opacity: 0.7;
    }
  }

  &.active {
    color: vars.$accent-color;
    @include mixins.glass-effect(vars.$accent-color, 0.1);

    .link-prefix {
      opacity: 0.6;
    }
  }
}

.router-link-container.mobile {
  display: block;
  animation: nav-row-slam 0.28s steps(3) both;
  animation-delay: calc(var(--i, 0) * 60ms + 0.08s);
}

.mobile-nav-link {
  display: grid;
  grid-template-columns: 2.25rem 1fr auto;
  grid-template-rows: auto auto;
  column-gap: 0.75rem;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: 0.85rem 1rem 0.85rem 0.75rem;
  border-bottom: 1px solid vars.alpha(vars.$accent-color, 0.2);
  text-decoration: none;
  color: vars.$text-color;
  position: relative;
  overflow: hidden;
  transition: transform 0.12s steps(2), background 0.12s steps(2);

  .link-num {
    grid-row: 1 / 3;
    font-size: 0.95rem;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    color: vars.$accent-color;
    opacity: 0.7;
  }

  .link-label {
    font-size: 1.2rem;
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: 1px;
    text-transform: uppercase;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .link-path {
    grid-column: 2;
    margin-top: 0.35rem;
    font-size: 0.65rem;
    font-weight: bold;
    letter-spacing: 2px;
    text-transform: uppercase;
    opacity: 0.4;
  }

  .link-arrow {
    grid-column: 3;
    grid-row: 1 / 3;
    position: relative;
    z-index: 2;
    font-size: 1.3rem;
    font-weight: 900;
    color: vars.$accent-color;
    opacity: 0.6;
  }

  &:hover,
  &:focus-visible {
    outline: none;
    transform: translateX(4px);
    box-shadow: inset 3px 0 0 vars.$accent-color;

    .link-num,
    .link-arrow {
      opacity: 1;
    }
  }

  &.active {
    color: vars.$accent-color;
    border-bottom-color: transparent;
    @include mixins.glass-effect(vars.$accent-color, 0.08);

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      right: 0;
      width: 72px;
      height: 72px;
      @include mixins.cyberpunk-stripes(vars.$accent-color, 0.9, 5px);
      clip-path: polygon(100% 100%, 100% 0, 0 100%);
      z-index: 1;
    }

    .link-num,
    .link-path {
      opacity: 1;
    }

    .link-path {
      color: vars.$text-color;
      opacity: 0.6;
    }

  }
}

@keyframes nav-row-slam {
  0% {
    opacity: 0;
    transform: translateX(-40px);
  }
  34% {
    opacity: 1;
    transform: translateX(8px) skewX(-8deg);
  }
  67% {
    transform: translateX(-3px);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}

:root[data-motion="reduced"] {
  .router-link-container.mobile {
    animation: none;
  }
}
</style>
