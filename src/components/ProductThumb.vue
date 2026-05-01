<script setup lang="ts">
type Shape = "wide" | "square" | "hero";

const SHAPE_CLASS: Record<Shape, string> = {
  wide: "aspect-3/2 w-full",
  square: "size-24",
  hero: "aspect-square w-full max-w-[560px]",
};

const props = withDefaults(
  defineProps<{
    src: string;
    alt: string;
    shape?: Shape;
  }>(),
  { shape: "wide" },
);
</script>

<template>
  <img
    :src="props.src"
    :alt="props.alt"
    :loading="props.shape === 'hero' ? 'eager' : 'lazy'"
    class="rounded-lg object-cover"
    :class="SHAPE_CLASS[props.shape]"
  />
</template>
