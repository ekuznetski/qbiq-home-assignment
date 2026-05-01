import productsJson from "@/assets/products.json";
import type { Product } from "@/types/product";

const products = productsJson as readonly Product[];

const FAKE_LATENCY_MS = (() => {
  const raw = import.meta.env.VITE_FAKE_LATENCY_MS;
  const parsed = typeof raw === "string" ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 400;
})();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldFail(): boolean {
  if (import.meta.env.VITE_MOCK_FAIL === "true") return true;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("fail") === "1";
}

// Single fetch is sufficient: the whole catalog (3 products) is delivered
// to the client once and ProductDetails reads from the catalog store.
export async function fetchProducts(): Promise<Product[]> {
  await delay(FAKE_LATENCY_MS);
  if (shouldFail()) throw new Error("Mock fetch failed");
  return [...products];
}
