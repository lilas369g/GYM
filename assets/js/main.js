(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* Wire WhatsApp links/buttons from config.js (no hardcoded numbers)   */
  /* ------------------------------------------------------------------ */
  function wireWhatsApp() {
    const cfg = window.SITE_CONFIG || {};
    document.querySelectorAll("[data-whatsapp-link]").forEach((el) => {
      const audience = el.dataset.whatsappLink;
      const configuredNumber =
        audience === "women"
          ? cfg.WOMEN_WHATSAPP_NUMBER
          : cfg.MEN_WHATSAPP_NUMBER || cfg.WHATSAPP_NUMBER;
      const number = (configuredNumber || "").replace(/\D/g, "");
      const message = encodeURIComponent(
        audience === "women"
          ? cfg.WOMEN_WHATSAPP_DEFAULT_MESSAGE || cfg.WHATSAPP_DEFAULT_MESSAGE || ""
          : cfg.MEN_WHATSAPP_DEFAULT_MESSAGE || cfg.WHATSAPP_DEFAULT_MESSAGE || ""
      );
      const href = number
        ? `https://wa.me/${number}${message ? `?text=${message}` : ""}`
        : "#";
      el.setAttribute("href", href);
    });
    document.querySelectorAll("[data-whatsapp-display]").forEach((el) => {
      const configuredNumber =
        el.dataset.whatsappDisplay === "women"
          ? cfg.WOMEN_WHATSAPP_DISPLAY_NUMBER
          : cfg.MEN_WHATSAPP_DISPLAY_NUMBER;
      const number = (configuredNumber || "").replace(/\D/g, "");
      el.textContent = number;
    });
  }

  function wireEmail() {
    const cfg = window.SITE_CONFIG || {};
    const email = (cfg.CONTACT_EMAIL || "").trim();

    document.querySelectorAll("[data-email-link]").forEach((el) => {
      el.setAttribute("href", email ? `mailto:${email}` : "#");
      if (email) el.setAttribute("aria-label", `إرسال بريد إلى ${email}`);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Navbar: hide on scroll-down, reveal on scroll-up                    */
  /* ------------------------------------------------------------------ */
  function setupNavbarScroll() {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;

    let lastScrollY = window.scrollY;
    let ticking = false;
    const HIDE_THRESHOLD = 80; // px before we start hiding

    function onScroll() {
      const currentY = window.scrollY;
      const mobileMenu = document.getElementById("mobile-menu");
      const menuOpen = mobileMenu && mobileMenu.classList.contains("open");

      if (menuOpen) {
        navbar.classList.remove("nav-hidden");
      } else if (currentY > lastScrollY && currentY > HIDE_THRESHOLD) {
        // scrolling down
        navbar.classList.add("nav-hidden");
      } else if (currentY < lastScrollY) {
        // scrolling up
        navbar.classList.remove("nav-hidden");
      }

      lastScrollY = currentY <= 0 ? 0 : currentY;
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(onScroll);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ------------------------------------------------------------------ */
  /* Mobile menu toggle                                                   */
  /* ------------------------------------------------------------------ */
  function setupMobileMenu() {
    const toggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("mobile-menu");
    const icon = document.getElementById("menu-icon");
    if (!toggle || !menu) return;

    function closeMenu() {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      if (icon) icon.className = "fa-solid fa-bars text-xl";
    }

    function toggleMenu() {
      const isOpen = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      if (icon) {
        icon.className = isOpen
          ? "fa-solid fa-xmark text-xl"
          : "fa-solid fa-bars text-xl";
      }
    }

    toggle.addEventListener("click", toggleMenu);
    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      if (
        menu.classList.contains("open") &&
        !menu.contains(event.target) &&
        !toggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.classList.contains("open")) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Scroll-reveal for sections/cards                                     */
  /* ------------------------------------------------------------------ */
  function setupScrollReveal() {
    const targets = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || targets.length === 0) {
      targets.forEach((el) => el.classList.add("in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------ */
  /* Footer year                                                          */
  /* ------------------------------------------------------------------ */
  function setupFooterYear() {
    const el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", () => {
    wireWhatsApp();
    wireEmail();
    setupNavbarScroll();
    setupMobileMenu();
    setupScrollReveal();
    setupFooterYear();
  });
})();
