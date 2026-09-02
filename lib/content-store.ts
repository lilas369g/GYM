import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SiteContent } from "@/lib/types";

const defaultContentPath = path.join(process.cwd(), "data", "site-content.json");

export function getContentPath() {
  const configured = process.env.CONTENT_FILE?.trim();
  return configured ? path.resolve(process.cwd(), configured) : defaultContentPath;
}

export async function readContent(): Promise<SiteContent> {
  const contentPath = getContentPath();
  try {
    return applyEnvironmentFallbacks(JSON.parse(await readFile(contentPath, "utf8")) as SiteContent);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const fallback = JSON.parse(await readFile(defaultContentPath, "utf8")) as SiteContent;
    await writeContentFile(fallback, contentPath);
    return applyEnvironmentFallbacks(fallback);
  }
}

function applyEnvironmentFallbacks(content: SiteContent) {
  const men = process.env.MEN_WHATSAPP_NUMBER || process.env.WHATSAPP_NUMBER || "";
  const women = process.env.WOMEN_WHATSAPP_NUMBER || "";
  if (!content.contact.menWhatsappNumber && men) content.contact.menWhatsappNumber = men;
  if (!content.contact.menDisplayNumber && (process.env.DISPLAY_M_NUMBER || men)) content.contact.menDisplayNumber = process.env.DISPLAY_M_NUMBER || men;
  if (!content.contact.womenWhatsappNumber && women) content.contact.womenWhatsappNumber = women;
  if (!content.contact.womenDisplayNumber && (process.env.DISPLAY_W_NUMBER || women)) content.contact.womenDisplayNumber = process.env.DISPLAY_W_NUMBER || women;
  if (!content.footer.designerEmail && process.env.CONTACT_EMAIL) content.footer.designerEmail = process.env.CONTACT_EMAIL;
  return content;
}

async function writeContentFile(content: SiteContent, contentPath = getContentPath()) {
  await mkdir(path.dirname(contentPath), { recursive: true });
  const temporaryPath = `${contentPath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
  await rename(temporaryPath, contentPath);
}

export async function saveContent(nextContent: SiteContent) {
  const current = await readContent();
  if (nextContent.revision !== current.revision) {
    const conflict = new Error("تم تعديل المحتوى من جلسة أخرى. حدّث الصفحة ثم حاول مجدداً.");
    Object.assign(conflict, { code: "REVISION_CONFLICT" });
    throw conflict;
  }

  const saved: SiteContent = {
    ...nextContent,
    revision: current.revision + 1,
    updatedAt: new Date().toISOString(),
  };
  await writeContentFile(saved);
  return saved;
}
