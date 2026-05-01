<script setup lang="ts">
import { computed } from "vue";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import MultiSelect from "primevue/multiselect";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import { ArrowUpDown, Search, X } from "lucide-vue-next";
import { SORT_OPTIONS, type SortKey } from "@/composables/useProductFilters";

const query = defineModel<string>("query", { required: true });
const categories = defineModel<Set<string>>("categories", { required: true });
const sortBy = defineModel<SortKey>("sortBy", { required: true });

const props = defineProps<{
  availableCategories: readonly string[];
  totalCount: number;
  filteredCount: number;
  loading?: boolean;
}>();

defineEmits<{ reset: [] }>();

const isFiltering = computed(() => query.value !== "" || categories.value.size > 0 || sortBy.value !== "name-asc");

const selectedCategories = computed<string[]>(() => Array.from(categories.value));
function onCategoriesChange(values: string[] | null): void {
  categories.value = new Set(values ?? []);
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="relative w-full sm:max-w-sm">
      <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-color" />
      <InputText
        v-model="query"
        :disabled="props.loading"
        placeholder="Search products"
        class="w-full pl-9"
        aria-label="Search products by name"
      />
    </div>

    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Skeleton v-if="props.loading" height="42px" border-radius="0.375rem" class="sm:flex-1" />
      <MultiSelect
        v-else-if="availableCategories.length > 0"
        :model-value="selectedCategories"
        :options="[...availableCategories]"
        display="chip"
        placeholder="Filter by category"
        aria-label="Filter by category"
        :show-toggle-all="false"
        class="min-w-0 sm:flex-1"
        @update:model-value="onCategoriesChange"
      />

      <div class="flex items-center gap-2">
        <Select
          v-model="sortBy"
          :options="SORT_OPTIONS"
          option-label="label"
          option-value="value"
          :disabled="props.loading"
          aria-label="Sort by"
          class="flex-1 sm:flex-none sm:w-52"
        >
          <template #value="slotProps">
            <span class="flex items-center gap-2">
              <ArrowUpDown class="size-3.5 text-muted-color" />
              {{ SORT_OPTIONS.find((o) => o.value === slotProps.value)?.label }}
            </span>
          </template>
        </Select>

        <Button
          :disabled="props.loading || !isFiltering"
          rounded
          variant="text"
          size="small"
          class="shrink-0"
          @click="$emit('reset')"
        >
          <span class="inline-flex items-center gap-1.5">
            <X class="size-3.5" />
            Reset
          </span>
        </Button>
      </div>
    </div>

    <p class="font-mono text-sm text-muted-color" aria-live="polite">
      Showing
      <strong class="text-color">{{ filteredCount }}</strong>
      of
      <strong class="text-color">{{ totalCount }}</strong>
      products
    </p>
  </div>
</template>
