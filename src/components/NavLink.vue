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
  borderColor: "#c6ff33",
  borderWidth: 2,
  cornerSize: 12,
  backgroundColor: "rgba(0, 0, 0, 0)"
});

const isActive = computed(() => route.path === props.to);

const outlineShape = computed<CyberShape>(() => {
  if (!isActive.value) return "none";
  return props.isMobile ? "bottom-right" : "diagonal-tl-br";
});
</script>

<template>
  <div class="router-link-container">
    <CyberOutline
      :shape="outlineShape"
      :border-color="borderColor"
      :border-width="borderWidth"
      :corner-size="cornerSize"
      :background-color="backgroundColor"
    >
      <router-link
        :to="to"
        :class="[
          isMobile ? 'mobile-nav-link' : 'nav-link',
          { active: isActive }
        ]"
      >
        <span v-if="isMobile && index !== undefined" class="link-num">
          0{{ index + 1 }}.
        </span>
        {{ isActive ? `[${label}]` : label }}
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
  padding: 0.5rem 1rem;
  letter-spacing: 2px;
  position: relative;
  display: block;

  &:hover {
    color: vars.$secondary-accent;
  }

  &.active {
    transition: all 0.3s;
    color: vars.$accent-color;
    @include mixins.glass-effect(vars.$accent-color, 0.1);
  }
}

.mobile-nav-link {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 10px 5px;
  font-size: 1.3rem;
  text-decoration: none;
  text-transform: uppercase;
  color: vars.$text-color;
  display: flex;
  align-items: baseline;
  transition: all 0.3s;
  font-weight: 900;

  .link-num {
    font-size: 0.8rem;
    color: vars.$accent-color;
    margin-right: 5px;
    margin-left: 5px;
  }

  &:hover {
    color: vars.$secondary-accent;
  }

  &.active {
    color: vars.$accent-color;
    @include mixins.glass-effect(vars.$accent-color, 0.05);
    position: relative;
    overflow: hidden;

    &::after {
      content: "";
      position: absolute;
      bottom: -1px;
      right: 0;
      width: 80px;
      height: 80px;
      @include mixins.cyberpunk-stripes(vars.$accent-color, 1, 5px);
      clip-path: polygon(100% 100%, 100% 0, 0 100%);
      z-index: 1;
    }

    .link-num {
      color: vars.$accent-color;
    }
  }
}
</style>
