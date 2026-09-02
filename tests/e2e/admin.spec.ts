import { rm } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("كلمة المرور").fill("e2e-owner-password");
  await page.getByRole("button", { name: "دخول آمن" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test("protects the dashboard and rejects an invalid password", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.getByLabel("كلمة المرور").fill("incorrect-password");
  await page.getByRole("button", { name: "دخول آمن" }).click();
  await expect(page.locator(".form-error")).toContainText("غير صحيحة");
});

test("publishes edited content and persists it on the public page", async ({ page }) => {
  await login(page);
  const title = `نادي المنصور للاختبار ${Date.now()}`;
  await page.getByLabel("اسم النادي").fill(title);
  await page.getByRole("button", { name: "حفظ ونشر" }).click();
  await expect(page.getByRole("status")).toContainText("تم حفظ التغييرات");
  await page.goto("/");
  await expect(page.getByRole("link", { name: new RegExp(title) }).first()).toBeVisible();
});

test("validates contact input and encodes WhatsApp output", async ({ page }) => {
  await login(page);
  await page.getByRole("button", { name: "التواصل والخريطة" }).click();
  await page.getByLabel("رقم واتساب", { exact: true }).first().fill("0912 345 678");
  await page.getByLabel("الرقم الظاهر", { exact: true }).first().fill("0912 345 678");
  await page.getByRole("button", { name: "حفظ ونشر" }).click();
  await expect(page.getByRole("status")).toContainText("تم حفظ التغييرات");
  await page.goto("/#contact");
  const mensLink = page.getByRole("link", { name: /ابدأ المحادثة عبر واتساب/ });
  await expect(mensLink).toHaveAttribute("href", /https:\/\/wa\.me\/963912345678\?text=/);
});

test("uploads a raster image and rejects non-image content", async ({ page }) => {
  await login(page);
  await page.getByRole("button", { name: "الواجهة الرئيسية" }).click();
  const fileInput = page.locator('input[type="file"]').first();
  const uploaded = page.waitForResponse((response) => response.url().endsWith("/api/admin/upload") && response.ok());
  await fileInput.setInputFiles("public/assets/images/hero-coach.webp");
  const uploadResult = await (await uploaded).json() as { src: string };
  await expect(page.getByRole("status")).toContainText("تم رفع الصورة");
  await fileInput.setInputFiles({ name: "fake.jpg", mimeType: "image/jpeg", buffer: Buffer.from("not an image") });
  await expect(page.getByRole("status")).toContainText("الصيغ المسموحة");
  await rm(path.join(process.cwd(), "public", uploadResult.src.replace(/^\/+/, "")), { force: true });
});

test("warns before logout when edits are dirty", async ({ page }) => {
  await login(page);
  await page.getByLabel("اسم النادي").fill("تغيير غير محفوظ");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "خروج" }).click();
  await expect(page).toHaveURL(/\/admin$/);
});
