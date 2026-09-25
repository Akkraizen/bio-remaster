<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getProjectsForLocale } from "@/model/project";
import { getTechnologiesForLocale } from "@assets/technologies";
import CyberHero from "@components/CyberHero.vue";
import CyberCard from "@components/CyberCard.vue";
import CyberButton from "@components/CyberButton.vue";
import { useVersion } from "@/hook/useVersion";
import CyberImage from "@components/CyberImage.vue";
import { type CyberShape, useCyberShape } from "@/hook/useCyberShape";
import { useResponsive } from "@/hook/useResponsive";
import { useI18n } from "@/i18n";

const route = useRoute();
const router = useRouter();
const version = useVersion();
const { locale, t } = useI18n();
const { getResponsiveShape } = useResponsive();

const calculateDescriptionCorners = getResponsiveShape({
  mobile: "top-corners",
  default: "top-right"
});

const calculateStackCorners = getResponsiveShape({
  mobile: "rectangle",
  default: "bottom-left"
});

const calculateLinksCorners = getResponsiveShape({
  mobile: "bottom-corners",
  default: "bottom-right"
});

const currentProjects = computed(() => getProjectsForLocale(locale.value));

const project = computed(() => {
  return currentProjects.value.find((p) => p.id === route.params.id);
});

const currentTechnologies = computed(() => getTechnologiesForLocale(locale.value));

const projectStack = computed(() => {
  if (!project.value) return [];
  return project.value.stack
    .map((key) => currentTechnologies.value[key])
    .filter(Boolean);
});

const hasDemo = computed(() => Boolean(project.value?.demo));
const hasSource = computed(() => Boolean(project.value?.source));

const sourceShape = computed<CyberShape>(() =>
  hasDemo.value ? "rectangle" : "top-corners"
);
const backShape = computed<CyberShape>(() =>
  hasDemo.value || hasSource.value ? "bottom-corners" : "all-corners"
);

//@ts-ignore
const { containerRef, getClipPath } = useCyberShape(() => ({
  variant: calculateDescriptionCorners.value,
  cornerSize: 20,
  borderWidth: 2
}));

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

        <section
          class="info-section"
          ref="containerRef"
          :style="{ clipPath: getClipPath }"
        >
          <div class="project-description-container">
            <h1>{{ t('projects.descriptionTitle') }}</h1>
            <p class="full-description">
              {{ project.fullDescription }}
            </p>
          </div>
        </section>
      </div>

      <div class="project-detail-content-wrapper">
        <div class="stack-container">
          <CyberCard :title="t('projects.stackTitle')" :shape="calculateStackCorners">
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
          <CyberCard :title="t('projects.linksTitle')" :shape="calculateLinksCorners">
            <div class="links-grid">
              <CyberButton
                v-if="project.demo"
                @click="redirect(project.demo)"
                variant="solid"
                shape="top-corners"
                :corner-size="10"
                full-width
              >
                {{ t('projects.liveDemo') }}
              </CyberButton>
              <CyberButton
                v-if="project.source"
                @click="redirect(project.source)"
                variant="solid"
                :shape="sourceShape"
                :corner-size="10"
                full-width
              >
                {{ t('projects.sourceCode') }}
              </CyberButton>
              <CyberButton
                @click="goBack"
                variant="outline"
                :shape="backShape"
                full-width
                :corner-size="10"
              >
                {{ t('projects.backToList') }}
              </CyberButton>
            </div>
          </CyberCard>
        </section>
      </div>
    </div>
  </main>
  <main class="view" v-else>
    <CyberHero
      :title="t('projects.notFoundTitle')"
      :subtitle="t('projects.notFoundSubtitle')"
      variant="medium"
    />
    <div class="detail-container">
      <CyberButton @click="goBack" variant="outline">
        {{ t('projects.returnToProjects') }}
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
  gap: 15px;
}

.header-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 15px;

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

.project-description-container {
  padding: 15px;
  height: 100%;
  @include mixins.glass-effect(vars.$accent-color, 0.1);
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
  gap: 15px;

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
