<script setup lang="ts">
import { computed, ref } from "vue";
import { repos } from "virtual:github-repos";
import CyberLightbox from "@components/CyberLightbox.vue";
import { repoKeyOf, topLanguages } from "@/model/repo.ts";
import { formatRelativeTime } from "@/utils/relativeTime.ts";
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
import DecryptText from "@components/DecryptText.vue";
import { openExternal } from "@/utils/uiSounds.ts";
import { useTheme } from "@/hook/useTheme.ts";
import { getProjectYears } from "@/model/timeline.ts";
import { staticPages } from "@/config/seo.ts";

const route = useRoute();
const router = useRouter();
const version = useVersion();
const { locale, t } = useI18n();
const { getResponsiveShape } = useResponsive();
const { logoUrl } = useTheme();

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

const repo = computed(() => {
  const key = repoKeyOf(project.value?.source);
  return key ? repos[key] ?? null : null;
});

const languages = computed(() => (repo.value ? topLanguages(repo.value.languages) : []));

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(locale.value, { year: "numeric", month: "short", day: "numeric" });

const repoStats = computed(() => {
  if (!repo.value) return [];
  const data = repo.value;
  return [
    { key: "stars", label: t("projects.repoStars"), value: String(data.stars) },
    { key: "forks", label: t("projects.repoForks"), value: String(data.forks) },
    { key: "pushed", label: t("projects.repoPushed"), value: formatRelativeTime(data.pushedAt, locale.value), title: formatDate(data.pushedAt) },
    { key: "created", label: t("projects.repoCreated"), value: formatDate(data.createdAt) },
    ...(data.license ? [{ key: "license", label: t("projects.repoLicense"), value: data.license }] : [])
  ];
});

const gallery = computed(() => {
  if (!project.value) return [];
  const sources = [project.value.imageFull ?? project.value.image, ...(project.value.gallery ?? [])].filter(
    (src): src is string => Boolean(src)
  );
  return sources.map((src, index) => ({ src, alt: `${project.value!.name} ${index + 1}` }));
});

const lightboxIndex = ref<number | null>(null);

const projectYears = computed(() => (project.value ? getProjectYears().get(project.value.id) ?? [] : []));
const filePath = staticPages["Core.File"].path;

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
  openExternal(url, true);
};
</script>

<template>
  <div class="view" v-if="project">
    <CyberHero
      :title="`~/Core/Project/${project.name}.prjt`"
      :subtitle="`DATABASE ENTRY #${project.id} | SYSTEM VERSION ${version}`"
      variant="medium"
    />

    <CyberLightbox v-model="lightboxIndex" :images="gallery" :title="project.name" />

    <div class="detail-container">
      <div class="header-row">
        <div class="project-image-container">
          <button
            v-if="gallery.length"
            type="button"
            class="image-zoom"
            :aria-label="t('projects.openImage')"
            @click="lightboxIndex = 0"
          >
            <CyberImage
              :src="project.image || logoUrl"
              :alt="project.name"
              class="project-image"
            />
            <span class="zoom-hint" aria-hidden="true">[+] {{ t("projects.openImage") }}</span>
          </button>
          <CyberImage
            v-else
            :src="logoUrl"
            :alt="project.name"
            class="project-image"
          />
        </div>

        <section
          class="info-section"
          ref="containerRef"
          :style="{ clipPath: getClipPath, viewTransitionName: `project-${project.id}` }"
        >
          <div class="project-description-container">
            <h1><DecryptText :text="t('projects.descriptionTitle')" /></h1>
            <p class="full-description">
              {{ project.fullDescription }}
            </p>
            <p v-if="projectYears.length" class="project-years" data-cursor-group=".year-chip">
              <span class="years-label">{{ t("timeline.stagesTitle") }}:</span>
              <router-link
                v-for="year in projectYears"
                :key="year"
                :to="{ path: filePath, hash: `#timeline-${year}` }"
                class="year-chip"
              >{{ year }}</router-link>
            </p>
          </div>
        </section>
      </div>

      <CyberCard v-if="repo" :title="t('projects.repoTitle')" shape="rectangle" class="repo-card">
        <div class="repo">
          <dl class="repo-stats">
            <div v-for="stat in repoStats" :key="stat.key" class="repo-stat">
              <dt>{{ stat.label }}</dt>
              <dd :title="stat.title">{{ stat.value }}</dd>
            </div>
            <div v-if="repo.archived" class="repo-stat">
              <dt>{{ t("projects.repoStatus") }}</dt>
              <dd class="archived">{{ t("projects.repoArchived") }}</dd>
            </div>
          </dl>

          <div v-if="languages.length" class="repo-languages">
            <div class="language-bar" role="img" :aria-label="languages.map((item) => `${item.name} ${item.share}%`).join(', ')">
              <span
                v-for="(language, index) in languages"
                :key="language.name"
                class="language-segment"
                :style="{ flexGrow: language.share, '--alpha': 1 - index * 0.17 }"
              />
            </div>
            <ul class="language-legend">
              <li v-for="(language, index) in languages" :key="language.name">
                <span class="swatch" :style="{ '--alpha': 1 - index * 0.17 }" aria-hidden="true" />
                {{ language.name }} <span class="share">{{ language.share }}%</span>
              </li>
            </ul>
          </div>

          <ul v-if="repo.topics.length" class="repo-topics">
            <li v-for="topic in repo.topics" :key="topic">#{{ topic }}</li>
          </ul>

          <p class="repo-note">{{ t("projects.repoNote") }}</p>
        </div>
      </CyberCard>

      <div
        class="project-detail-content-wrapper"
        data-cursor-group=".cyber-card-container"
      >
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
            <div class="links-grid" data-cursor-group=".cyber-button-container">
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
  </div>
  <div class="view" v-else>
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
  </div>
</template>

<style scoped lang="scss">
@use "@style/vars";
@use "@style/_mixins";

.project-years {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0 0;
  font-size: 0.8rem;
}

.years-label {
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.7;
}

.year-chip {
  padding: 0.1rem 0.6rem;
  border: 1px solid vars.alpha(vars.$accent-color, 0.5);
  color: vars.$accent-color;
  font-weight: bold;
  text-decoration: none;
  transition: background 0.15s steps(3), color 0.15s steps(3);

  &:hover,
  &:focus-visible {
    background: vars.$accent-color;
    color: vars.$on-accent-color;
    outline: none;
  }
}

.image-zoom {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  cursor: zoom-in;

  .zoom-hint {
    position: absolute;
    right: 0.5rem;
    bottom: 0.6rem;
    padding: 0.15rem 0.45rem;
    background: vars.alpha(vars.$bg-color, 0.8);
    color: vars.$accent-color;
    font-size: 0.7rem;
    letter-spacing: 1px;
    text-transform: uppercase;
    opacity: 0;
    transition: opacity 0.15s steps(3);
  }

  &:hover .zoom-hint,
  &:focus-visible .zoom-hint {
    opacity: 1;
  }

  @media (hover: none) {
    .zoom-hint {
      opacity: 1;
    }
  }
}

.repo {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.repo-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.75rem 1.5rem;
  margin: 0;
}

.repo-stat {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;

  dt {
    font-size: 0.7rem;
    letter-spacing: 1px;
    text-transform: uppercase;
    opacity: 0.6;
  }

  dd {
    margin: 0;
    color: vars.$accent-color;
    font-weight: bold;
    font-size: 1.05rem;
  }

  .archived {
    color: vars.$warning-color;
  }
}

.repo-languages {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.language-bar {
  display: flex;
  gap: 2px;
  height: 10px;
}

.language-segment {
  min-width: 3px;
  background: color-mix(in srgb, #{vars.$accent-color} calc(var(--alpha) * 100%), transparent);
}

.language-legend,
.repo-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.2rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.8rem;
}

.language-legend li {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.swatch {
  width: 8px;
  height: 8px;
  background: color-mix(in srgb, #{vars.$accent-color} calc(var(--alpha) * 100%), transparent);
}

.share {
  opacity: 0.6;
}

.repo-topics {
  gap: 0.4rem;

  li {
    padding: 0.1rem 0.5rem;
    border: 1px solid vars.alpha(vars.$accent-color, 0.4);
    color: vars.$accent-color;
  }
}

.repo-note {
  margin: 0;
  font-size: 0.7rem;
  opacity: 0.5;
}

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

  @media (max-width: 1200px) {
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
