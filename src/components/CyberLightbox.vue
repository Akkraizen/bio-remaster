<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { lockScroll } from "@/hook/useScrollLock.ts";
import { playCloseSweep, playHoverTick, playOpenSweep } from "@/utils/synthSounds.ts";

export interface LightboxImage {
  src: string;
  alt: string;
}

const props = defineProps<{ images: LightboxImage[]; title?: string }>();
const index = defineModel<number | null>({ default: null });

const open = computed(() => index.value !== null && props.images.length > 0);
const current = computed(() => (index.value === null ? null : props.images[index.value]));
const closeButton = ref<HTMLButtonElement | null>(null);
const loaded = ref(false);
let returnFocus: HTMLElement | null = null;
let touchStart: { x: number; y: number } | null = null;

lockScroll(open);

const close = () => (index.value = null);

function go(step: number) {
  if (index.value === null || props.images.length < 2) return;
  index.value = (index.value + step + props.images.length) % props.images.length;
  playHoverTick();
}

function onKey(event: KeyboardEvent) {
  if (!open.value) return;
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    close();
  } else if (event.key === "ArrowRight") go(1);
  else if (event.key === "ArrowLeft") go(-1);
}

function onTouchStart(event: TouchEvent) {
  const touch = event.touches[0];
  touchStart = { x: touch.clientX, y: touch.clientY };
}

function onTouchEnd(event: TouchEvent) {
  if (!touchStart) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStart.x;
  const dy = touch.clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  else if (dy > 80) close();
}

watch(current, () => (loaded.value = false));

watch(open, async (value) => {
  if (value) {
    returnFocus = document.activeElement as HTMLElement | null;
    window.addEventListener("keydown", onKey, true);
    playOpenSweep();
    await nextTick();
    closeButton.value?.focus();
  } else {
    window.removeEventListener("keydown", onKey, true);
    playCloseSweep();
    returnFocus?.focus?.();
  }
});

onBeforeUnmount(() => window.removeEventListener("keydown", onKey, true));
</script>

<template>
  <Teleport to="body">
    <transition name="lightbox">
      <div
        v-if="open && current"
        class="lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="title ?? current.alt"
        @click.self="close"
        @touchstart.passive="onTouchStart"
        @touchend="onTouchEnd"
      >
        <header class="lightbox-bar">
          <span class="lightbox-title">{{ title ?? current.alt }}</span>
          <span v-if="images.length > 1" class="lightbox-counter">{{ (index ?? 0) + 1 }} / {{ images.length }}</span>
          <button ref="closeButton" type="button" class="lightbox-button" aria-label="Close" @click="close">[x]</button>
        </header>

        <figure class="lightbox-frame" @click.self="close">
          <div v-if="!loaded" class="lightbox-static" aria-hidden="true" />
          <img
            :key="current.src"
            :src="current.src"
            :alt="current.alt"
            class="lightbox-image"
            :class="{ loaded }"
            @load="loaded = true"
          />
        </figure>

        <template v-if="images.length > 1">
          <button type="button" class="lightbox-button lightbox-nav prev" aria-label="Previous" @click="go(-1)">&lt;</button>
          <button type="button" class="lightbox-button lightbox-nav next" aria-label="Next" @click="go(1)">&gt;</button>
        </template>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.lightbox {
  position: fixed;
  inset: 0;
  z-index: 8500;
  display: flex;
  flex-direction: column;
  background: vars.alpha(vars.$bg-color, 0.94);
  backdrop-filter: blur(4px);
}

.lightbox-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid vars.alpha(vars.$accent-color, 0.3);
  color: vars.$accent-color;
  font-size: 0.85rem;
  letter-spacing: 1px;
}

.lightbox-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-transform: uppercase;
}

.lightbox-counter {
  opacity: 0.7;
}

.lightbox-button {
  padding: 0.25rem 0.5rem;
  border: 1px solid transparent;
  background: transparent;
  color: vars.$accent-color;
  font: inherit;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    border-color: vars.$accent-color;
    outline: none;
  }
}

.lightbox-frame {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  margin: 0;
  padding: 1.5rem;
}

.lightbox-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border: 1px solid vars.alpha(vars.$accent-color, 0.4);
  box-shadow: 0 0 40px vars.alpha(vars.$accent-color, 0.15);
  opacity: 0;
  transform: scaleY(0.02);
  transition: opacity 0.2s ease, transform 0.3s steps(6);

  &.loaded {
    opacity: 1;
    transform: none;
  }
}

.lightbox-static {
  position: absolute;
  inset: 40% 30%;
  background: repeating-linear-gradient(0deg, vars.alpha(vars.$accent-color, 0.15) 0 2px, transparent 2px 4px);
  animation: lightbox-static 0.3s steps(3) infinite;
}

@keyframes lightbox-static {
  50% {
    transform: translateY(2px);
    opacity: 0.6;
  }
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  padding: 1rem 0.9rem;
  font-size: 1.4rem;
  font-weight: bold;
  background: vars.alpha(vars.$bg-color, 0.7);

  &.prev {
    left: 1rem;
  }

  &.next {
    right: 1rem;
  }
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.2s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .lightbox-frame {
    padding: 0.75rem;
  }

  .lightbox-nav {
    top: auto;
    bottom: 1rem;
  }
}
</style>
