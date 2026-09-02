"use client";

import { ChangeEvent, useEffect, useId, useMemo, useState } from "react";
import type { ContentCard, ImageField, Program, SiteContent } from "@/lib/types";
import { Icon } from "@/components/Icon";

const sections = [
  ["general", "عام ومحركات البحث"], ["header", "الترويسة والقائمة"], ["hero", "الواجهة الرئيسية"],
  ["programs", "البرامج والمواعيد"], ["facilities", "النادي والصور"], ["about", "لماذا نحن"],
  ["contact", "التواصل والخريطة"], ["footer", "التذييل والشبكات"],
] as const;

type SectionId = (typeof sections)[number][0];

export function AdminDashboard({ initialContent }: { initialContent: SiteContent }) {
  const [content, setContent] = useState(initialContent);
  const [savedSnapshot, setSavedSnapshot] = useState(JSON.stringify(initialContent));
  const [active, setActive] = useState<SectionId>("general");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);
  const dirty = useMemo(() => JSON.stringify(content) !== savedSnapshot, [content, savedSnapshot]);

  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);

  function setPath(path: string, value: unknown) {
    setContent((previous) => {
      const next = structuredClone(previous) as any;
      const keys = path.split(".");
      let cursor = next;
      keys.slice(0, -1).forEach((key) => { cursor = cursor[Number.isNaN(Number(key)) ? key : Number(key)]; });
      const last = keys.at(-1)!;
      cursor[Number.isNaN(Number(last)) ? last : Number(last)] = value;
      return next;
    });
  }

  function getArray(path: string) {
    return path.split(".").reduce<any>((value, key) => value[Number.isNaN(Number(key)) ? key : Number(key)], content) as any[];
  }

  function replaceArray(path: string, items: unknown[]) { setPath(path, items); }
  function move(path: string, index: number, direction: -1 | 1) {
    const items = [...getArray(path)];
    const destination = index + direction;
    if (destination < 0 || destination >= items.length) return;
    [items[index], items[destination]] = [items[destination], items[index]];
    replaceArray(path, items);
  }
  function remove(path: string, index: number, label: string) {
    if (!window.confirm(`هل تريد حذف «${label}»؟`)) return;
    replaceArray(path, getArray(path).filter((_, itemIndex) => itemIndex !== index));
  }

  async function save() {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(content) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "تعذّر الحفظ.");
      setContent(result);
      setSavedSnapshot(JSON.stringify(result));
      showToast("تم حفظ التغييرات ونشرها على الموقع.");
    } catch (reason) {
      showToast(reason instanceof Error ? reason.message : "تعذّر الحفظ.", true);
    } finally { setBusy(false); }
  }

  function showToast(text: string, error = false) {
    setToast({ text, error });
    window.setTimeout(() => setToast(null), 4500);
  }

  async function logout() {
    if (dirty && !window.confirm("لديك تغييرات غير محفوظة. هل تريد تسجيل الخروج؟")) return;
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const common = { content, setPath, move, remove, replaceArray, showToast };

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-brand"><span><Icon name="edit" /></span><div><strong>إدارة نادي المنصور</strong><small>{dirty ? <><i className="dirty-dot" />تغييرات غير محفوظة</> : `آخر تحديث: ${new Date(content.updatedAt).toLocaleString("ar-SY")}`}</small></div></div>
        <div className="admin-actions">
          <a className="admin-button" href="/" target="_blank" rel="noreferrer"><Icon name="eye" />معاينة</a>
          <button className="admin-button" type="button" onClick={logout}><Icon name="logout" />خروج</button>
          <button className="admin-button primary" type="button" disabled={busy || !dirty} onClick={save}><Icon name="save" />{busy ? "جارٍ الحفظ…" : "حفظ ونشر"}</button>
        </div>
      </header>
      <div className="admin-main">
        <nav className="admin-sidebar" aria-label="أقسام لوحة التحكم">{sections.map(([id, label]) => <button type="button" key={id} className={active === id ? "active" : ""} onClick={() => setActive(id)}>{label}</button>)}</nav>
        <main className="admin-content">
          <div className="admin-intro"><h1>{sections.find(([id]) => id === active)?.[1]}</h1><p>كل تغيير هنا يظهر على الصفحة العامة بعد الضغط على «حفظ ونشر».</p></div>
          {active === "general" && <GeneralSection {...common} />}
          {active === "header" && <HeaderSection {...common} />}
          {active === "hero" && <HeroSection {...common} />}
          {active === "programs" && <ProgramsSection {...common} />}
          {active === "facilities" && <FacilitiesSection {...common} />}
          {active === "about" && <AboutSection {...common} />}
          {active === "contact" && <ContactSection {...common} />}
          {active === "footer" && <FooterSection {...common} />}
        </main>
      </div>
      {toast && <div className={`admin-toast${toast.error ? " error" : ""}`} role="status">{toast.text}</div>}
    </div>
  );
}

type SectionProps = {
  content: SiteContent;
  setPath: (path: string, value: unknown) => void;
  move: (path: string, index: number, direction: -1 | 1) => void;
  remove: (path: string, index: number, label: string) => void;
  replaceArray: (path: string, items: unknown[]) => void;
  showToast: (text: string, error?: boolean) => void;
};

function GeneralSection({ content, setPath, replaceArray }: SectionProps) {
  return <>
    <Panel title="هوية الموقع" description="العنوان الظاهر في المتصفح والنصوص الأساسية للعلامة."><div className="form-grid">
      <TextField label="عنوان الصفحة (SEO)" value={content.seo.title} onChange={(v) => setPath("seo.title", v)} maxLength={90} />
      <TextField label="اسم النادي" value={content.brand.name} onChange={(v) => setPath("brand.name", v)} maxLength={80} />
      <TextField full label="وصف محركات البحث" value={content.seo.description} onChange={(v) => setPath("seo.description", v)} multiline maxLength={180} />
      <TextField full label="سطر الموقع المختصر" value={content.brand.location} onChange={(v) => setPath("brand.location", v)} maxLength={140} />
      <TextField full label="وصف النادي في التذييل" value={content.brand.footerDescription} onChange={(v) => setPath("brand.footerDescription", v)} multiline maxLength={500} />
    </div></Panel>
    <Panel title="شريط المزايا" description="سطور قصيرة تظهر مباشرة أسفل الواجهة الرئيسية.">
      {content.trust.map((item, index) => <RepeatCard key={index} title={`الميزة ${index + 1}`} index={index} length={content.trust.length} onMove={(d) => { const next = [...content.trust]; [next[index], next[index+d]] = [next[index+d], next[index]]; replaceArray("trust", next); }} onRemove={() => replaceArray("trust", content.trust.filter((_, i) => i !== index))}><TextField label="النص" value={item} onChange={(v) => setPath(`trust.${index}`, v)} maxLength={120} /></RepeatCard>)}
      {content.trust.length < 6 && <button className="admin-button add-button" type="button" onClick={() => replaceArray("trust", [...content.trust, "ميزة جديدة"])}>إضافة ميزة</button>}
    </Panel>
  </>;
}

function HeaderSection({ content, setPath, move, remove, replaceArray }: SectionProps) {
  return <Panel title="القائمة الرئيسية" description="يمكن تغيير النص والترتيب وإخفاء أي رابط.">
    <div className="form-grid"><TextField full label="نص زر التواصل" value={content.header.ctaLabel} onChange={(v) => setPath("header.ctaLabel", v)} maxLength={60} /></div>
    {content.header.nav.map((item, index) => <RepeatCard key={item.id} title={item.label || `رابط ${index+1}`} index={index} length={content.header.nav.length} onMove={(d) => move("header.nav", index, d)} onRemove={() => remove("header.nav", index, item.label)}><div className="form-grid">
      <TextField label="اسم الرابط" value={item.label} onChange={(v) => setPath(`header.nav.${index}.label`, v)} maxLength={60} />
      <div className="field"><label htmlFor={`nav-target-${index}`}>وجهة الرابط *</label><select id={`nav-target-${index}`} value={item.target} onChange={(event) => setPath(`header.nav.${index}.target`, event.target.value)}><option value="hero">الرئيسية</option><option value="trust">المزايا</option><option value="hours">البرامج</option><option value="products">النادي والأجهزة</option><option value="about">لماذا نحن</option><option value="contact">التواصل</option></select></div>
      <Toggle label="إظهار الرابط" checked={item.visible} onChange={(v) => setPath(`header.nav.${index}.visible`, v)} />
    </div></RepeatCard>)}
    {content.header.nav.length < 8 && <button className="admin-button add-button" type="button" onClick={() => replaceArray("header.nav", [...content.header.nav, { id: `nav-${Date.now()}`, label: "رابط جديد", target: "contact", visible: true }])}>إضافة رابط</button>}
  </Panel>;
}

function HeroSection({ content, setPath, showToast }: SectionProps) {
  return <Panel title="الواجهة الرئيسية" description="أول صورة وعنوان يراهما زائر الموقع."><div className="form-grid">
    <TextField full label="السطر العلوي" value={content.hero.eyebrow} onChange={(v) => setPath("hero.eyebrow", v)} maxLength={140} />
    <TextField label="بداية العنوان" value={content.hero.titleBefore} onChange={(v) => setPath("hero.titleBefore", v)} maxLength={80} />
    <TextField label="العبارة الملونة" value={content.hero.titleHighlight} onChange={(v) => setPath("hero.titleHighlight", v)} maxLength={80} />
    <TextField label="نهاية العنوان" value={content.hero.titleAfter} onChange={(v) => setPath("hero.titleAfter", v)} maxLength={80} />
    <TextField label="نص الزر" value={content.hero.ctaLabel} onChange={(v) => setPath("hero.ctaLabel", v)} maxLength={80} />
    <TextField full label="الوصف" value={content.hero.description} onChange={(v) => setPath("hero.description", v)} multiline maxLength={500} />
    <ImageEditor value={content.hero.image} onChange={(v) => setPath("hero.image", v)} onMessage={showToast} required />
  </div></Panel>;
}

function ProgramsSection({ content, setPath, move, remove, replaceArray, showToast }: SectionProps) {
  const addProgram = () => replaceArray("programs", [...content.programs, { id: `program-${Date.now()}`, label: "برنامج جديد", title: "عنوان البرنامج", coach: "", days: "", times: ["موعد جديد"], description: "", image: { src: "", alt: "" }, accent: "orange", visible: true } satisfies Program]);
  return <>
    <Panel title="مقدمة البرامج" description="العنوان والوصف أعلى بطاقات المواعيد."><SectionHeadingFields prefix="programsSection" value={content.programsSection} setPath={setPath} /></Panel>
    <Panel title="البرامج والمواعيد" description="أضف البرامج ورتبها أو أخفها مؤقتاً.">
      {content.programs.map((program, index) => <RepeatCard key={program.id} title={program.title} index={index} length={content.programs.length} onMove={(d) => move("programs", index, d)} onRemove={() => remove("programs", index, program.title)}><div className="form-grid">
        <TextField label="التصنيف القصير" value={program.label} onChange={(v) => setPath(`programs.${index}.label`, v)} maxLength={80} />
        <TextField label="العنوان" value={program.title} onChange={(v) => setPath(`programs.${index}.title`, v)} maxLength={100} />
        <TextField label="المدرب/الإشراف" value={program.coach} onChange={(v) => setPath(`programs.${index}.coach`, v)} maxLength={100} required={false} />
        <TextField label="الأيام" value={program.days} onChange={(v) => setPath(`programs.${index}.days`, v)} maxLength={160} required={false} />
        <TextField full label="الأوقات (سطر لكل موعد)" value={program.times.join("\n")} onChange={(v) => setPath(`programs.${index}.times`, v.split("\n").filter(Boolean))} multiline maxLength={650} />
        <TextField full label="وصف اختياري" value={program.description} onChange={(v) => setPath(`programs.${index}.description`, v)} multiline maxLength={700} required={false} />
        <div className="field"><span>لون البطاقة</span><select value={program.accent} onChange={(e) => setPath(`programs.${index}.accent`, e.target.value)}><option value="orange">برتقالي</option><option value="teal">فيروزي</option></select></div>
        <Toggle label="إظهار البرنامج" checked={program.visible} onChange={(v) => setPath(`programs.${index}.visible`, v)} />
        <ImageEditor value={program.image} onChange={(v) => setPath(`programs.${index}.image`, v)} onMessage={showToast} required={false} />
      </div></RepeatCard>)}
      {content.programs.length < 20 && <button className="admin-button add-button" type="button" onClick={addProgram}>إضافة برنامج</button>}
    </Panel>
  </>;
}

function FacilitiesSection({ content, setPath, move, remove, replaceArray, showToast }: SectionProps) {
  return <>
    <Panel title="مقدمة النادي والأجهزة" description="العنوان والوصف أعلى صور النادي."><SectionHeadingFields prefix="facilitiesSection" value={content.facilitiesSection} setPath={setPath} /></Panel>
    <CardCollection title="بطاقات المرافق" path="facilities" items={content.facilities} max={12} {...{setPath,move,remove,replaceArray,showToast}} />
    <Panel title="معرض الصور" description="صور إضافية للأجهزة. رتّبها حسب الأولوية.">
      {content.gallery.map((item, index) => <RepeatCard key={item.id} title={item.alt || `صورة ${index+1}`} index={index} length={content.gallery.length} onMove={(d) => move("gallery", index, d)} onRemove={() => remove("gallery", index, item.alt)}><div className="form-grid"><Toggle label="إظهار الصورة" checked={item.visible} onChange={(v) => setPath(`gallery.${index}.visible`, v)} /><ImageEditor value={item} onChange={(v) => { setPath(`gallery.${index}.src`, v.src); setPath(`gallery.${index}.alt`, v.alt); }} onMessage={showToast} required /></div></RepeatCard>)}
      {content.gallery.length < 24 && <button className="admin-button add-button" type="button" onClick={() => replaceArray("gallery", [...content.gallery, { id: `gallery-${Date.now()}`, src: "/assets/images/hero-coach.webp", alt: "صورة جديدة", visible: true }])}>إضافة صورة</button>}
    </Panel>
    <CardCollection title="العروض والمنتجات" path="offers" items={content.offers} max={8} {...{setPath,move,remove,replaceArray,showToast}} />
  </>;
}

function CardCollection({ title, path, items, max, setPath, move, remove, replaceArray, showToast }: Pick<SectionProps,"setPath"|"move"|"remove"|"replaceArray"|"showToast"> & { title: string; path: "facilities"|"offers"; items: ContentCard[]; max: number }) {
  return <Panel title={title} description="غيّر الصورة والعنوان والوصف والترتيب.">
    {items.map((item, index) => <RepeatCard key={item.id} title={item.title} index={index} length={items.length} onMove={(d) => move(path, index, d)} onRemove={() => remove(path, index, item.title)}><div className="form-grid">
      <TextField label="العنوان" value={item.title} onChange={(v) => setPath(`${path}.${index}.title`, v)} maxLength={120} />
      <Toggle label="إظهار البطاقة" checked={item.visible} onChange={(v) => setPath(`${path}.${index}.visible`, v)} />
      <TextField full label="الوصف" value={item.description} onChange={(v) => setPath(`${path}.${index}.description`, v)} multiline maxLength={700} />
      <ImageEditor value={item.image} onChange={(v) => setPath(`${path}.${index}.image`, v)} onMessage={showToast} required />
    </div></RepeatCard>)}
    {items.length < max && <button className="admin-button add-button" type="button" onClick={() => replaceArray(path, [...items, { id: `${path}-${Date.now()}`, title: "بطاقة جديدة", description: "اكتب وصف البطاقة هنا.", image: { src: "/assets/images/hero-coach.webp", alt: "صورة البطاقة" }, visible: true }])}>إضافة بطاقة</button>}
  </Panel>;
}

function AboutSection({ content, setPath }: SectionProps) {
  return <Panel title="قسم لماذا نحن" description="رسالة النادي الرئيسية للزائر."><div className="form-grid"><TextField full label="العنوان القصير" value={content.about.eyebrow} onChange={(v) => setPath("about.eyebrow", v)} maxLength={100} /><TextField full label="النص" value={content.about.body} onChange={(v) => setPath("about.body", v)} multiline maxLength={1200} /></div></Panel>;
}

function ContactSection({ content, setPath }: SectionProps) {
  const c = content.contact;
  return <>
    <Panel title="عنوان التواصل" description="المقدمة قبل بطاقات واتساب."><div className="form-grid"><TextField label="السطر الصغير" value={c.eyebrow} onChange={(v) => setPath("contact.eyebrow", v)} maxLength={100} /><TextField label="العنوان" value={c.title} onChange={(v) => setPath("contact.title", v)} maxLength={140} /></div></Panel>
    <Panel title="واتساب الرجال" description="رقم الرابط قد يكون دولياً، والرقم الظاهر يبقى بالشكل الذي تريده."><div className="form-grid">
      <TextField label="عنوان البطاقة" value={c.menTitle} onChange={(v) => setPath("contact.menTitle", v)} maxLength={120} />
      <TextField label="نص الزر" value={c.menButtonLabel} onChange={(v) => setPath("contact.menButtonLabel", v)} maxLength={80} />
      <TextField label="رقم واتساب" value={c.menWhatsappNumber} onChange={(v) => setPath("contact.menWhatsappNumber", v)} maxLength={30} required={false} hint="مثال: +963 9xx xxx xxx" />
      <TextField label="الرقم الظاهر" value={c.menDisplayNumber} onChange={(v) => setPath("contact.menDisplayNumber", v)} maxLength={30} required={false} />
      <TextField full label="الوصف" value={c.menDescription} onChange={(v) => setPath("contact.menDescription", v)} multiline maxLength={400} />
      <TextField full label="رسالة واتساب الافتراضية" value={c.menMessage} onChange={(v) => setPath("contact.menMessage", v)} multiline maxLength={500} />
    </div></Panel>
    <Panel title="واتساب السيدات" description="بيانات التواصل المخصصة للسيدات."><div className="form-grid">
      <TextField label="عنوان البطاقة" value={c.womenTitle} onChange={(v) => setPath("contact.womenTitle", v)} maxLength={120} />
      <TextField label="نص الزر" value={c.womenButtonLabel} onChange={(v) => setPath("contact.womenButtonLabel", v)} maxLength={80} />
      <TextField label="رقم واتساب" value={c.womenWhatsappNumber} onChange={(v) => setPath("contact.womenWhatsappNumber", v)} maxLength={30} required={false} />
      <TextField label="الرقم الظاهر" value={c.womenDisplayNumber} onChange={(v) => setPath("contact.womenDisplayNumber", v)} maxLength={30} required={false} />
      <TextField full label="الوصف" value={c.womenDescription} onChange={(v) => setPath("contact.womenDescription", v)} multiline maxLength={400} />
      <TextField full label="رسالة واتساب الافتراضية" value={c.womenMessage} onChange={(v) => setPath("contact.womenMessage", v)} multiline maxLength={500} />
    </div></Panel>
    <Panel title="العنوان والخريطة" description="استخدم رابط Google Maps من نوع embed عبر HTTPS."><div className="form-grid">
      <TextField full label="العنوان" value={c.address} onChange={(v) => setPath("contact.address", v)} maxLength={300} />
      <TextField full label="رابط الخريطة" value={c.mapEmbedUrl} onChange={(v) => setPath("contact.mapEmbedUrl", v)} maxLength={2000} dir="ltr" />
      <TextField full label="الوصف المسموع للخريطة" value={c.mapTitle} onChange={(v) => setPath("contact.mapTitle", v)} maxLength={220} />
    </div></Panel>
  </>;
}

function FooterSection({ content, setPath }: SectionProps) {
  const footer = content.footer;
  return <Panel title="التذييل والشبكات" description="بيانات أسفل الموقع ورابط فيسبوك ونسبة التصميم."><div className="form-grid">
    <TextField label="عنوان التواصل" value={footer.contactLabel} onChange={(v) => setPath("footer.contactLabel", v)} maxLength={80} />
    <TextField label="عنوان الشبكات" value={footer.socialLabel} onChange={(v) => setPath("footer.socialLabel", v)} maxLength={80} />
    <TextField full label="رابط فيسبوك" value={footer.facebookUrl} onChange={(v) => setPath("footer.facebookUrl", v)} maxLength={2000} required={false} dir="ltr" />
    <TextField full label="نص حقوق النشر" value={footer.copyrightText} onChange={(v) => setPath("footer.copyrightText", v)} maxLength={180} />
    <TextField label="اسم المصمم" value={footer.designerName} onChange={(v) => setPath("footer.designerName", v)} maxLength={100} required={false} />
    <TextField label="بريد المصمم" value={footer.designerEmail} onChange={(v) => setPath("footer.designerEmail", v)} maxLength={200} required={false} dir="ltr" />
  </div></Panel>;
}

function SectionHeadingFields({ prefix, value, setPath }: { prefix: string; value: { eyebrow: string; title: string; description: string }; setPath: SectionProps["setPath"] }) {
  return <div className="form-grid"><TextField label="السطر الصغير" value={value.eyebrow} onChange={(v) => setPath(`${prefix}.eyebrow`, v)} maxLength={100} /><TextField label="العنوان" value={value.title} onChange={(v) => setPath(`${prefix}.title`, v)} maxLength={140} /><TextField full label="الوصف" value={value.description} onChange={(v) => setPath(`${prefix}.description`, v)} multiline maxLength={500} /></div>;
}

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="admin-panel"><h2>{title}</h2><p>{description}</p>{children}</section>;
}

function TextField({ label, value, onChange, multiline = false, maxLength, full = false, required = true, hint, dir }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; maxLength: number; full?: boolean; required?: boolean; hint?: string; dir?: "ltr" | "rtl" }) {
  const reactId = useId();
  const id = `field-${reactId.replace(/:/g, "")}`;
  const common = { id, value, required, maxLength, dir, onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value) };
  return <div className={`field${full ? " full" : ""}`}><label htmlFor={id}>{label}{required ? " *" : ""}</label>{multiline ? <textarea {...common} /> : <input type="text" {...common} />}{hint && <small>{hint}</small>}</div>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="field toggle-field"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span>{label}</span></label>;
}

function RepeatCard({ title, index, length, onMove, onRemove, children }: { title: string; index: number; length: number; onMove: (direction: -1 | 1) => void; onRemove: () => void; children: React.ReactNode }) {
  return <div className="repeat-card"><div className="repeat-head"><strong>{title}</strong><div className="repeat-actions"><button className="icon-button" aria-label="تحريك لأعلى" type="button" disabled={index === 0} onClick={() => onMove(-1)}>↑</button><button className="icon-button" aria-label="تحريك لأسفل" type="button" disabled={index === length - 1} onClick={() => onMove(1)}>↓</button><button className="icon-button danger" aria-label="حذف" type="button" onClick={onRemove}>×</button></div></div>{children}</div>;
}

function ImageEditor({ value, onChange, onMessage, required }: { value: ImageField; onChange: (value: ImageField) => void; onMessage: (text: string, error?: boolean) => void; required: boolean }) {
  const [uploading, setUploading] = useState(false);
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData(); data.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "تعذّر رفع الصورة.");
      onChange({ ...value, src: result.src, alt: value.alt || file.name.replace(/\.[^.]+$/, "") });
      onMessage("تم رفع الصورة. اضغط «حفظ ونشر» لتطبيقها.");
    } catch (reason) { onMessage(reason instanceof Error ? reason.message : "تعذّر رفع الصورة.", true); }
    finally { setUploading(false); }
  }
  return <div className="image-field"><div className="image-preview">{value.src ? <img src={value.src} alt="معاينة" /> : <Icon name="image" size={34} />}</div><div className="form-grid">
    <TextField full label="مسار الصورة" value={value.src} onChange={(src) => onChange({ ...value, src })} maxLength={2000} required={required} dir="ltr" />
    <TextField full label="النص البديل للصورة" value={value.alt} onChange={(alt) => onChange({ ...value, alt })} maxLength={220} required={required} />
    <label className="upload-label"><Icon name="upload" />{uploading ? "جارٍ الرفع…" : "اختيار صورة من الجهاز"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading} onChange={upload} /></label>
  </div></div>;
}
