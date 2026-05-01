import { test, expect } from "./fixtures";

test.describe("catalog", () => {
  test("browse to details", async ({ emptyCartPage: page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Awesome E-book Reader Pro" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Ultimate Graphics Suite" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Vue.js Masterclass Course" }).first()).toBeVisible();

    await page.getByRole("link", { name: "Awesome E-book Reader Pro" }).first().click();
    await expect(page).toHaveURL(/\/product\/p1$/);
    await expect(page.getByRole("heading", { level: 1, name: "Awesome E-book Reader Pro" })).toBeVisible();
  });

  test("search filter (debounce)", async ({ emptyCartPage: page }) => {
    await page.goto("/");
    await page.getByLabel("Search products by name").fill("vue");
    await expect(page.getByRole("link", { name: "Vue.js Masterclass Course" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Awesome E-book Reader Pro" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Ultimate Graphics Suite" })).toHaveCount(0);
    await expect(page).toHaveURL(/\?q=vue/);
  });

  test("category filter", async ({ emptyCartPage: page }) => {
    await page.goto("/");
    const categoryMultiSelect = page.locator('[data-pc-name="multiselect"]', {
      has: page.locator('input[aria-label="Filter by category"]'),
    });
    await categoryMultiSelect.click();
    await page.getByRole("option", { name: "Software" }).click();
    await page.keyboard.press("Escape");

    await expect(page.getByRole("link", { name: "Awesome E-book Reader Pro" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Ultimate Graphics Suite" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Vue.js Masterclass Course" })).toHaveCount(0);
    await expect(page).toHaveURL(/\?cat=Software/);
  });

  test("sort price-asc orders products", async ({ emptyCartPage: page }) => {
    await page.goto("/");
    await page.getByLabel("Sort by").click();
    await page.getByRole("option", { name: "Price (low → high)" }).click();

    await expect(page).toHaveURL(/\?sort=price-asc/);

    const productNames = ["Awesome E-book Reader Pro", "Ultimate Graphics Suite", "Vue.js Masterclass Course"] as const;
    const cards = page.getByRole("article").filter({
      has: page.getByRole("link", { name: new RegExp(productNames.join("|").replace(/\./g, "\\.")) }),
    });
    // The card root may not be an <article>; fall back to ProductCard root via h3 product titles.
    const titles = page.locator("h3").filter({
      hasText: /Awesome E-book Reader Pro|Ultimate Graphics Suite|Vue\.js Masterclass Course/,
    });
    // E-book ($79.99) < Vue Course ($99.00) < Graphics ($199.50)
    await expect(titles).toHaveText([
      /Awesome E-book Reader Pro/,
      /Vue\.js Masterclass Course/,
      /Ultimate Graphics Suite/,
    ]);
    void cards;
  });

  test("combo filter via direct URL", async ({ emptyCartPage: page }) => {
    await page.goto("/?cat=Software&sort=price-desc");
    await expect(page.getByRole("link", { name: "Vue.js Masterclass Course" })).toHaveCount(0);
    const titles = page.locator("h3").filter({ hasText: /Awesome E-book Reader Pro|Ultimate Graphics Suite/ });
    await expect(titles).toHaveText([/Ultimate Graphics Suite/, /Awesome E-book Reader Pro/]);
  });

  test("initial URL hydrate (q + cat + sort)", async ({ emptyCartPage: page }) => {
    await page.goto("/?q=master&cat=Online+Course&sort=name-asc");
    await expect(page.getByRole("link", { name: "Vue.js Masterclass Course" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Awesome E-book Reader Pro" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Ultimate Graphics Suite" })).toHaveCount(0);
    await expect(page.getByLabel("Search products by name")).toHaveValue("master");
    const categoryMultiSelect = page.locator('[data-pc-name="multiselect"]', {
      has: page.locator('input[aria-label="Filter by category"]'),
    });
    await expect(categoryMultiSelect).toContainText("Online Course");
  });

  test("invalid sort param falls back to default ordering", async ({ emptyCartPage: page }) => {
    await page.goto("/?sort=NOT_A_SORT_KEY");
    // App ignores the bogus value and renders default name-asc order without crashing.
    // (Note: the URL is intentionally NOT rewritten - the app treats unknown sort as "use default".)
    await expect(page.getByLabel("Sort by")).toContainText("Name (A → Z)");
    const titles = page.locator("h3").filter({
      hasText: /Awesome E-book Reader Pro|Ultimate Graphics Suite|Vue\.js Masterclass Course/,
    });
    await expect(titles).toHaveText([
      /Awesome E-book Reader Pro/,
      /Ultimate Graphics Suite/,
      /Vue\.js Masterclass Course/,
    ]);
  });

  test("empty state and reset", async ({ emptyCartPage: page }) => {
    await page.goto("/");
    await page.getByLabel("Search products by name").fill("zzznomatch");
    await expect(page.getByRole("heading", { name: "No products match your filters" })).toBeVisible();
    await page.getByRole("button", { name: "Reset filters" }).click();
    await expect(page.getByRole("link", { name: "Awesome E-book Reader Pro" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Ultimate Graphics Suite" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Vue.js Masterclass Course" }).first()).toBeVisible();
    await expect(page).toHaveURL(/\/$|^[^?]*$/);
  });
});
