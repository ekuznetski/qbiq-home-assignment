# Product R Us

Mini e-commerce frontend built for the Vue.js Home Assignment - browse a small catalog of digital products, view details, and manage a cart with a mock checkout.

**Live demo:** https://qbiq-home-assignment.vercel.app/

## Tech stack

- Vue 3 (Composition API, `<script setup>`) + TypeScript
- Vite
- Vue Router (history mode)
- Pinia + `pinia-plugin-persistedstate` (cart persists in `localStorage`)
- PrimeVue 4 (component library) + `@primeuix/themes` (Aura)
- Tailwind CSS v4 + `tailwindcss-primeui`
- Vitest + jsdom + `@vue/test-utils` (unit)
- Playwright (e2e)
- ESLint + Prettier

## Getting started

Requires Node 20+ and pnpm.

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # type-check + production build
pnpm preview      # serve the production build
```

## Scripts

| Script              | What it does                                  |
| ------------------- | --------------------------------------------- |
| `pnpm dev`          | Vite dev server                               |
| `pnpm build`        | `vue-tsc -b && vite build`                    |
| `pnpm preview`      | Preview the production bundle                 |
| `pnpm test`         | Run unit tests in watch mode (Vitest)         |
| `pnpm test --run`   | Run unit tests once                           |
| `pnpm test:ui`      | Vitest UI                                     |
| `pnpm test:e2e`     | Run Playwright e2e tests (headless, parallel) |
| `pnpm test:e2e:ui`  | Playwright UI mode                            |
| `pnpm test:e2e:debug` | Playwright debug mode                       |
| `pnpm lint`         | ESLint                                        |
| `pnpm lint:fix`     | ESLint with autofix                           |
| `pnpm format`       | Prettier write                                |
| `pnpm format:check` | Prettier check                                |

The Playwright config has `webServer.reuseExistingServer: !CI`, so e2e tests reuse a running `pnpm dev` if one is already up.

## Project structure

```
src/
  assets/products.json       # mock catalog (3 products)
  components/                # presentational + small interactive pieces
    AppHeader.vue            # nav with cart badge
    ProductCard.vue          # grid item
    ProductCardSkeleton.vue
    ProductFilters.vue       # search + category multiselect + sort + reset
    ProductThumb.vue
    ReviewList.vue
    EmptyState.vue
    BackToProductsLink.vue
  composables/
    useProductFilters.ts     # debounced search, category set, sort comparator
  data/products.ts           # fetchProducts(): simulated latency + ?fail=1 hook
  stores/
    catalog.ts               # Pinia: products + loading/error state
    cart.ts                  # Pinia: items, totals, persisted in localStorage
  types/product.ts
  views/
    ProductList.vue          # / - list + URL-synced filters
    ProductDetails.vue       # /product/:id
    Cart.vue                 # /cart
    NotFound.vue             # catch-all
  router/index.ts
  __tests__/                 # Vitest
e2e/                         # Playwright
  fixtures.ts                # auto-fixture: error collectors, seedCart helper
  catalog.spec.ts
  cart.spec.ts
  errors.spec.ts
  persist.spec.ts
playwright.config.ts
```

## What the assignment asked for, and where it lives

| Requirement                                    | Implementation                                                                     |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| List page with name / price / thumbnail        | `views/ProductList.vue` + `components/ProductCard.vue`                             |
| Click to details                               | `views/ProductDetails.vue` (route `/product/:id`)                                  |
| Multi-faceted filtering (name + category)      | `composables/useProductFilters.ts`, debounced search + multi-category MultiSelect  |
| Sorting (price / name)                         | Same composable: `name-asc`, `name-desc`, `price-asc`, `price-desc`                |
| Filters survive deep-link / refresh            | URL ↔ state sync via `router.replace` in `ProductList.vue`                         |
| Details: long description, category, reviews   | `views/ProductDetails.vue` + `components/ReviewList.vue`                           |
| Back to products                               | `components/BackToProductsLink.vue` (link or button variant)                       |
| Add to cart updates global state               | `stores/cart.ts` + toast confirmation                                              |
| Cart page: adjust quantity, remove, total cost | `views/Cart.vue` (stepper, trash, order summary, mock checkout)                    |
| Pinia for state management                     | `stores/catalog.ts`, `stores/cart.ts`                                              |
| Skeleton loaders for async data                | `ProductCardSkeleton.vue` + skeletons in details & cart while catalog loads        |
| Error handling (bad product id, wrong URL)     | Inline NotFound on `/product/:id`, catch-all 404 route                             |
| Bad fetch / outages                            | Catalog store surfaces `error`, error UI with Retry; trigger via `?fail=1`         |
| Composition API + TypeScript                   | Throughout (`<script setup lang="ts">`, typed interfaces in `types/product.ts`)    |
| Tailwind                                       | Tailwind v4 via `@tailwindcss/vite`                                                |
| PrimeVue                                       | Inputs, MultiSelect, Select, Button, Tag, Skeleton, Toast, ConfirmPopup            |
| Unit tests for filtering or cart               | `src/__tests__/` - 42 tests across cart store, filters, list, details, cart view   |
| A11y for key navigation                        | Semantic roles, aria-labels for filters/quantity/cart, focus-visible rings, skip-link |
| Hosted                                         | Vercel - https://qbiq-home-assignment.vercel.app/                                  |

## Testing

**Unit (Vitest, jsdom, 42 tests):**

```bash
pnpm test --run
```

Covers: cart store (add / remove / decrement / persist / restore / total), `useProductFilters` (debounce / sort / categories / reset), `ProductList` URL ↔ state sync, `ProductDetails` add-to-cart flow, `Cart.vue` line stepper math.

**End-to-end (Playwright, 18 tests):**

```bash
pnpm test:e2e
```

Tests run against the dev server (auto-spawned if not running). Covers golden user paths and browser-only behavior that jsdom can't observe:

- Catalog: browse, search debounce, category MultiSelect, sort, URL hydrate, invalid sort fallback, reset
- Cart: add → header badge updates, stepper math + line total, decrement-to-remove, trash, mock checkout, clear-cart confirm (cancel + accept)
- Persistence: cart survives `page.reload()` via `localStorage`
- Errors: `?fail=1` → error panel + retry behavior, 404 catch-all, invalid product id

The e2e suite uses an auto-fixture that fails the test on uncaught `pageerror` or unexpected `console.error` (with an opt-out `allowConsoleError` for tests that intentionally trigger app errors).

## Mock backend

The catalog is loaded by `fetchProducts()` in `src/data/products.ts`, which simulates network latency (`VITE_FAKE_LATENCY_MS`, default 400ms) and supports two failure modes:

- `?fail=1` in the URL - useful for clicking through error UI manually
- `VITE_MOCK_FAIL=true` env var - useful in scripted scenarios

This keeps the production-shaped code path (async store with loading / error) without an actual backend.

## Notes on choices

- **URL is the source of truth for filters.** `ProductList.vue` hydrates state from `route.query` on mount and writes back via `router.replace` (no extra history entries while typing). Deep links and shareable URLs work out of the box.
- **`router.replace` over `router.push` for filter changes** so the back button doesn't replay every keystroke.
- **`localStorage` persistence is opt-in per store** - only `cart` is persisted (`pick: ["items"]`); the catalog is always re-fetched.
- **PrimeVue `pt` for ad-hoc styling** rather than overriding global theme tokens - keeps the theme intact.
- **Single `data-testid`** (on the cart count badge) - semantic locators handle the rest.

## License

For evaluation purposes only.
