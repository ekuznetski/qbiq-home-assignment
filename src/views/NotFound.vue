<script setup lang="ts">
import BackToProductsLink from "@/components/BackToProductsLink.vue";
</script>

<template>
  <section class="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center">
    <div class="not-found-digits relative inline-flex select-none items-center leading-none" aria-label="404">
      <span class="not-found-digit" style="--delay: 0s">4</span>
      <span class="not-found-digit" style="--delay: 0.25s">0</span>
      <span class="not-found-digit" style="--delay: 0.5s">4</span>
    </div>

    <p class="mt-6 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary">page not found</p>
    <h1 class="mt-3 text-4xl font-medium tracking-tighter sm:text-5xl">This page wandered off</h1>
    <p class="mt-4 max-w-md text-muted-color">
      The URL you followed doesn't lead anywhere in this catalog. Let's get you back to the goods.
    </p>

    <BackToProductsLink variant="button" class="mt-8" />
  </section>
</template>

<style scoped>
.not-found-digits {
  font-size: clamp(9rem, 22vw, 18rem);
  font-weight: 500;
  letter-spacing: -0.06em;
}

.not-found-digit {
  display: inline-block;
  background: linear-gradient(
    180deg,
    color-mix(in oklch, var(--color-primary) 55%, transparent) 0%,
    color-mix(in oklch, var(--color-primary) 15%, transparent) 60%,
    transparent 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-stroke: 2px var(--color-primary);
  animation: not-found-float 3.6s ease-in-out infinite;
  animation-delay: var(--delay);
  transform-origin: center;
  will-change: transform;
}

@keyframes not-found-float {
  0%,
  100% {
    transform: translateY(5px) rotate(3deg);
    -webkit-text-stroke-color: var(--color-primary);
  }
  50% {
    transform: translateY(-5px) rotate(-3deg);
    -webkit-text-stroke-color: color-mix(in oklch, var(--color-primary) 80%, white 20%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .not-found-digit {
    animation: none;
  }
}
</style>
