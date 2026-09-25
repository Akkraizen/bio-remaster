<script setup lang="ts">
import { computed } from "vue";
import CyberOutline from "@components/CyberOutline.vue";
import type { CyberShape, CyberCornerSizesConfig } from "@/hook/useCyberShape.ts";
import { useResponsive, type ResponsiveShapeOption } from "@/hook/useResponsive";

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

const props = withDefaults(defineProps<Props>(), {
  shape: "diagonal-tl-br",
  borderColor: "var(--accent-color, #c6ff33)",
  borderWidth: 2,
  cornerSize: 15,
  backgroundColor: "rgba(0, 0, 0, 0)",
  isWarning: false
});

const { getResponsiveShape } = useResponsive();

const effectiveShape = computed<CyberShape>(() => {
  if (props.responsiveShape) {
    return getResponsiveShape(props.responsiveShape).value;
  }
  return props.shape;
});
</script>

<template>
  <div class="cyber-quote-container" :class="{ 'warning-quote': isWarning }">
    <CyberOutline
      :shape="effectiveShape"
      :corner-size="cornerSize"
      :border-color="isWarning ? 'var(--warning-color, #ff003c)' : borderColor"
      :border-width="borderWidth"
      :background-color="backgroundColor"
    >
      <blockquote class="cyber-quote-content">
        <div class="quote-tag">
          <span class="tag-marker">//</span>
          <span class="tag-label">QUOTE.LOG</span>
        </div>

        <div class="quote-body">
          <span class="quote-symbol">“</span>
          <p class="quote-text">
            <slot>{{ quote }}</slot>
          </p>
          <span class="quote-symbol end">”</span>
        </div>

        <footer v-if="author || source || $slots.footer" class="quote-footer">
          <slot name="footer">
            <cite v-if="author" class="quote-author">
              <span class="author-prefix">—</span>
              <span class="author-name">{{ author }}</span>
            </cite>
            <span v-if="source" class="quote-source">[{{ source }}]</span>
          </slot>
        </footer>
      </blockquote>
    </CyberOutline>
  </div>
</template>

<style scoped lang="scss">
@use "@style/_vars";
@use "@style/_mixins";

.cyber-quote-container {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
}

.cyber-quote-content {
  padding: 1.5rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  @include mixins.glass-effect(vars.$accent-color, 0.05);
  transition: all 0.3s ease;

  &:hover {
    @include mixins.glass-effect(vars.$accent-color, 0.09);
  }
}

.quote-tag {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  letter-spacing: 2px;
  color: vars.$accent-color;
  margin-bottom: 0.75rem;
  opacity: 0.8;
  @include mixins.font-mono;

  .tag-marker {
    color: vars.$warning-color;
    font-weight: bold;
  }
}

.quote-body {
  position: relative;
  flex-grow: 1;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0.5rem 0;

  .quote-symbol {
    color: vars.$accent-color;
    font-size: 2rem;
    line-height: 1;
    font-family: "JetBrains Mono", monospace;
    opacity: 0.6;
    user-select: none;

    &.end {
      align-self: flex-end;
    }
  }

  .quote-text {
    flex-grow: 1;
    margin: 0;
    font-size: 1rem;
    line-height: 1.6;
    color: vars.$text-color;
    font-style: italic;
    letter-spacing: 0.5px;
  }
}

.quote-footer {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(vars.$accent-color, 0.2);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  font-size: 0.85rem;
  @include mixins.font-mono;

  .quote-author {
    font-style: normal;
    color: vars.$accent-color;
    font-weight: bold;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;

    .author-prefix {
      color: vars.$warning-color;
    }
  }

  .quote-source {
    color: rgba(vars.$text-color, 0.7);
    font-size: 0.75rem;
  }
}

.warning-quote {
  .cyber-quote-content {
    @include mixins.glass-effect(vars.$warning-color, 0.05);

    &:hover {
      @include mixins.glass-effect(vars.$warning-color, 0.09);
    }
  }

  .quote-tag,
  .quote-body .quote-symbol,
  .quote-footer .quote-author {
    color: vars.$warning-color;
  }

  .quote-footer {
    border-top-color: rgba(vars.$warning-color, 0.2);
  }
}
</style>
