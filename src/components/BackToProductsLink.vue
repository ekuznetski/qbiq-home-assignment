<script setup lang="ts">
import { RouterLink } from "vue-router";
import Button from "primevue/button";
import { ArrowLeft } from "lucide-vue-next";

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    variant?: "link" | "button";
    label?: string;
  }>(),
  {
    variant: "link",
    label: "Back to products",
  },
);
</script>

<template>
  <RouterLink
    v-if="variant === 'link'"
    to="/"
    v-bind="$attrs"
    class="inline-flex items-center gap-1.5 text-sm text-muted-color hover:text-color focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
  >
    <ArrowLeft class="size-3.5" aria-hidden="true" />
    {{ label }}
  </RouterLink>

  <Button v-else as-child rounded>
    <template #default="slotProps">
      <RouterLink to="/" v-bind="$attrs" :class="slotProps.class">
        <span class="inline-flex items-center gap-2">
          <ArrowLeft class="size-4" aria-hidden="true" />
          {{ label }}
        </span>
      </RouterLink>
    </template>
  </Button>
</template>
