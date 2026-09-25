<script setup lang="ts">
import CyberButton from "@components/CyberButton.vue";
import CyberBadge from "@components/CyberBadge.vue";
import CyberImage from "@components/CyberImage.vue";
import CyberOutline from "@components/CyberOutline.vue";
import Technology from "@components/Technology.vue";
import { useCyberShape } from "@/hook/useCyberShape";
import technologies from "@/assets/technologies";

const shapes = [
  "default",
  "rectangle",
  "all-corners",
  "top-corners",
  "bottom-corners",
  "left-corners",
  "right-corners",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "diagonal-tl-br",
  "diagonal-tr-bl",
  "no-top-left",
  "no-top-right",
  "no-bottom-left",
  "no-bottom-right",
  "bottom-corners-no-top",
  "top-corners-no-bottom",
  "cyber-image-bottom"
] as const;

//@ts-ignore
const { containerRef, getClipPath } = useCyberShape({
  cornerSize: 20,
  borderWidth: 2
});

const handleTestClick = (name: string) => {
  console.log(`[SYSTEM] Action triggered: ${name}`);
  alert(`Action: ${name}`);
};
</script>

<template>
  <div class="view">
    <div class="test-grid">
      <!-- Technology Section -->
      <section class="test-section full-width">
        <h2 class="section-title">File.Techologies</h2>
        <div class="tech-demo">
          <Technology
            v-for="(tech, key) in technologies"
            :key="key"
            :image="tech.icon"
            :text="tech.name"
            :link="tech.link"
          />
        </div>
      </section>
      <!-- Buttons Section -->
      <section
        class="test-section"
        ref="containerRef"
        :style="{ clipPath: getClipPath }"
      >
        <h2 class="section-title">Buttons.Modules</h2>
        <div class="component-demo">
          <CyberButton @click="handleTestClick('Initialize')"
            >Initialize</CyberButton
          >
          <CyberButton shape="bottom-corners" @click="handleTestClick('Access')"
            >Access</CyberButton
          >
          <CyberButton
            variant="glitch"
            @click="handleTestClick('Glitch Default')"
            >Glitch</CyberButton
          >
          <CyberButton disabled>Locked</CyberButton>
        </div>
      </section>

      <!-- Warning Buttons Section -->
      <section class="test-section">
        <h2 class="section-title">Security.Warnings</h2>
        <div class="component-demo">
          <CyberButton
            is-warning
            variant="outline"
            @click="handleTestClick('Outline Warning')"
            >Outline</CyberButton
          >
          <CyberButton
            is-warning
            variant="solid"
            @click="handleTestClick('Solid Warning')"
            >Solid</CyberButton
          >
          <CyberButton
            is-warning
            variant="glitch"
            @click="handleTestClick('Glitch Warning')"
            >Glitch</CyberButton
          >
        </div>
      </section>

      <!-- Badges Section -->
      <section class="test-section cyber-border">
        <h2 class="section-title">Indicators.Status</h2>
        <div class="component-demo">
          <CyberBadge text="System Active" type="status" active />
          <CyberBadge text="Encrypted" type="info" />
          <CyberBadge text="Critical Error" type="tag" />
        </div>
      </section>

      <!-- Outlines Section -->
      <section class="test-section full-width">
        <h2 class="section-title">Outlines.Variants</h2>
        <div class="outline-grid">
          <div v-for="shape in shapes" :key="shape" class="outline-item">
            <CyberOutline
              :shape="shape"
              :corner-size="15"
              background-color="rgba(198, 255, 51, 0.05)"
              hover-background-color="rgba(198, 255, 51, 0.2)"
            >
              <div class="outline-label">{{ shape }}</div>
            </CyberOutline>
          </div>
        </div>
      </section>

      <!-- Image Section -->
      <section class="test-section full-width">
        <h2 class="section-title">Visualization.Core</h2>
        <div class="image-demo">
          <CyberImage
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop"
            alt="Cyberpunk Lab"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.test-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
}

.test-section {
  background: rgba(vars.$accent-color, 0.02);
  border: 1px solid rgba(vars.$accent-color, 0.2);
  padding: 30px;
  position: relative;
  flex: 1 1 400px;

  &.full-width {
    flex: 1 1 100%;
  }

  .section-title {
    font-size: 1.2rem;
    margin-bottom: 25px;
    color: vars.$accent-color;
    border-left: 4px solid vars.$accent-color;
    padding-left: 15px;
    text-transform: uppercase;
  }
}

.component-demo {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.image-demo {
  width: 100%;
  height: 400px;
}

.tech-demo {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.outline-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.outline-item {
  width: 180px;
  height: 80px;

  .outline-label {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 0.8rem;
    text-transform: uppercase;
    color: vars.$accent-color;
  }
}
</style>
