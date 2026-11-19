<script setup lang="ts">
import { computed } from "vue";
import CyberHero from "@components/CyberHero.vue";
import CyberCard from "@components/CyberCard.vue";
import CyberBadge from "@components/CyberBadge.vue";
import CountUp from "@components/CountUp.vue";
import ContributionHeatmap from "@components/ContributionHeatmap.vue";
import { useVersion } from "@/hook/useVersion";
import { useResponsive } from "@/hook/useResponsive";
import { profiles, useLiveStats } from "@/hook/useLiveStats.ts";
import { getHobbiesForLocale } from "@/model/hobbies.ts";
import { useI18n } from "@/i18n";
import { openExternal } from "@/utils/uiSounds.ts";
import { formatRelativeTime } from "@/utils/relativeTime.ts";

const version = useVersion();
const { locale, t } = useI18n();
const { getResponsiveShape } = useResponsive();
const stats = useLiveStats();

const hobbies = computed(() => getHobbiesForLocale(locale.value));

const githubShape = getResponsiveShape({ mobile: "top-corners", default: "top-left" });
const feedShape = getResponsiveShape({ mobile: "rectangle", default: "top-right" });
const chessShape = getResponsiveShape({ mobile: "rectangle", default: "bottom-left" });
const codeforcesShape = getResponsiveShape({ mobile: "rectangle", default: "bottom-right" });
const hobbiesShape = getResponsiveShape({ mobile: "bottom-corners", default: "rectangle" });

const relativeTime = computed(() => (date: string) => formatRelativeTime(date, locale.value));

const record = computed(() => {
  const value = stats.chess.data?.chessRecord;
  return value ? `${value.win} / ${value.loss} / ${value.draw}` : "--";
});

const repoName = (fullName: string) => fullName.split("/")[1] ?? fullName;
</script>

<template>
  <div class="view">
    <CyberHero
      :title="t('activity.title')"
      :subtitle="t('activity.subtitle', { version })"
      variant="medium"
    />

    <div class="activity-grid">
      <section class="github-section">
        <CyberCard :title="t('activity.githubTitle')" :shape="githubShape">
          <p v-if="stats.github.status === 'loading'" class="status blink">{{ t("activity.loading") }}</p>
          <p v-else-if="stats.github.status === 'error'" class="status error">{{ t("activity.offline") }}</p>
          <template v-else-if="stats.github.data">
            <div class="counters">
              <div class="counter">
                <span class="value"><CountUp :value="stats.github.data.repos" /></span>
                <span class="label">{{ t("activity.repos") }}</span>
              </div>
              <div class="counter">
                <span class="value"><CountUp :value="stats.github.data.stars" /></span>
                <span class="label">{{ t("activity.stars") }}</span>
              </div>
              <div class="counter">
                <span class="value"><CountUp :value="stats.github.data.followers" /></span>
                <span class="label">{{ t("activity.followers") }}</span>
              </div>
            </div>
            <h4 class="subtitle">{{ t("activity.languages") }}</h4>
            <div class="badges" data-cursor-group=".cyber-badge">
              <CyberBadge v-for="language in stats.github.data.languages" :key="language" :text="language" shape="rectangle" type="tag" />
            </div>
          </template>
          <template #footer>
            <a class="profile-link" :href="`https://github.com/${profiles.github}`" target="_blank" rel="noopener">
              &gt; {{ t("activity.open") }}
            </a>
          </template>
        </CyberCard>
      </section>

      <section class="feed-section">
        <CyberCard :title="t('activity.feedTitle')" :shape="feedShape">
          <p v-if="stats.github.status === 'loading'" class="status blink">{{ t("activity.loading") }}</p>
          <p v-else-if="stats.github.status === 'error' || !stats.github.data?.events.length" class="status error">
            {{ t("activity.offline") }}
          </p>
          <ul v-else class="feed" data-cursor-group=".feed-item a">
            <li v-for="event in stats.github.data.events" :key="event.id" class="feed-item">
              <span class="feed-time">{{ relativeTime(event.date) }}</span>
              <span class="feed-text">
                {{ t(`activity.${event.kind}`) }}
                <a :href="`https://github.com/${event.repo}`" target="_blank" rel="noopener">{{ repoName(event.repo) }}</a>
              </span>
            </li>
          </ul>
        </CyberCard>
      </section>

      <section class="heatmap-section">
        <CyberCard :title="t('activity.heatmapTitle')" shape="rectangle">
          <p v-if="stats.contributions.status === 'loading'" class="status blink">{{ t("activity.loading") }}</p>
          <p v-else-if="stats.contributions.status === 'error'" class="status error">{{ t("activity.offline") }}</p>
          <ContributionHeatmap v-else-if="stats.contributions.data" :data="stats.contributions.data" />
        </CyberCard>
      </section>

      <section class="chess-section">
        <CyberCard :title="t('activity.chessTitle')" :shape="chessShape">
          <p v-if="stats.chess.status === 'loading'" class="status blink">{{ t("activity.loading") }}</p>
          <p v-else-if="stats.chess.status === 'error'" class="status error">{{ t("activity.offline") }}</p>
          <div v-else-if="stats.chess.data" class="chess-grid" data-cursor-group=".rating-block">
            <button class="rating-block" type="button" @click="openExternal(`https://lichess.org/@/${profiles.lichess}`, true)">
              <span class="source">Lichess</span>
              <span class="value">
                <CountUp v-if="stats.chess.data.lichessBlitz" :value="stats.chess.data.lichessBlitz" />
                <template v-else>--</template>
              </span>
              <span class="label">{{ t("activity.blitz") }} · {{ t("activity.games") }}: {{ stats.chess.data.lichessGames ?? "--" }}</span>
            </button>
            <button class="rating-block" type="button" @click="openExternal(`https://www.chess.com/member/${profiles.chessdotcom}`, true)">
              <span class="source">Chess.com</span>
              <span class="value">
                <CountUp v-if="stats.chess.data.chessBlitz" :value="stats.chess.data.chessBlitz" />
                <template v-else>--</template>
              </span>
              <span class="label">
                {{ t("activity.blitz") }} · {{ t("activity.best") }}: {{ stats.chess.data.chessBest ?? "--" }}
              </span>
              <span class="label">
                {{ t("activity.record") }}: {{ record }} · {{ t("activity.tactics") }}: {{ stats.chess.data.chessTactics ?? "--" }}
              </span>
            </button>
          </div>
        </CyberCard>
      </section>

      <section class="codeforces-section">
        <CyberCard :title="t('activity.codeforcesTitle')" :shape="codeforcesShape">
          <p v-if="stats.codeforces.status === 'loading'" class="status blink">{{ t("activity.loading") }}</p>
          <p v-else-if="stats.codeforces.status === 'error'" class="status error">{{ t("activity.offline") }}</p>
          <button
            v-else-if="stats.codeforces.data"
            class="rating-block"
            type="button"
            @click="openExternal(`https://codeforces.com/profile/${profiles.codeforces}`, true)"
          >
            <span class="source">{{ profiles.codeforces }}</span>
            <span class="value">
              <CountUp v-if="stats.codeforces.data.rating" :value="stats.codeforces.data.rating" />
              <template v-else>{{ t("activity.unrated") }}</template>
            </span>
            <span v-if="stats.codeforces.data.rank" class="label">
              {{ t("activity.rank") }}: {{ stats.codeforces.data.rank }} · {{ t("activity.maxRating") }}:
              {{ stats.codeforces.data.maxRating }}
            </span>
          </button>
        </CyberCard>
      </section>

      <section class="hobbies-section">
        <CyberCard :title="t('activity.hobbiesTitle')" :shape="hobbiesShape">
          <ul class="hobbies" data-cursor-group=".hobby.has-link">
            <li v-for="hobby in hobbies" :key="hobby.id">
              <component
                :is="hobby.link ? 'a' : 'div'"
                class="hobby"
                :class="{ 'has-link': hobby.link }"
                :href="hobby.link"
                :target="hobby.link ? '_blank' : undefined"
                :rel="hobby.link ? 'noopener' : undefined"
              >
                <span class="glyph" aria-hidden="true">{{ hobby.glyph }}</span>
                <span class="hobby-title">{{ hobby.title }}</span>
                <span class="hobby-text">{{ hobby.text }}</span>
              </component>
            </li>
          </ul>
        </CyberCard>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@style/_vars";
@use "@style/_mixins";

.view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}

.activity-grid > section {
  min-width: 0;
}

.hobbies-section,
.heatmap-section {
  grid-column: 1 / -1;
}

.status {
  margin: 0;
  color: vars.$accent-color;

  &.error {
    color: vars.$warning-color;
  }

  &.blink {
    animation: status-blink 1s steps(2) infinite;
  }
}

@keyframes status-blink {
  50% {
    opacity: 0.3;
  }
}

.counters {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.counter,
.rating-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.value {
  font-size: 2.2rem;
  font-weight: bold;
  color: vars.$accent-color;
  line-height: 1.1;
}

.label {
  font-size: 0.75rem;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.subtitle {
  margin: 1.5rem 0 0.75rem;
  font-size: 0.8rem;
  opacity: 0.6;
  text-transform: uppercase;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  :deep(.cyber-badge) {
    font-size: 0.75rem;
  }
}

.profile-link {
  @include mixins.cyber-link;
  display: inline-block;
  margin-top: 1rem;
  font-size: 0.85rem;
}

.feed {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feed-item {
  display: grid;
  grid-template-columns: 8.5rem 1fr;
  gap: 1rem;
  font-size: 0.9rem;

  a {
    @include mixins.cyber-link;
  }
}

.feed-time {
  opacity: 0.65;
}

.chess-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}

.rating-block {
  background: transparent;
  border: none;
  padding: 0;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;

  .source {
    font-size: 0.8rem;
    letter-spacing: 1px;
  }

  &:hover .value {
    text-shadow: 0 0 12px vars.alpha(vars.$accent-color, 0.6);
  }
}

.hobbies {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.hobby {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  height: 100%;
  box-sizing: border-box;
  padding: 1rem;
  border: 1px solid vars.alpha(vars.$accent-color, 0.25);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.2s ease, background 0.2s ease;

  &.has-link:hover {
    border-color: vars.$accent-color;
    background: vars.alpha(vars.$accent-color, 0.06);
  }
}

.glyph {
  font-size: 1.6rem;
  color: vars.$accent-color;
  line-height: 1.2;
}

.hobby-title {
  font-weight: bold;
  letter-spacing: 1px;
}

.hobby-text {
  font-size: 0.85rem;
  opacity: 0.75;
  line-height: 1.5;
}

@media (max-width: 900px) {
  .activity-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 500px) {
  .chess-grid,
  .feed-item {
    grid-template-columns: 1fr;
  }

  .feed-item {
    gap: 0.1rem;
  }

  .value {
    font-size: 1.8rem;
  }
}
</style>
