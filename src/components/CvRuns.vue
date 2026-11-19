<script setup lang="ts">
import type { CvRun } from "@/model/cv.ts";

defineProps<{ runs: CvRun[] }>();

const isExternal = (href: string) => /^https?:/.test(href);
const tagOf = (run: CvRun) => (run.bold ? "strong" : run.italic ? "em" : "span");
</script>

<template>
  <template v-for="(run, index) in runs" :key="index">
    <a
      v-if="run.href"
      :href="run.href"
      :target="isExternal(run.href) ? '_blank' : undefined"
      :rel="isExternal(run.href) ? 'noopener' : undefined"
      ><component :is="tagOf(run)">{{ run.text }}</component></a
    ><component :is="tagOf(run)" v-else-if="run.bold || run.italic">{{ run.text }}</component
    ><template v-else>{{ run.text }}</template>
  </template>
</template>
