<script setup lang="ts">
import CyberOutline from "@components/CyberOutline.vue";

interface Props {
  title?: string;
  isWarning?: boolean;
  borderColor?: string;
  borderWidth?: number;
  cornerSize?: number;
  backgroundColor?: string;
  shape?: "default" | "all-corners" | "bottom-corners";
}

withDefaults(defineProps<Props>(), {
  borderColor: "var(--accent-color, #c6ff33)",
  borderWidth: 2,
  cornerSize: 20,
  backgroundColor: "rgba(0, 0, 0, 0)",
  shape: "default"
});
</script>

<template>
  <div class="cyber-card-container" :class="{ 'warning-card': isWarning }">
    <CyberOutline
      :shape="shape"
      :corner-size="cornerSize"
      :border-color="isWarning ? 'var(--warning-color, #ff003c)' : borderColor"
      :border-width="borderWidth"
      :background-color="backgroundColor"
    >
      <div class="cyber-card-content-container">
        <div v-if="title || $slots.header" class="card-header">
          <slot name="header">
            <h3 :class="{ blink: isWarning }">{{ title }}</h3>
          </slot>
        </div>

        <div class="card-content">
          <slot></slot>
        </div>

        <div v-if="$slots.footer" class="card-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </CyberOutline>
  </div>
</template>

<style scoped lang="scss">
.cyber-card-container {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
}

.cyber-card-content-container {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
}

.card-header {
  h3 {
    margin: 0;
    font-size: 1.2rem;
    padding-bottom: 15px;
  }
}

.card-content {
  flex-grow: 1;
}
</style>
