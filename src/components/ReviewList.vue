<script setup lang="ts">
import { Quote } from "lucide-vue-next";
import type { Review } from "@/types/product";

defineProps<{ reviews: Review[] }>();
</script>

<template>
  <section>
    <header class="flex items-baseline gap-2">
      <h2 class="text-xl font-medium tracking-tight">Reviews</h2>
      <span class="font-mono text-sm text-muted-color">{{ reviews.length }}</span>
    </header>

    <p v-if="reviews.length === 0" class="mt-3 text-muted-color">No reviews yet.</p>

    <ul v-else class="mt-5 space-y-3">
      <li
        v-for="(review, i) in reviews"
        :key="`${review.username}-${i}`"
        class="flex flex-col gap-2 rounded-xl border border-surface bg-surface-0 p-5 dark:bg-surface-900"
      >
        <Quote class="size-4.5 text-primary" aria-hidden="true" />
        <p class="font-semibold">{{ review.username }}</p>
        <p class="text-muted-color">{{ review.comment }}</p>
      </li>
    </ul>
  </section>
</template>
