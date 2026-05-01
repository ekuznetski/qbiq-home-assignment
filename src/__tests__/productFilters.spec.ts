import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useProductFilters } from "@/composables/useProductFilters";
import type { Product } from "@/types/product";

const SEARCH_DEBOUNCE_MS = 200;

const FIXTURE: Product[] = [
  { id: "p1", name: "Vue.js Course", price: 99, category: "Online Course" } as Product,
  { id: "p2", name: "React Course", price: 49, category: "Online Course" } as Product,
  { id: "p3", name: "Graphics Suite", price: 200, category: "Software" } as Product,
  { id: "p4", name: "E-book Reader", price: 80, category: "Software" } as Product,
  { id: "p5", name: "Pixel Pencil", price: 12, category: "Books" } as Product,
];

describe("useProductFilters", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function setup() {
    const products = ref<Product[]>(FIXTURE.map((p) => ({ ...p })));
    return useProductFilters(products);
  }

  async function flushDebounce(): Promise<void> {
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS);
  }

  it("returns all products sorted by name asc by default", () => {
    const { filtered } = setup();
    expect(filtered.value.map((p) => p.id)).toEqual(["p4", "p3", "p5", "p2", "p1"]);
  });

  it("filters by case-insensitive substring search after debounce", async () => {
    const f = setup();
    f.query.value = "VUE";
    expect(f.filtered.value.map((p) => p.id)).not.toEqual(["p1"]);
    await flushDebounce();
    expect(f.filtered.value.map((p) => p.id)).toEqual(["p1"]);
  });

  it("treats whitespace-only query as empty", async () => {
    const f = setup();
    f.query.value = "   ";
    await flushDebounce();
    expect(f.filtered.value).toHaveLength(FIXTURE.length);
  });

  it("filters by a single category", () => {
    const f = setup();
    f.categories.value = new Set(["Software"]);
    expect(f.filtered.value.map((p) => p.id).sort()).toEqual(["p3", "p4"]);
  });

  it("uses OR semantics across multiple categories", () => {
    const f = setup();
    f.categories.value = new Set(["Software", "Books"]);
    expect(f.filtered.value.map((p) => p.id).sort()).toEqual(["p3", "p4", "p5"]);
  });

  it("combines search, category, and sort", async () => {
    const f = setup();
    f.query.value = "course";
    f.categories.value = new Set(["Online Course"]);
    f.sortBy.value = "price-asc";
    await flushDebounce();
    expect(f.filtered.value.map((p) => p.id)).toEqual(["p2", "p1"]);
  });

  it("sorts by name desc", () => {
    const f = setup();
    f.sortBy.value = "name-desc";
    expect(f.filtered.value.map((p) => p.id)).toEqual(["p1", "p2", "p5", "p3", "p4"]);
  });

  it("sorts by price asc", () => {
    const f = setup();
    f.sortBy.value = "price-asc";
    expect(f.filtered.value.map((p) => p.price)).toEqual([12, 49, 80, 99, 200]);
  });

  it("sorts by price desc", () => {
    const f = setup();
    f.sortBy.value = "price-desc";
    expect(f.filtered.value.map((p) => p.price)).toEqual([200, 99, 80, 49, 12]);
  });

  it("availableCategories is sorted, deduped from products", () => {
    const { availableCategories } = setup();
    expect(availableCategories.value).toEqual(["Books", "Online Course", "Software"]);
  });

  it("reset clears query, categories, and sortBy back to defaults", async () => {
    const f = setup();
    f.query.value = "vue";
    f.categories.value = new Set(["Software"]);
    f.sortBy.value = "price-desc";
    await flushDebounce();

    f.reset();
    await flushDebounce();

    expect(f.query.value).toBe("");
    expect(f.categories.value.size).toBe(0);
    expect(f.sortBy.value).toBe("name-asc");
    expect(f.filtered.value).toHaveLength(FIXTURE.length);
  });
});
