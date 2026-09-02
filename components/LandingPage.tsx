"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteContent } from "@/lib/types";
import { Icon } from "@/components/Icon";

function whatsappHref(number: string, message: string) {
  let digits = number.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `963${digits.slice(1)}`;
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : "#contact";
}

export function LandingPage({ content }: { content: SiteContent }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menHref = whatsappHref(content.contact.menWhatsappNumber, content.contact.menMessage);
  const womenHref = whatsappHref(content.contact.womenWhatsappNumber, content.contact.womenMessage);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const current = window.scrollY;
        setNavHidden(!menuOpen && current > lastY && current > 80);
        lastY = Math.max(0, current);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        document.getElementById("menu-toggle")?.focus();
      }
    };
    const onPointer = (event: MouseEvent) => {
      if (menuOpen && headerRef.current && !headerRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onPointer); };
  }, [menuOpen]);

  const visibleNav = content.header.nav.filter((item) => item.visible);
  const visiblePrograms = content.programs.filter((item) => item.visible);

  return (
    <main className="site-shell">
      <header ref={headerRef} id="navbar" className={`site-header${navHidden ? " nav-hidden" : ""}`}>
        <div className="nav-pattern" aria-hidden="true" />
        <div className="page-width nav-row">
          <a href="#hero" className="brand-link"><Icon name="dumbbell" size={28} /><strong>{content.brand.name}</strong></a>
          <nav className="desktop-nav" aria-label="القائمة الرئيسية">
            {visibleNav.map((item) => <a key={item.id} href={`#${item.target}`}>{item.label}</a>)}
          </nav>
          <a href={menHref} target={menHref.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="button button-small header-cta"><Icon name="whatsapp" />{content.header.ctaLabel}</a>
          <button id="menu-toggle" className="menu-toggle" type="button" aria-controls="mobile-menu" aria-expanded={menuOpen} aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"} onClick={() => setMenuOpen((open) => !open)}>
            <Icon name={menuOpen ? "close" : "menu"} size={26} />
          </button>
        </div>
        <div id="mobile-menu" className={`mobile-menu${menuOpen ? " open" : ""}`} aria-hidden={!menuOpen}>
          <nav aria-label="قائمة الهاتف">
            {visibleNav.map((item) => <a key={item.id} tabIndex={menuOpen ? 0 : -1} href={`#${item.target}`} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
            <a tabIndex={menuOpen ? 0 : -1} href={menHref} onClick={() => setMenuOpen(false)}><Icon name="whatsapp" />{content.header.ctaLabel}</a>
          </nav>
        </div>
      </header>

      <section id="hero" className="hero" style={{ "--hero-image": `url("${content.hero.image.src.replace(/["\\]/g, "")}")` } as React.CSSProperties}>
        <div className="hero-overlay" role="img" aria-label={content.hero.image.alt} />
        <div className="page-width hero-content">
          <p className="eyebrow teal">{content.hero.eyebrow}</p>
          <h1>{content.hero.titleBefore} <span>{content.hero.titleHighlight}</span> {content.hero.titleAfter}</h1>
          <p className="hero-copy">{content.hero.description}</p>
          <a className="button hero-button" href={menHref} target={menHref.startsWith("http") ? "_blank" : undefined} rel="noreferrer"><Icon name="whatsapp" size={23} />{content.hero.ctaLabel}</a>
        </div>
        <a href="#trust" className="scroll-cue" aria-label="انتقل إلى محتوى الصفحة"><Icon name="chevron" /></a>
      </section>

      <section id="trust" className="trust-strip" aria-label="مزايا النادي">
        <div className="page-width trust-grid">
          {content.trust.map((item, index) => <div className="trust-item" key={`${item}-${index}`}><Icon name={index % 2 ? "users" : "check"} />{item}</div>)}
          <a className="trust-item ltr" href={menHref}><Icon name="whatsapp" />{content.contact.menDisplayNumber || "تواصل عبر واتساب"}</a>
        </div>
      </section>

      <section id="hours" className="section section-programs">
        <div className="page-width">
          <SectionHeading {...content.programsSection} />
          <div className="program-grid">
            {visiblePrograms.map((program) => (
              <article className={`program-card accent-${program.accent}${program.image.src ? " with-image" : ""}`} key={program.id}>
                {program.image.src && <img src={program.image.src} alt={program.image.alt} loading="lazy" />}
                <div className="program-body">
                  <p className="card-label">{program.label}</p>
                  <h3>{program.title}</h3>
                  {program.coach && <p><Icon name="users" />{program.coach}</p>}
                  {program.days && <p><Icon name="calendar" />{program.days}</p>}
                  {program.times.map((time, index) => <p className="time" key={`${time}-${index}`}><Icon name="clock" />{time}</p>)}
                  {program.description && <p className="description">{program.description}</p>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="products" className="section section-facilities">
        <div className="page-width">
          <SectionHeading {...content.facilitiesSection} />
          <div className="facility-grid">
            {content.facilities.filter((card) => card.visible).map((card) => (
              <article className="facility-card" key={card.id}>
                <img src={card.image.src} alt={card.image.alt} loading="lazy" />
                <div><h3>{card.title}</h3><p>{card.description}</p></div>
              </article>
            ))}
          </div>
          <div className="gallery" aria-label="معرض أجهزة نادي المنصور">
            {content.gallery.filter((item) => item.visible).map((item) => <img key={item.id} src={item.src} alt={item.alt} loading="lazy" />)}
          </div>
          <div className="offers-grid">
            {content.offers.filter((offer) => offer.visible).map((offer) => (
              <article className="offer-card" key={offer.id}><img src={offer.image.src} alt={offer.image.alt} loading="lazy" /><div><h3>{offer.title}</h3><p>{offer.description}</p></div></article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="section about-section">
        <div className="page-width about-content"><p className="eyebrow orange">{content.about.eyebrow}</p><blockquote>“{content.about.body}”</blockquote></div>
      </section>

      <section id="contact" className="section contact-section">
        <div className="page-width">
          <SectionHeading eyebrow={content.contact.eyebrow} title={content.contact.title} description="" />
          <div className="contact-grid">
            <ContactCard title={content.contact.womenTitle} description={content.contact.womenDescription} displayNumber={content.contact.womenDisplayNumber} buttonLabel={content.contact.womenButtonLabel} href={womenHref} />
            <ContactCard title={content.contact.menTitle} description={content.contact.menDescription} displayNumber={content.contact.menDisplayNumber} buttonLabel={content.contact.menButtonLabel} href={menHref} />
            <div className="map-frame"><iframe src={content.contact.mapEmbedUrl} title={content.contact.mapTitle} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /></div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="page-width footer-grid">
          <div className="footer-brand"><a href="#hero" className="brand-link"><Icon name="dumbbell" /><span>{content.brand.name}</span></a><p>{content.brand.footerDescription}</p></div>
          <div><h3>{content.footer.contactLabel}</h3><p><Icon name="phone" />{content.contact.menDisplayNumber || "—"}</p><p><Icon name="location" />{content.contact.address}</p></div>
          <div><h3>{content.footer.socialLabel}</h3>{content.footer.facebookUrl && <a className="social-link" href={content.footer.facebookUrl} target="_blank" rel="noreferrer" aria-label="فيسبوك"><Icon name="facebook" /></a>}</div>
        </div>
        <div className="page-width footer-bottom"><p>© {new Date().getFullYear()} {content.footer.copyrightText}</p>{content.footer.designerName && <p>مصمم بواسطة {content.footer.designerEmail ? <a href={`mailto:${content.footer.designerEmail}`}>{content.footer.designerName}</a> : content.footer.designerName}</p>}</div>
      </footer>
    </main>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="section-heading"><p className="eyebrow teal">{eyebrow}</p><h2>{title}</h2>{description && <p>{description}</p>}</div>;
}

function ContactCard({ title, description, displayNumber, buttonLabel, href }: { title: string; description: string; displayNumber: string; buttonLabel: string; href: string }) {
  return <article className="contact-card"><span className="contact-icon"><Icon name="whatsapp" size={26} /></span><h3>{title}</h3><p>{description}</p>{displayNumber && <strong className="ltr">{displayNumber}</strong>}<a className="button button-small" href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"><Icon name="whatsapp" />{buttonLabel}</a></article>;
}
