import { test, expect } from "./fixtures";

test.describe("error states", () => {
  // ?fail=1 triggers a deliberate "Mock fetch failed" rejection that the
  // catalog store rethrows; the resulting console.error is expected.
  test.use({ allowConsoleError: true });

  test("?fail=1 shows error panel and Retry stays failing while flag is set", async ({ emptyCartPage: page }) => {
    await page.goto("/?fail=1");
    const errorPanel = page.getByRole("alert").filter({ hasText: "Couldn't load products" });
    await expect(errorPanel).toBeVisible();
    const retry = page.getByRole("button", { name: /Retry/ });
    await expect(retry).toBeVisible();

    await retry.click();
    // Flag stays in URL → retry must keep failing
    await expect(errorPanel).toBeVisible();
  });

  test("404 catch-all shows page and links back home", async ({ emptyCartPage: page }) => {
    await page.goto("/random/url-does-not-exist");
    await expect(page.getByRole("heading", { name: "This page wandered off" })).toBeVisible();
    await page.getByRole("link", { name: /Back to products/ }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("link", { name: "Awesome E-book Reader Pro" })).toHaveCount(1);
  });

  test("invalid product id shows inline NotFound", async ({ emptyCartPage: page }) => {
    await page.goto("/product/ghost-id-xyz");
    await expect(page.getByRole("heading", { name: "Product not found" })).toBeVisible();
    await expect(page.getByText("ghost-id-xyz")).toBeVisible();
    await page.getByRole("link", { name: "Browse products" }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
