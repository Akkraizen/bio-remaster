<script setup lang="ts">
import { computed } from "vue";
import CyberHero from "@components/CyberHero.vue";
import CyberQuote from "@components/CyberQuote.vue";
import { useVersion } from "@/hook/useVersion";
import { getQuotesForLocale } from "@/model/quote";
import { useI18n } from "@/i18n";

const version = useVersion();
const { locale, t } = useI18n();
const quotes = computed(() => getQuotesForLocale(locale.value));
</script>

<template>
  <main class="view">
    <CyberHero
      :title="t('entrypoint.title')"
      :subtitle="`${t('entrypoint.subtitle')} ${version}`"
      variant="very-large"
    />

    <section class="quotes-section">
      <div class="quotes-grid">
        <CyberQuote
          v-for="item in quotes"
          :key="item.id"
          :quote="item.quote"
          :author="item.author"
          :source="item.source"
          :responsive-shape="item.responsiveShape"
          :shape="item.shape"
          :is-warning="item.isWarning"
        />
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.view {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3rem;
}

@media (max-width: 1200px) {
  .view {
    height: 100%;
    min-height: auto;
    justify-content: start;
    gap: 2rem;
  }
}

.quotes-section {
  width: 100%;
}

.quotes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
}
</style>
