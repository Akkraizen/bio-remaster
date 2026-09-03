<script setup lang="ts">
import { type CyberShape } from "@/hook/useCyberShape";
import CyberOutline from "@components/CyberOutline.vue";

interface Props {
  text: string;
  type?: 'status' | 'info' | 'tag';
  active?: boolean;
  shape?: CyberShape;
}

withDefaults(defineProps<Props>(), {
  shape: "default"
});
</script>

<template>
  <div class="cyber-badge" :class="[type || 'info', { active }]">
    <CyberOutline
      :shape="shape"
      :border-width="2"
      :corner-size="8"
      border-color="currentColor"
    >
      <div class="badge-content">
        <span class="dot" v-if="type === 'status'"></span>
        {{ text }}
      </div>
    </CyberOutline>
  </div>
</template>

<style scoped lang="scss">
@use "@style/_vars";
@use "@style/_mixins";

.cyber-badge {
  display: inline-block;
  font-size: 1rem;
  font-family: 'JetBrains Mono', monospace;
  font-weight: bold;
  position: relative;

  .badge-content {
    padding: 4px 10px;
    display: flex;
    align-items: center;
    @include mixins.font-mono;
  }

  &.info {
    --accent-color: #{vars.$accent-color};
    color: vars.$accent-color;
    :deep(.outline-path) {
      @include mixins.glass-effect(vars.$accent-color, 0.1);
    }
  }

  &.status {
    --accent-color: #{vars.$text-color};
    color: vars.$text-color;
    :deep(.outline-path) {
      @include mixins.glass-effect(vars.$text-color, 0.05);
    }

    .dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-right: 4px;
      background: vars.$accent-color;
      box-shadow: 0 0 5px vars.$accent-color;
    }

    &.active .dot {
      animation: pulse 1s infinite alternate;
    }
  }

  &.tag {
    --accent-color: #{vars.$secondary-accent};
    color: vars.$secondary-accent;
    :deep(.outline-path) {
      @include mixins.glass-effect(vars.$secondary-accent, 0.1);
    }
  }
}

@keyframes pulse {
  from { opacity: 0.4; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1.1); }
}
</style>
