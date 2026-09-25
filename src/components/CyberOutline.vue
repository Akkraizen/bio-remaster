<script setup lang="ts">
import {
  type CyberCornersConfig,
  type CyberCornerSizesConfig,
  type CyberShape,
  useCyberShape
} from "@/hook/useCyberShape";

interface Props {
  shape?: CyberShape;
  borderColor?: string;
  borderWidth?: number;
  cornerSize?: number | CyberCornerSizesConfig | [number, number, number, number];
  backgroundColor?: string;
  hoverBackgroundColor?: string;
  strokeDasharray?: string;
  corners?: CyberCornersConfig;
  cutTopLeft?: boolean;
  cutTopRight?: boolean;
  cutBottomLeft?: boolean;
  cutBottomRight?: boolean;
  topLeftCornerSize?: number;
  topRightCornerSize?: number;
  bottomLeftCornerSize?: number;
  bottomRightCornerSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  shape: "default",
  borderColor: "var(--accent-color, #c6ff33)",
  borderWidth: 2,
  cornerSize: 20,
  backgroundColor: "transparent",
  hoverBackgroundColor: "transparent",
  strokeDasharray: "",
  corners: undefined,
  cutTopLeft: undefined,
  cutTopRight: undefined,
  cutBottomLeft: undefined,
  cutBottomRight: undefined,
  topLeftCornerSize: undefined,
  topRightCornerSize: undefined,
  bottomLeftCornerSize: undefined,
  bottomRightCornerSize: undefined
});

const { containerRef, width, height, getPath, getClipPath } = useCyberShape(() => ({
  variant: props.shape,
  cornerSize: props.cornerSize,
  borderWidth: props.borderWidth,
  corners: props.corners,
  cutTopLeft: props.cutTopLeft,
  cutTopRight: props.cutTopRight,
  cutBottomLeft: props.cutBottomLeft,
  cutBottomRight: props.cutBottomRight,
  topLeftCornerSize: props.topLeftCornerSize,
  topRightCornerSize: props.topRightCornerSize,
  bottomLeftCornerSize: props.bottomLeftCornerSize,
  bottomRightCornerSize: props.bottomRightCornerSize
}));
</script>

<template>
  <div 
    class="cyber-outline-container" 
    ref="containerRef"
    :style="{ 
      '--hover-bg': hoverBackgroundColor,
      '--bg': backgroundColor 
    }"
  >
    <svg
      class="border-svg"
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        :d="getPath"
        :stroke="borderColor"
        :stroke-width="borderWidth"
        :stroke-dasharray="strokeDasharray"
        stroke-linejoin="round"
        class="outline-path"
      />
    </svg>
    <div class="outline-content" :style="{ clipPath: getClipPath }">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cyber-outline-container {
  position: relative;
  width: 100%;
  height: 100%;

  .border-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;

    .outline-path {
      transition: fill 0.3s ease;
    }
  }

  & > .border-svg > .outline-path {
    fill: var(--bg);
  }

  &:hover > .border-svg > .outline-path {
    fill: var(--hover-bg);
  }

  .outline-content {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
  }
}
</style>
