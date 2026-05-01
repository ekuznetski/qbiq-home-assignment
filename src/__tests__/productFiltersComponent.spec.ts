import { describe, expect, it } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import ProductFilters from "@/components/ProductFilters.vue";
import type { SortKey } from "@/composables/useProductFilters";
import { createTestPinia, getTestGlobal } from "./test-utils";

describe("ProductFilters component", () => {
  function renderFilters(overrides: Partial<{ query: string; categories: Set<string>; sortBy: SortKey }> = {}) {
    const pinia = createTestPinia();
    return mount(ProductFilters, {
      global: { plugins: getTestGlobal(undefined, pinia) },
      props: {
        query: overrides.query ?? "",
        categories: overrides.categories ?? new Set<string>(),
        sortBy: overrides.sortBy ?? "name-asc",
        availableCategories: ["Software", "Online Course", "Books"],
        totalCount: 5,
        filteredCount: 5,
        loading: false,
      },
    });
  }

  it("disables Reset when no filter is active and no sort is changed", () => {
    const wrapper = renderFilters();

    const reset = wrapper.findAll("button").find((b) => b.text().includes("Reset"));
    expect(reset).toBeTruthy();
    expect(reset?.attributes("disabled")).toBeDefined();
  });

  it("enables Reset once a filter or non-default sort is applied", async () => {
    const wrapper = renderFilters({ query: "alpha" });
    await flushPromises();

    const reset = wrapper.findAll("button").find((b) => b.text().includes("Reset"));
    expect(reset).toBeTruthy();
    expect(reset?.attributes("disabled")).toBeUndefined();
  });

  it("enables Reset when sortBy is non-default even without other filters", async () => {
    const wrapper = renderFilters({ sortBy: "price-desc" });
    await flushPromises();

    const reset = wrapper.findAll("button").find((b) => b.text().includes("Reset"));
    expect(reset?.attributes("disabled")).toBeUndefined();
  });

  it("emits 'reset' when Reset is clicked", async () => {
    const wrapper = renderFilters({ query: "alpha" });
    await flushPromises();

    const reset = wrapper.findAll("button").find((b) => b.text().includes("Reset"));
    await reset?.trigger("click");

    expect(wrapper.emitted("reset")).toHaveLength(1);
  });

  it("disables Reset (and other controls) while loading even if a filter is active", async () => {
    const wrapper = mount(ProductFilters, {
      global: { plugins: getTestGlobal() },
      props: {
        query: "alpha",
        categories: new Set<string>(),
        sortBy: "name-asc",
        availableCategories: ["Software"],
        totalCount: 5,
        filteredCount: 5,
        loading: true,
      },
    });
    await flushPromises();

    const reset = wrapper.findAll("button").find((b) => b.text().includes("Reset"));
    expect(reset?.attributes("disabled")).toBeDefined();
  });
});
