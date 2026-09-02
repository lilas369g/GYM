import type { SiteContent } from "@/lib/types";

export class ValidationError extends Error {}

function text(value: unknown, label: string, max = 500, required = true) {
  if (typeof value !== "string") throw new ValidationError(`${label}: قيمة نصية مطلوبة.`);
  const clean = value.trim();
  if (required && !clean) throw new ValidationError(`${label}: هذا الحقل مطلوب.`);
  if (clean.length > max) throw new ValidationError(`${label}: الحد الأقصى ${max} حرفاً.`);
  return clean;
}

function bool(value: unknown, label: string) {
  if (typeof value !== "boolean") throw new ValidationError(`${label}: قيمة غير صالحة.`);
  return value;
}

function list(value: unknown, label: string, max: number) {
  if (!Array.isArray(value)) throw new ValidationError(`${label}: قائمة مطلوبة.`);
  if (value.length > max) throw new ValidationError(`${label}: الحد الأقصى ${max} عناصر.`);
  return value;
}

function safeId(value: unknown, label: string) {
  const id = text(value, label, 80);
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(id)) throw new ValidationError(`${label}: المعرّف غير صالح.`);
  return id;
}

function safeUrl(value: unknown, label: string, required = false) {
  const url = text(value, label, 2000, required);
  if (!url) return "";
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") throw new Error();
    return url;
  } catch {
    throw new ValidationError(`${label}: استخدم رابط HTTPS أو مساراً محلياً يبدأ بـ /.`);
  }
}

function image(value: unknown, label: string, required = true) {
  if (!value || typeof value !== "object") throw new ValidationError(`${label}: صورة غير صالحة.`);
  const source = value as Record<string, unknown>;
  return {
    src: safeUrl(source.src, `${label} - الرابط`, required),
    alt: text(source.alt, `${label} - النص البديل`, 220, required),
  };
}

function uniqueIds(items: Array<{ id: string }>, label: string) {
  if (new Set(items.map((item) => item.id)).size !== items.length) {
    throw new ValidationError(`${label}: توجد معرّفات مكررة.`);
  }
}

export function validateContent(value: unknown): SiteContent {
  if (!value || typeof value !== "object") throw new ValidationError("بيانات المحتوى غير صالحة.");
  const input = value as Record<string, any>;
  const seo = input.seo || {};
  const brand = input.brand || {};
  const header = input.header || {};
  const hero = input.hero || {};
  const programsSection = input.programsSection || {};
  const facilitiesSection = input.facilitiesSection || {};
  const about = input.about || {};
  const contact = input.contact || {};
  const footer = input.footer || {};

  const allowedTargets = new Set(["hero", "trust", "hours", "products", "about", "contact"]);
  const nav = list(header.nav, "القائمة الرئيسية", 8).map((item: any, index) => ({
    id: safeId(item?.id, `رابط ${index + 1}`),
    label: text(item?.label, `اسم رابط ${index + 1}`, 60),
    target: (() => {
      const target = safeId(item?.target, `وجهة رابط ${index + 1}`);
      if (!allowedTargets.has(target)) throw new ValidationError(`وجهة رابط ${index + 1}: اختر قسماً موجوداً.`);
      return target;
    })(),
    visible: bool(item?.visible, `ظهور رابط ${index + 1}`),
  }));
  uniqueIds(nav, "القائمة الرئيسية");

  const programs = list(input.programs, "البرامج", 20).map((item: any, index) => ({
    id: safeId(item?.id, `برنامج ${index + 1}`),
    label: text(item?.label, `تصنيف برنامج ${index + 1}`, 80),
    title: text(item?.title, `عنوان برنامج ${index + 1}`, 100),
    coach: text(item?.coach, `مدرب برنامج ${index + 1}`, 100, false),
    days: text(item?.days, `أيام برنامج ${index + 1}`, 160, false),
    times: list(item?.times, `أوقات برنامج ${index + 1}`, 8).map((time, timeIndex) => text(time, `وقت ${timeIndex + 1}`, 80)),
    description: text(item?.description, `وصف برنامج ${index + 1}`, 700, false),
    image: image(item?.image, `صورة برنامج ${index + 1}`, false),
    accent: item?.accent === "teal" ? "teal" as const : "orange" as const,
    visible: bool(item?.visible, `ظهور برنامج ${index + 1}`),
  }));
  uniqueIds(programs, "البرامج");

  const cardList = (value: unknown, label: string, max: number) => {
    const result = list(value, label, max).map((item: any, index) => ({
      id: safeId(item?.id, `${label} ${index + 1}`),
      title: text(item?.title, `عنوان ${label} ${index + 1}`, 120),
      description: text(item?.description, `وصف ${label} ${index + 1}`, 700),
      image: image(item?.image, `صورة ${label} ${index + 1}`),
      visible: bool(item?.visible, `ظهور ${label} ${index + 1}`),
    }));
    uniqueIds(result, label);
    return result;
  };

  const facilities = cardList(input.facilities, "المرافق", 12);
  const offers = cardList(input.offers, "العروض", 8);
  const gallery = list(input.gallery, "المعرض", 24).map((item: any, index) => ({
    id: safeId(item?.id, `صورة المعرض ${index + 1}`),
    ...image(item, `صورة المعرض ${index + 1}`),
    visible: bool(item?.visible, `ظهور صورة المعرض ${index + 1}`),
  }));
  uniqueIds(gallery, "المعرض");

  const trust = list(input.trust, "شريط المزايا", 6).map((item, index) => text(item, `ميزة ${index + 1}`, 120));
  const phone = (value: unknown, label: string) => {
    const number = text(value, label, 30, false);
    if (number && !/^\+?[\d\s()-]{7,30}$/.test(number)) throw new ValidationError(`${label}: رقم الهاتف غير صالح.`);
    return number;
  };

  return {
    revision: Number.isInteger(input.revision) && input.revision > 0 ? input.revision : 1,
    updatedAt: text(input.updatedAt, "تاريخ التحديث", 50),
    seo: { title: text(seo.title, "عنوان الصفحة", 90), description: text(seo.description, "وصف محركات البحث", 180) },
    brand: { name: text(brand.name, "اسم النادي", 80), location: text(brand.location, "سطر الموقع", 140), footerDescription: text(brand.footerDescription, "وصف التذييل", 500) },
    header: { nav, ctaLabel: text(header.ctaLabel, "زر الترويسة", 60) },
    hero: {
      eyebrow: text(hero.eyebrow, "السطر العلوي", 140),
      titleBefore: text(hero.titleBefore, "بداية العنوان", 80),
      titleHighlight: text(hero.titleHighlight, "العنوان المميز", 80),
      titleAfter: text(hero.titleAfter, "نهاية العنوان", 80),
      description: text(hero.description, "وصف الواجهة", 500),
      ctaLabel: text(hero.ctaLabel, "زر الواجهة", 80),
      image: image(hero.image, "صورة الواجهة"),
    },
    trust,
    programsSection: { eyebrow: text(programsSection.eyebrow, "تصنيف البرامج", 100), title: text(programsSection.title, "عنوان البرامج", 140), description: text(programsSection.description, "وصف البرامج", 500) },
    programs,
    facilitiesSection: { eyebrow: text(facilitiesSection.eyebrow, "تصنيف النادي", 100), title: text(facilitiesSection.title, "عنوان النادي", 140), description: text(facilitiesSection.description, "وصف النادي", 500) },
    facilities,
    gallery,
    offers,
    about: { eyebrow: text(about.eyebrow, "عنوان لماذا نحن", 100), body: text(about.body, "نص لماذا نحن", 1200) },
    contact: {
      eyebrow: text(contact.eyebrow, "تصنيف التواصل", 100),
      title: text(contact.title, "عنوان التواصل", 140),
      menTitle: text(contact.menTitle, "عنوان الرجال", 120),
      menDescription: text(contact.menDescription, "وصف الرجال", 400),
      menButtonLabel: text(contact.menButtonLabel, "زر الرجال", 80),
      menWhatsappNumber: phone(contact.menWhatsappNumber, "رقم واتساب الرجال"),
      menDisplayNumber: phone(contact.menDisplayNumber, "رقم الرجال الظاهر"),
      menMessage: text(contact.menMessage, "رسالة الرجال", 500),
      womenTitle: text(contact.womenTitle, "عنوان السيدات", 120),
      womenDescription: text(contact.womenDescription, "وصف السيدات", 400),
      womenButtonLabel: text(contact.womenButtonLabel, "زر السيدات", 80),
      womenWhatsappNumber: phone(contact.womenWhatsappNumber, "رقم واتساب السيدات"),
      womenDisplayNumber: phone(contact.womenDisplayNumber, "رقم السيدات الظاهر"),
      womenMessage: text(contact.womenMessage, "رسالة السيدات", 500),
      address: text(contact.address, "العنوان", 300),
      mapEmbedUrl: safeUrl(contact.mapEmbedUrl, "رابط الخريطة", true),
      mapTitle: text(contact.mapTitle, "وصف الخريطة", 220),
    },
    footer: {
      contactLabel: text(footer.contactLabel, "عنوان التواصل في التذييل", 80),
      socialLabel: text(footer.socialLabel, "عنوان التواصل الاجتماعي", 80),
      facebookUrl: safeUrl(footer.facebookUrl, "رابط فيسبوك", false),
      copyrightText: text(footer.copyrightText, "حقوق النشر", 180),
      designerName: text(footer.designerName, "اسم المصمم", 100, false),
      designerEmail: text(footer.designerEmail, "بريد المصمم", 200, false),
    },
  };
}
