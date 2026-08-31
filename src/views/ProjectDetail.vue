<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { projects } from "@/model/project";
import technologies from "@assets/technologies";
import CyberHero from "@components/CyberHero.vue";
import CyberCard from "@components/CyberCard.vue";
import CyberButton from "@components/CyberButton.vue";
import { useVersion } from "@/hook/useVersion";
import CyberImage from "@components/CyberImage.vue";
import type { CyberShape } from "@/hook/useCyberShape";

const route = useRoute();
const router = useRouter();
const version = useVersion();

const project = computed(() => {
  return projects.find((p) => p.id === route.params.id);
});

const projectStack = computed(() => {
  if (!project.value) return [];
  return project.value.stack.map((key) => technologies[key]).filter(Boolean);
});

const hasDemo = computed(() => Boolean(project.value?.demo));
const hasSource = computed(() => Boolean(project.value?.source));

const sourceShape = computed<CyberShape>(() =>
  hasDemo.value ? "rectangle" : "top-corners"
);
const backShape = computed<CyberShape>(() =>
  hasDemo.value || hasSource.value ? "bottom-corners" : "all-corners"
);

const goBack = () => {
  router.push("/core/projects");
};

const redirect = (url: string) => {
  window.open(url, "_blank");
};
</script>

<template>
  <main class="view" v-if="project">
    <CyberHero
      :title="`~/Core/Project/${project.name}.prjt`"
      :subtitle="`DATABASE ENTRY #${project.id} | SYSTEM VERSION ${version}`"
      variant="medium"
    />

    <div class="detail-container">
      <div class="header-row">
        <div class="project-image-container">
          <CyberImage
            :src="project.image || '/logo.svg'"
            :alt="project.name"
            class="project-image"
          />
        </div>

        <section class="info-section">
          <div>
            <h1>Project.Description</h1>
            <p class="full-description">
              {{ project.fullDescription }}
            </p>
          </div>
        </section>
      </div>

      <div class="project-detail-content-wrapper">
        <div class="stack-container">
          <CyberCard title="Project.Stack">
            <div class="stack-list">
              <div
                v-for="tech in projectStack"
                :key="tech.id"
                class="tech-item"
              >
                <div class="tech-header">
                  <img :src="tech.icon" :alt="tech.name" class="tech-icon" />
                  <span class="tech-name">{{ tech.name }}</span>
                </div>
                <p class="tech-desc">{{ tech.description }}</p>
              </div>
            </div>
          </CyberCard>
        </div>

        <section class="actions-section">
          <CyberCard title="Project.Links">
            <div class="links-grid">
              <CyberButton
                v-if="project.demo"
                @click="redirect(project.demo)"
                variant="solid"
                shape="top-corners"
                :corner-size="10"
                full-width
              >
                Live Demo
              </CyberButton>
              <CyberButton
                v-if="project.source"
                @click="redirect(project.source)"
                variant="solid"
                :shape="sourceShape"
                :corner-size="10"
                full-width
              >
                Source Code
              </CyberButton>
              <CyberButton
                @click="goBack"
                variant="outline"
                :shape="backShape"
                full-width
                :corner-size="10"
              >
                Back to List
              </CyberButton>
            </div>
          </CyberCard>
        </section>
      </div>
    </div>
  </main>
  <main class="view" v-else>
    <CyberHero
      title="Error.NotFound"
      subtitle="PROJECT ENTRY NOT FOUND IN DATABASE"
      variant="medium"
    />
    <div class="detail-container">
      <CyberButton @click="goBack" variant="outline">
        Return to Projects
      </CyberButton>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use "@style/vars";
@use "@style/_mixins";

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.header-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.project-image-container {
  width: 250px;

  @media (max-width: 1024px) {
    width: 200px;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
}

@keyframes shine {
  0% {
    background-position: -100% -100%;
  }
  100% {
    background-position: 100% 100%;
  }
}

.project-image {
  width: 100%;
}

.stack-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.tech-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tech-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tech-icon {
  width: 24px;
  height: 24px;
}

.tech-name {
  font-weight: bold;
  color: vars.$accent-color;
  font-size: 0.9rem;
  @include mixins.font-mono;
}

.tech-desc {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.7;
  line-height: 1.4;
}

.project-detail-content-wrapper {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.full-description {
  margin: 0;
  line-height: 1.6;
  opacity: 0.9;
  white-space: pre-wrap;
}

.links-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  min-height: 0;

  :deep(.cyber-button-container) {
    flex: 1 1 0;
  }

  :deep(.cyber-button) {
    height: 100%;
  }
}

.info-section,
.actions-section {
  display: flex;
  flex-direction: column;
}

.actions-section {
  :deep(.card-content) {
    display: flex;
    flex-direction: column;
  }
}
</style>
