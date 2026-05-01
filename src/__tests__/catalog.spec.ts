import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCatalogStore } from "@/stores/catalog";
import { fetchProducts } from "@/data/products";
import { createTestPinia, PRODUCT_FIXTURE } from "./test-utils";

vi.mock("@/data/products", () => ({
  fetchProducts: vi.fn(),
}));

const mockFetch = vi.mocked(fetchProducts);

describe("catalog store", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    createTestPinia();
  });

  it("populates products and clears loading on success", async () => {
    mockFetch.mockResolvedValue([...PRODUCT_FIXTURE]);
    const catalog = useCatalogStore();

    expect(catalog.loading).toBe(false);
    expect(catalog.products).toEqual([]);

    const promise = catalog.load();
    expect(catalog.loading).toBe(true);

    await promise;

    expect(catalog.loading).toBe(false);
    expect(catalog.error).toBeNull();
    expect(catalog.products).toHaveLength(PRODUCT_FIXTURE.length);
    expect(catalog.products[0]?.id).toBe("p1");
  });

  it("captures the error message and resets products on failure", async () => {
    mockFetch.mockRejectedValue(new Error("network down"));
    const catalog = useCatalogStore();

    await catalog.load();

    expect(catalog.loading).toBe(false);
    expect(catalog.products).toEqual([]);
    expect(catalog.error).toBe("network down");
  });

  it("falls back to a generic message when the rejection is not an Error", async () => {
    mockFetch.mockRejectedValue("opaque-string-rejection");
    const catalog = useCatalogStore();

    await catalog.load();

    expect(catalog.error).toBe("Failed to load products");
  });

  it("ignores concurrent calls while loading is in flight (idempotent guard)", async () => {
    let resolveFetch: (value: typeof PRODUCT_FIXTURE) => void = () => {};
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );
    const catalog = useCatalogStore();

    const first = catalog.load();
    const second = catalog.load();
    const third = catalog.load();

    expect(mockFetch).toHaveBeenCalledTimes(1);

    resolveFetch([...PRODUCT_FIXTURE]);
    await Promise.all([first, second, third]);

    expect(catalog.products).toHaveLength(PRODUCT_FIXTURE.length);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("productById finds a product by id and returns undefined for ghost ids", async () => {
    mockFetch.mockResolvedValue([...PRODUCT_FIXTURE]);
    const catalog = useCatalogStore();
    await catalog.load();

    expect(catalog.productById("p2")?.name).toBe("Bravo");
    expect(catalog.productById("ghost")).toBeUndefined();
  });
});
