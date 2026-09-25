<script setup lang="ts">
import CyberQuote from "@components/CyberQuote.vue";
import type { CyberShape, CyberCornerSizesConfig } from "@/hook/useCyberShape.ts";
import type { ResponsiveShapeOption } from "@/hook/useResponsive";

interface Props {
  quote?: string;
  author?: string;
  source?: string;
  shape?: CyberShape;
  responsiveShape?: ResponsiveShapeOption;
  borderColor?: string;
  borderWidth?: number;
  cornerSize?: number | CyberCornerSizesConfig | [number, number, number, number];
  backgroundColor?: string;
  isWarning?: boolean;
}

defineProps<Props>();
</script>

<template>
  <CyberQuote v-bind="$props">
    <template v-if="$slots.default" #default>
      <slot></slot>
    </template>
    <template v-if="$slots.footer" #footer>
      <slot name="footer"></slot>
    </template>
  </CyberQuote>
</template>
