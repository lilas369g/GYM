import { expect, test } from "@playwright/test";

const viewports = [
  { name: "small mobile", width: 320, height: 568 },
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet portrait", width: 768, height: 1024 },
  { name: "small laptop", width: 1024, height: 768 },
  { name: "desktop", width: 1366, height: 768 },
  { name: "full hd", width: 1920, height: 1080 },
  { name: "ultrawide", width: 3440, height: 1440 },
];

for (const viewport of viewports) {
  test(`public page has no overflow at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    await expect(page.locator("#contact")).toBeAttached();
    if (viewport.width < 1100) await expect(page.getByRole("button", { name: "فتح القائمة" })).toBeVisible();
    else await expect(page.getByRole("navigation", { name: "القائمة الرئيسية" })).toBeVisible();
  });
}

test("mobile navigation is keyboard-safe and closes with Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "فتح القائمة" });
  await toggle.click();
  await expect(page.getByRole("navigation", { name: "قائمة الهاتف" })).toBeVisible();
  await expect(page.getByRole("button", { name: "إغلاق القائمة" })).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "فتح القائمة" })).toBeFocused();
  await expect(page.locator("#mobile-menu")).toHaveAttribute("aria-hidden", "true");
});

test("dashboard controls stay reachable from mobile through ultrawide", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("كلمة المرور").fill("e2e-owner-password");
  await page.getByRole("button", { name: "دخول آمن" }).click();
  for (const viewport of [{ width: 320, height: 568 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }, { width: 3440, height: 1440 }]) {
    await page.setViewportSize(viewport);
    await expect(page.getByRole("button", { name: "حفظ ونشر" })).toBeVisible();
    const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  }
});
