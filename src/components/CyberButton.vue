<script setup lang="ts">
import { type CyberShape } from "@/hook/useCyberShape";
import CyberOutline from "@components/CyberOutline.vue";
import { playClickSound } from "@/utils/playTransitionSound";

interface Props {
  shape?: CyberShape;
  disabled?: boolean;
  isWarning?: boolean;
  variant?: "outline" | "solid" | "glitch";
  borderColor?: string;
  borderWidth?: number;
  cornerSize?: number;
  backgroundColor?: string;
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  shape: "default",
  borderWidth: 2,
  cornerSize: 20,
  backgroundColor: "rgba(0, 0, 0, 0)",
  disabled: false,
  isWarning: false,
  variant: "outline",
  fullWidth: false
});

const playSelectSound = () => {
  playClickSound();
};

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    playSelectSound();
    emit("click", event);
  }
};
</script>

<template>
  <div class="cyber-button-container" :class="{ 'full-width': fullWidth }">
    <cyber-outline
      :shape="shape"
      :corner-size="cornerSize"
      :border-color="isWarning ? 'var(--warning-color, #ff003c)' : borderColor"
      :border-width="borderWidth"
      :background-color="backgroundColor"
    >
      <button
        class="cyber-button"
        :class="[
          `variant-${variant}`,
          {
            'is-disabled': disabled,
            'is-warning': isWarning
          }
        ]"
        @click="handleClick"
      >
        <span class="button-content">
          <slot></slot>
        </span>
      </button>
    </cyber-outline>
  </div>
</template>

<style scoped lang="scss">
@use "@style/_vars";
@use "@style/_mixins";

.cyber-button-container {
  position: relative;
  display: flex;
  width: min-content;

  &.full-width {
    width: 100%;

    .cyber-button {
      width: 100%;
    }
  }
}

.cyber-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.5rem;
  background: transparent;
  color: vars.$accent-color;
  font-family: "JetBrains Mono", monospace;
  font-weight: bold;
  font-size: 1rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  border: none;

  .button-content {
    position: relative;
    z-index: 1;
  }

  // Common styles for all variants
  &.variant-outline {
    &:hover:not(.is-disabled):not(.is-warning) {
      background: vars.$accent-color;
      color: vars.$bg-color;
      @include mixins.neon-glow(vars.$accent-color, 20px, 0.4);
    }
  }

  &.variant-solid {
    @include mixins.glass-effect(vars.$accent-color, 0.1);

    &.is-warning {
      @include mixins.glass-effect(vars.$warning-color, 0.1);
    }

    &:hover:not(.is-disabled):not(.is-warning) {
      background: vars.$accent-color;
      color: vars.$bg-color;
      @include mixins.neon-glow(vars.$accent-color, 30px, 0.6);
    }
  }

  &.variant-glitch {
    animation: btn-pulse 2s infinite;

    &:hover:not(.is-disabled):not(.is-warning) {
      animation: none;
      background: vars.$accent-color;
      color: vars.$bg-color;
      @include mixins.neon-glow(vars.$accent-color, 25px, 1);
    }
  }

  &:active:not(.is-disabled) {
    transform: translateY(2px);
    @include mixins.neon-glow(vars.$accent-color, 10px, 0.6);

    &.is-warning {
      @include mixins.neon-glow(vars.$warning-color, 10px, 0.6);
    }
  }

  &.is-warning {
    color: vars.$warning-color;

    &.variant-outline {
      &:hover:not(.is-disabled) {
        background: vars.$warning-color;
        color: vars.$bg-color;
        @include mixins.neon-glow(vars.$warning-color, 20px, 0.4);
      }
    }

    &.variant-solid {
      &:hover:not(.is-disabled) {
        background: vars.$warning-color;
        color: vars.$bg-color;
        @include mixins.neon-glow(vars.$warning-color, 30px, 0.6);
      }
    }

    &.variant-glitch {
      &:hover:not(.is-disabled) {
        background: vars.$warning-color;
        color: vars.$bg-color;
        @include mixins.neon-glow(vars.$warning-color, 25px, 1);
      }
    }
  }

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(1);
  }
}

@keyframes btn-pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
  }
}
</style>
