# MEMORY — Al Mansour Gym Landing Page

> This file is the single source of truth for the project. Read it fully before
> touching any code. If something you're about to do contradicts this file,
> stop and reconcile it — do not silently override a documented decision.

## 1. Project facts (do not invent alternatives)

- **Client / brand name:** Al Mansour (الـمنصور) — men & women's gym.
- **Location (dummy but consistent everywhere it appears):** Sehnaya, Damascus, Syria.
- **Stack:** plain HTML + Tailwind CSS (CDN) + vanilla JavaScript. No backend, no
  database, no build step, no framework (no React/Vue).
- **No real business exists.** All photography, prices, phone numbers and social
  links are placeholders. This is explicitly allowed by the client.
- **WhatsApp number** lives in `assets/js/config.js` as `WHATSAPP_NUMBER`. This is
  the static-site equivalent of a `.env` value — it's the ONE place to edit before
  shipping. Never hardcode the number anywhere else (footer, contact button, etc.);
  always read it from `window.SITE_CONFIG.WHATSAPP_NUMBER`.
- **Icon library:** Font Awesome 6 (Free) via cdnjs. No emojis anywhere in the UI.
- **Images:** sourced as placeholder/royalty-free hotlinks (loremflickr keyword
  service) since there is no real gym to photograph. The navbar's man/woman split
  silhouette is a hand-built inline SVG (not a photo) so its two-color split can be
  animated precisely.

## 2. Design tokens (do not drift from these hex values)

| Token          | Hex        | Role                                            |
|----------------|------------|--------------------------------------------------|
| `--void`       | #0A0A0C    | Page background, darkest surface                |
| `--iron`       | #17171C    | Card / section surface                          |
| `--steel`      | #2A2A31    | Borders, dividers                               |
| `--ignition`   | #FF5A1F    | Primary accent — "male half" of the brand split |
| `--volt`       | #14E1C8    | Secondary accent — "female half" of the split   |
| `--chalk`      | #F4F3EF    | Primary light text                              |
| `--ash`        | #9A9AA3    | Muted / secondary text                          |

Gradient signature: `linear-gradient(90deg, var(--ignition), var(--volt))` — used
on the navbar split, CTA buttons, and section dividers. Do not introduce new
accent colors (no blue/purple/pink additions) — the whole palette is these 7.

## 3. Typography

- Display / headings: **Bebas Neue** (condensed, gym-signage energy).
- Body copy: **Manrope**.
- Utility (prices, labels, nav eyebrows): **JetBrains Mono**, uppercase, tracked out.

All three loaded from Google Fonts in `index.html`'s `<head>`.

## 4. Signature interaction (the one "hero" idea — don't dilute it)

The navbar background is a full-bleed inline SVG of a man silhouette (left half,
Ignition-orange duotone) and a woman silhouette (right half, Volt-cyan duotone),
seamed at the center with a diagonal gradient blend. On scroll:
- scrolling **down** past ~80px → navbar translates fully out of view
  (`translateY(-100%)`), hidden behind the top edge.
- scrolling **up** (even slightly) → navbar translates back in
  (`translateY(0)`).
Implemented in `assets/js/main.js` using scroll direction detection (see the
`lastScrollY` comparison). Do not swap this for a simple "hide on scroll down
only" — direction-based show/hide is the spec.

## 5. Sections, in order (do not reorder or add sections not in scope)

1. Navbar — logo "AL MANSOUR", nav links, mobile hamburger menu.
2. Hero — headline, subheadline, CTA "Book Your Free Trial Session Now", woman
   mid-workout image with dramatic/neon lighting treatment.
3. About Us — the client-provided paragraph, verbatim, not paraphrased.
4. Products — 4 cards (High-Protein Snacks, Trainers, Gym Wear, Gym Bag). Each
   card: image, title, description, price. **No buttons** (no backend/cart).
5. Contact Us — WhatsApp deep link (`https://wa.me/<number>`) + Google Maps
   embed (iframe, `output=embed`, no API key) centered on Sehnaya, Damascus.
6. Footer — copyright, social icons (dummy links), dummy phone number, dummy
   address, all icons via Font Awesome (no emojis).

## 6. File map

```
al-mansour-gym/
├── index.html                  ← all markup, sections in the order above
├── assets/css/style.css        ← design tokens as CSS vars, custom classes, keyframes
├── assets/js/config.js         ← WHATSAPP_NUMBER + other editable constants
├── assets/js/main.js           ← navbar scroll show/hide, mobile menu, scroll-reveal
├── memory.md                   ← this file
├── journal.md                  ← append-only session log
├── README.md                   ← how to open/run the site, how the "sessions" work
└── .claude/commands/
    ├── start-session.md
    └── end-session.md
```

## 7. Responsive contract (tester enforces this — see journal QA log)

Breakpoints in use (Tailwind defaults, no custom breakpoints added):
`sm 640px / md 768px / lg 1024px / xl 1280px / 2xl 1536px`, plus a manual check
at **1920px+ (ultrawide)** to make sure content doesn't stretch edge-to-edge
unreadably (max-width containers + centered layout beyond `2xl`).

Mobile-first rules that must hold at every breakpoint:
- Navbar collapses to a hamburger below `md`.
- Hero text never overflows or gets clipped; CTA is always fully tappable
  (min 44px touch target).
- Product grid: 1 col (mobile) → 2 col (`sm`/`md`) → 4 col (`lg+`).
- Google Maps iframe and WhatsApp button stack vertically below `md`, sit
  side-by-side at `md+`.
- No horizontal scrollbars at any width from 320px to 2560px.

## 8. Open decisions / non-goals (so nobody re-litigates these)

- No backend, no form submission, no cart, no payment — confirmed by client.
- No real gym content — placeholder prices/copy are acceptable and expected.
- Language: English copy (client wrote the brief in English/Arabic mixed but
  gave all section copy in English).
- Do not add sections beyond the 6 listed above unless the client asks.
