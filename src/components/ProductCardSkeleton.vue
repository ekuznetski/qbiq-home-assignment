<script setup lang="ts">
import Skeleton from "primevue/skeleton";
</script>

<template>
  <div
    class="flex flex-col overflow-hidden rounded-lg border border-surface bg-surface-0 dark:bg-surface-900"
    aria-hidden="true"
  >
    <div class="aspect-3/2 w-full">
      <Skeleton height="100%" border-radius="0" />
    </div>
    <div class="flex flex-col gap-2 p-4">
      <Skeleton width="40%" height="0.75rem" />
      <Skeleton width="80%" height="1.25rem" />
      <Skeleton width="100%" height="0.875rem" />
      <Skeleton width="30%" height="1.5rem" class="mt-2" />
    </div>
  </div>
</template>
