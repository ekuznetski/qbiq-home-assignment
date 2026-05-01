import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { mount } from "@vue/test-utils";
import { fetchProducts } from "@/data/products";
import ProductList from "@/views/ProductList.vue";
import { useCatalogStore } from "@/stores/catalog";
import { createTestPinia, createTestRouter, getTestGlobal, PRODUCT_FIXTURE } from "./test-utils";

vi.mock("@/data/products", () => ({
  fetchProducts: vi.fn(),
}));

const mockFetch = vi.mocked(fetchProducts);

const routes = [
  { path: "/", name: "product-list", component: ProductList, meta: { title: "Products" } },
  { path: "/product/:id", name: "product-details", component: { template: "<div />" } },
];

describe("ProductList — URL ↔ state sync", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockFetch.mockReset();
    mockFetch.mockResolvedValue([...PRODUCT_FIXTURE]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function renderAt(initialPath = "/") {
    const pinia = createTestPinia();
    const router = createTestRouter(routes);
    await router.push(initialPath);
    await router.isReady();

    useCatalogStore().products = [...PRODUCT_FIXTURE];

    const wrapper = mount(ProductList, { global: { plugins: getTestGlobal(router, pinia) } });
    await flushPromises();
    return { wrapper, router };
  }

  it("hydrates initial state from query string on mount (cat + sort)", async () => {
    const { router } = await renderAt("/?cat=Software&sort=price-desc");
    await flushPromises();

    expect(router.currentRoute.value.query.cat).toBe("Software");
    expect(router.currentRoute.value.query.sort).toBe("price-desc");
  });

  it("writes the debounced search query into the URL when the user types", async () => {
    const { wrapper, router } = await renderAt("/");

    expect(router.currentRoute.value.query.q).toBeUndefined();

    const search = wrapper.find<HTMLInputElement>('input[aria-label="Search products by name"]');
    expect(search.exists()).toBe(true);

    await search.setValue("alpha");
    await vi.advanceTimersByTimeAsync(250);
    await flushPromises();

    expect(router.currentRoute.value.query.q).toBe("alpha");
  });

  it("syncs back when route changes externally (browser back/forward simulated)", async () => {
    const { wrapper, router } = await renderAt("/?cat=Online%20Course");
    await flushPromises();

    let visibleNames = wrapper
      .findAll("h3")
      .map((h) => h.text())
      .filter(Boolean);
    expect(visibleNames).toEqual(["Charlie"]);

    await router.push("/?cat=Software");
    await flushPromises();
    await vi.advanceTimersByTimeAsync(250);
    await flushPromises();

    visibleNames = wrapper
      .findAll("h3")
      .map((h) => h.text())
      .filter(Boolean);
    expect(visibleNames.sort()).toEqual(["Alpha", "Bravo"]);
  });

  it("avoids feedback loops: writing the same query value does not trigger a second router.replace", async () => {
    const { router } = await renderAt("/?sort=price-asc");
    await flushPromises();

    const replaceSpy = vi.spyOn(router, "replace");

    await flushPromises();
    await vi.advanceTimersByTimeAsync(250);
    await flushPromises();

    expect(replaceSpy).not.toHaveBeenCalled();
    replaceSpy.mockRestore();
  });
});
