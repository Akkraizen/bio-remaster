<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { cvEntries } from "virtual:cv";
import CyberHero from "@components/CyberHero.vue";
import CyberButton from "@components/CyberButton.vue";
import CyberCard from "@components/CyberCard.vue";
import CyberOutline from "@components/CyberOutline.vue";
import CyberImage from "@components/CyberImage.vue";
import GlitchText from "@components/GlitchText.vue";
import CvRuns from "@components/CvRuns.vue";
import { useI18n } from "@/i18n";
import { buildCvView } from "@/model/cvView.ts";
import { preferences } from "@/hook/usePreferences.ts";
import { playConfirm, playHoverTick } from "@/utils/synthSounds.ts";
import { track } from "@/utils/analytics.ts";

const FALLBACK_LOCALE = "ru";

const { locale, t } = useI18n();

const entry = computed(
  () =>
    cvEntries.find((item) => item.locale === locale.value) ??
    cvEntries.find((item) => item.locale === FALLBACK_LOCALE) ??
    cvEntries[0] ??
    null
);

const view = computed(() => (entry.value ? buildCvView(entry.value.document) : null));
const isFallback = computed(() => !!entry.value && entry.value.locale !== locale.value);
const fileName = computed(() => entry.value?.file.split("/").pop() ?? "");

const activeSection = ref("");
let observer: IntersectionObserver | null = null;

function observeSections() {
  observer?.disconnect();
  if (!view.value) return;
  observer = new IntersectionObserver(
    (records) => {
      const visible = records
        .filter((record) => record.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) activeSection.value = visible[0].target.id;
    },
    { rootMargin: "-20% 0px -60% 0px" }
  );
  for (const section of view.value.sections) {
    const element = document.getElementById(section.id);
    if (element) observer.observe(element);
  }
  activeSection.value ||= view.value.sections[0]?.id ?? "";
}

function jumpTo(id: string) {
  playHoverTick();
  activeSection.value = id;
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: preferences.motion === "reduced" ? "auto" : "smooth", block: "start" });
}

const print = () => window.print();

const download = () => {
  if (!entry.value) return;
  playConfirm();
  track("cv_download", { locale: entry.value.locale });
  const link = document.createElement("a");
  link.href = entry.value.file;
  link.download = `Akkraizen-CV-${entry.value.locale}.pdf`;
  link.type = "application/pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
};

function onScroll() {
  const sections = view.value?.sections;
  if (!sections?.length) return;
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4)
    activeSection.value = sections[sections.length - 1].id;
}

onMounted(() => {
  observeSections();
  window.addEventListener("scroll", onScroll, { passive: true });
});
watch(view, async () => {
  await nextTick();
  observeSections();
});
onBeforeUnmount(() => {
  observer?.disconnect();
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <div class="view cv-view">
    <CyberHero class="cv-hero" :title="t('cv.title')" :subtitle="t('cv.subtitle')" variant="medium" />

    <div v-if="entry && view" class="cv-layout" :lang="entry.locale">
      <aside class="cv-aside">
        <CyberOutline
          class="profile-card"
          shape="diagonal-tl-br"
          :corner-size="22"
          background-color="var(--c-bg)"
          hover-background-color="var(--c-bg)"
          :cursor-focus="false"
        >
          <div class="profile">
            <div class="profile-top">
              <CyberImage class="profile-avatar" src="/avatar.webp" alt="" :corner-size="16" :boardWidth="4" />
              <div class="profile-id">
                <span class="profile-label">ID // {{ fileName }}</span>
                <GlitchText class="profile-name" :text="view.name" tag="h2" variant="medium" />
              </div>
            </div>
            <p v-if="view.role" class="profile-role">{{ view.role }}</p>

            <ul class="profile-contacts" data-cursor-group=".contact-row a">
              <li v-for="(contact, index) in view.contacts" :key="index" class="contact-row">
                <span class="contact-label">{{ contact.label || t("cv.location") }}</span>
                <span class="contact-value"><CvRuns :runs="contact.runs" /></span>
              </li>
            </ul>

            <div class="profile-actions no-print" data-cursor-group=".cyber-button-container">
              <CyberButton variant="solid" shape="diagonal-tl-br" :corner-size="8" full-width @click="download">
                ↓ {{ t("cv.download") }}
              </CyberButton>
              <CyberButton shape="diagonal-tl-br" :corner-size="8" full-width @click="print">
                {{ t("cv.print") }}
              </CyberButton>
            </div>
            <p v-if="isFallback" class="profile-note no-print">{{ t("cv.fallback") }}</p>
          </div>
        </CyberOutline>

        <nav class="cv-toc no-print" :aria-label="t('cv.contents')" data-cursor-group=".toc-link">
          <p class="toc-title">{{ t("cv.contents") }}</p>
          <button
            v-for="section in view.sections"
            :key="section.id"
            type="button"
            class="toc-link"
            :class="{ active: activeSection === section.id }"
            @click="jumpTo(section.id)"
          >
            <span class="toc-index">{{ section.index }}</span>
            <span class="toc-name">{{ section.title }}</span>
          </button>
        </nav>
      </aside>

      <div class="cv-main">
        <p class="cv-terminal no-print" aria-hidden="true">
          <span class="prompt">&gt;</span> parse {{ fileName }}
          <span class="ok">[OK]</span> {{ view.sections.length }} sections<span class="caret">_</span>
        </p>

        <section v-for="section in view.sections" :id="section.id" :key="section.id" class="cv-section">
          <CyberCard shape="diagonal-tr-bl" :corner-size="18">
            <template #header>
              <h3 class="section-title">
                <span class="section-index">{{ section.index }}</span>
                <span class="section-slash">//</span>
                <span>{{ section.title }}</span>
              </h3>
            </template>

            <div class="section-body">
              <template v-for="(block, blockIndex) in section.blocks" :key="blockIndex">
                <article v-if="block.kind === 'project'" class="project">
                  <header class="project-head">
                    <div class="project-heading">
                      <h4 class="project-title">
                        {{ block.name }}
                        <span v-for="note in block.notes" :key="note" class="tag tag-note">{{ note }}</span>
                      </h4>
                      <p v-if="block.tagline" class="project-tagline">{{ block.tagline }}</p>
                    </div>
                    <div v-if="block.links.length" class="project-links" data-cursor-group="a">
                      <a
                        v-for="link in block.links"
                        :key="link.href"
                        :href="link.href"
                        target="_blank"
                        rel="noopener"
                      >{{ link.text }} ↗</a>
                    </div>
                  </header>
                  <p v-if="block.description" class="project-description">{{ block.description }}</p>
                  <div v-if="block.tags.length" class="tags">
                    <span v-for="tag in block.tags" :key="tag" class="tag">{{ tag }}</span>
                  </div>
                  <ul v-if="block.bullets.length" class="bullets">
                    <li v-for="(bullet, bulletIndex) in block.bullets" :key="bulletIndex"><CvRuns :runs="bullet" /></li>
                  </ul>
                </article>

                <dl v-else-if="block.kind === 'skills'" class="skills">
                  <div v-for="row in block.rows" :key="row.label" class="skill-row">
                    <dt>{{ row.label }}</dt>
                    <dd class="tags">
                      <span v-for="value in row.values" :key="value" class="tag">{{ value }}</span>
                    </dd>
                  </div>
                </dl>

                <ul v-else-if="block.kind === 'entries'" class="entries">
                  <li v-for="(item, itemIndex) in block.items" :key="itemIndex" class="entry">
                    <strong v-if="item.name" class="entry-name">{{ item.name }}</strong>
                    <span class="entry-text"><CvRuns :runs="item.rest" /></span>
                  </li>
                </ul>

                <div v-else-if="block.kind === 'chips'" class="tags tags-large">
                  <span v-for="chip in block.items" :key="chip" class="tag">{{ chip }}</span>
                </div>

                <h4 v-else-if="block.kind === 'subheading'" class="sub-title"><CvRuns :runs="block.runs" /></h4>

                <ul v-else-if="block.kind === 'list'" class="bullets">
                  <li v-for="(item, itemIndex) in block.items" :key="itemIndex"><CvRuns :runs="item" /></li>
                </ul>

                <p v-else class="text"><CvRuns :runs="block.runs" /></p>
              </template>
            </div>
          </CyberCard>
        </section>
      </div>
    </div>

    <p v-else class="cv-empty">{{ t("cv.empty") }}</p>
  </div>
</template>

<style scoped lang="scss">
@use "@style/_vars";
@use "@style/_mixins";

.cv-layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 2rem;
  align-items: start;
}

.cv-aside {
  position: sticky;
  top: 90px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
}

.profile-top {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-avatar {
  flex: 0 0 84px;
  width: 84px;
  height: 84px;
}

.profile-id {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.profile-label {
  font-size: 0.6rem;
  letter-spacing: 1px;
  opacity: 0.65;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-name {
  margin: 0;
  color: vars.$accent-color;
  font-size: 1.8rem;
  text-decoration: none;
}

.profile-role {
  margin: 0;
  padding: 0.5rem 0.75rem;
  border-left: 2px solid vars.$warning-color;
  background: vars.alpha(vars.$accent-color, 0.06);
  font-size: 0.85rem;
  font-weight: bold;
  line-height: 1.5;
}

.profile-contacts {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.78rem;
}

.contact-row {
  display: grid;
  grid-template-columns: 5.5rem minmax(0, 1fr);
  gap: 0.5rem;
  align-items: baseline;
}

.contact-label {
  font-size: 0.65rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.65;
}

.contact-value {
  overflow-wrap: anywhere;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  :deep(.cyber-button) {
    font-size: 0.85rem;
    white-space: nowrap;
  }
}

.profile-note {
  margin: 0;
  font-size: 0.7rem;
  color: vars.$warning-color;
}

.cv-toc {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.toc-title {
  margin: 0 0 0.5rem;
  padding-left: 0.75rem;
  border-left: 2px solid vars.$warning-color;
  font-size: 0.7rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  opacity: 0.75;
}

.toc-link {
  display: flex;
  gap: 0.75rem;
  padding: 0.4rem 0.75rem;
  border: none;
  border-left: 2px solid vars.alpha(vars.$accent-color, 0.15);
  background: none;
  color: vars.$text-color;
  font: inherit;
  font-size: 0.8rem;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition:
    background 0.15s steps(3),
    border-color 0.15s steps(3);

  .toc-index {
    color: vars.$accent-color;
    opacity: 0.6;
  }

  &:hover {
    background: vars.alpha(vars.$accent-color, 0.08);
  }

  &.active {
    border-left-color: vars.$accent-color;
    background: vars.alpha(vars.$accent-color, 0.12);
    color: vars.$accent-color;

    .toc-index {
      opacity: 1;
    }
  }
}

.cv-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
}

.cv-terminal {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.85;

  .prompt,
  .ok,
  .caret {
    color: vars.$accent-color;
    font-weight: bold;
  }

  .caret {
    animation: caret-blink 1s steps(2) infinite;
  }
}

.cv-section {
  scroll-margin-top: 90px;
}

.section-title {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.6rem;
  margin: 0;
  font-size: 1.05rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-decoration: none;

  .section-index {
    color: vars.$accent-color;
  }

  .section-slash {
    color: vars.$warning-color;
  }
}

.section-body {
  margin-top: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.text {
  margin: 0;
  line-height: 1.7;
}

.sub-title {
  margin: 0.5rem 0 -0.25rem;
  padding-left: 0.75rem;
  border-left: 2px solid vars.$warning-color;
  font-size: 0.8rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-decoration: none;
  opacity: 0.85;
}

.project {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-left: 2px solid vars.$accent-color;
  background: linear-gradient(90deg, vars.alpha(vars.$accent-color, 0.07), transparent 70%);
  break-inside: avoid;
}

.project-head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem 1rem;
}

.project-heading {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.project-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem 0.6rem;
  margin: 0;
  color: vars.$accent-color;
  font-size: 1.15rem;
  line-height: 1.3;
  letter-spacing: 1px;
  text-decoration: none;

  .tag {
    font-size: 0.65rem;
    font-weight: normal;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
}

.project-tagline {
  margin: 0;
  font-size: 0.85rem;
  font-weight: bold;
}

.project-description {
  margin: 0;
  padding-left: 0.75rem;
  border-left: 1px dashed vars.alpha(vars.$accent-color, 0.4);
  font-size: 0.85rem;
  font-style: italic;
  line-height: 1.6;
  opacity: 0.8;
}

.project-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  font-size: 0.75rem;

  a {
    @include mixins.cyber-link;
  }
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0;
}

.tag {
  padding: 0.15rem 0.55rem;
  border: 1px solid vars.alpha(vars.$accent-color, 0.4);
  background: vars.alpha(vars.$accent-color, 0.05);
  font-size: 0.7rem;
  letter-spacing: 0.5px;
}

.tag-note {
  border-color: vars.alpha(vars.$warning-color, 0.6);
  color: vars.$warning-color;
}

.tags-large .tag {
  padding: 0.35rem 0.8rem;
  font-size: 0.8rem;
}

.bullets {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    position: relative;
    padding-left: 1.1rem;
    line-height: 1.6;
    font-size: 0.9rem;
    break-inside: avoid;

    &::before {
      content: ">";
      position: absolute;
      left: 0;
      color: vars.$accent-color;
      font-weight: bold;
    }
  }
}

.skills {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
}

.skill-row {
  display: grid;
  grid-template-columns: 11rem minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
  padding-bottom: 0.75rem;
  border-bottom: 1px dashed vars.alpha(vars.$accent-color, 0.15);

  &:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }

  dt {
    padding-top: 0.15rem;
    color: vars.$accent-color;
    font-size: 0.75rem;
    font-weight: bold;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
}

.entries {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.entry {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.75rem 0.9rem;
  border: 1px solid vars.alpha(vars.$accent-color, 0.2);
  background: vars.alpha(vars.$accent-color, 0.03);
  font-size: 0.82rem;
  line-height: 1.55;
  break-inside: avoid;
}

.entry-name {
  color: vars.$accent-color;
  letter-spacing: 1px;
}

.cv-view :deep(strong) {
  color: vars.$accent-color;
}

.cv-empty {
  margin: 0;
  color: vars.$warning-color;
}

@keyframes caret-blink {
  50% {
    opacity: 0;
  }
}

@media (max-width: 1000px) {
  .cv-layout {
    grid-template-columns: 1fr;
  }

  .cv-aside {
    position: static;
  }

  .cv-toc {
    display: none;
  }
}

@media (max-width: 600px) {
  .skill-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .contact-row {
    grid-template-columns: 4.5rem minmax(0, 1fr);
  }
}

@media print {
  .no-print,
  .cv-hero,
  .profile-avatar,
  .profile-label {
    display: none !important;
  }

  .cv-layout {
    display: block;
    color: #000;
    font-size: 10pt;
  }

  .cv-aside {
    position: static;
    margin-bottom: 1rem;
  }

  .cv-view :deep(.border-svg) {
    display: none;
  }

  .profile,
  .cv-view :deep(.cyber-card-content-container) {
    padding: 0;
  }

  .cv-main {
    gap: 1rem;
  }

  .profile-name,
  .project-title,
  .section-index,
  .skill-row dt,
  .entry-name,
  .bullets li::before,
  .cv-view :deep(strong) {
    color: #000 !important;
  }

  .profile-role,
  .project {
    background: none;
  }

  .tag,
  .entry {
    border-color: #999;
    background: none;
    color: #000;
  }

  .cv-view :deep(a) {
    color: #000 !important;
    background: none !important;
    text-decoration: underline;
  }
}
</style>
