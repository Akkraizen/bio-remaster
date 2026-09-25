<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import CyberButton from "@components/CyberButton.vue";
import CyberCard from "@components/CyberCard.vue";
import { useI18n } from "@/i18n";

import type { Project } from "@/model/project";

const props = defineProps<Project>();

const router = useRouter();
const { t } = useI18n();

const demoShape = computed(() => {
  if (props.demo && props.source) return "bottom-left";
  return "bottom-corners";
});

const sourceShape = computed(() => {
  if (props.demo && props.source) return "bottom-right";
  return "bottom-corners";
});

const redirect = (event: Event, url?: string) => {
  event.stopPropagation();
  if (url) window.location.href = url;
};

const goToDetail = () => {
  router.push({ name: "Core.ProjectDetail", params: { id: props.id } });
};
</script>

<template>
  <CyberCard class="project-item" @click="goToDetail">
    <template #header>
      <div class="project-header">
        <span class="project-id">#{{ props.id }}</span>
        <span class="status-badge">{{ t('projects.encrypted') }}</span>
      </div>
      <h3>{{ props.name }}</h3>
    </template>

    <p class="description">
      {{ props.description }}
    </p>

    <template #footer>
      <div class="project-footer">
        <CyberButton
          v-if="props.demo"
          @click="(e) => redirect(e, props.demo)"
          variant="solid"
          :corner-size="8"
          :shape="demoShape"
          full-width
        >
          {{ t('projects.demo') }}
        </CyberButton>
        <CyberButton
          v-if="props.source"
          @click="(e) => redirect(e, props.source)"
          variant="solid"
          :corner-size="8"
          :shape="sourceShape"
          full-width
        >
          {{ t('projects.source') }}
        </CyberButton>
      </div>
    </template>
  </CyberCard>
</template>

<style scoped lang="scss">
@use "@style/vars";
@use "@style/_mixins";

.project-item {
  transition: transform 0.3s, border-color 0.3s;
  height: 100%;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    & > :deep(.cyber-outline-container) > .border-svg > .outline-path {
      @include mixins.neon-glow(vars.$accent-color, 20px, 0.4);
    }
  }
}

.project-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  opacity: 0.7;
}

.status-badge {
  color: vars.$text-color;
}

.description {
  font-size: 0.9rem;
  text-transform: none;
  opacity: 0.8;
  margin-bottom: 1.5rem;
}

.project-footer {
  display: flex;
  gap: 1rem;
  width: 100%;
  justify-content: center;

  & > * {
    flex: 1 1 0;
    min-width: 0;
  }
}
</style>
