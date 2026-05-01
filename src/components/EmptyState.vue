<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 py-16 text-center">
    <span class="text-muted-color">
      <slot name="icon" />
    </span>
    <h2 class="text-xl font-medium tracking-tight">{{ title }}</h2>
    <p v-if="description" class="max-w-sm text-muted-color">{{ description }}</p>
    <div class="mt-2">
      <slot />
    </div>
  </div>
</template>
