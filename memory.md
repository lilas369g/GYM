# MEMORY — Al Mansour Gym website

## Current architecture (supersedes the former static-site notes)

- Next.js App Router + React + TypeScript.
- Arabic RTL public landing page at `/`.
- Authenticated owner dashboard at `/admin`; login at `/admin/login`.
- Server route handlers protect login, logout, content updates, and image uploads.
- Published content lives in `data/site-content.json` by default.
- Uploaded raster images live in `public/uploads` by default.
- Persistent Node storage is required; serverless deployment needs a durable
  storage adapter before launch.

## Design contract

- Preserve the palette: void `#0A0A0C`, iron `#17171C`, steel `#2A2A31`,
  ignition `#FF5A1F`, volt `#14E1C8`, chalk `#F4F3EF`, ash `#B3B3BB`.
- Arabic display type uses Tajawal; body copy uses Cairo.
- Navbar hides while scrolling down after 80 px and returns on upward scroll.
- Mobile navigation begins below 1100 px to prevent tablet crowding.
- Page content remains centered and bounded on ultrawide screens.
- No horizontal scrolling from 320 px through 3440 px.

## Content and security contract

- Public content is rendered as text, never as owner-supplied HTML.
- Validate every mutation again on the server.
- WhatsApp link values and display values remain separate.
- Accept uploads only after file-signature validation; SVG is not accepted.
- Admin cookies remain HTTP-only, SameSite=Lax, signed, and time-limited.
- Every protected API performs its own authorization check.
- Never hardcode production admin credentials in source control.

## Required environment values

- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- Existing phone/email variables remain migration fallbacks.

## Responsive QA contract

- Representative public and admin widths: 320, 390, 768, 1024, 1366, 1920,
  and 3440 px.
- Mobile menu links are not focusable while closed and Escape returns focus.
- Buttons/touch controls remain at least 44 px high where applicable.
- Test long Arabic copy and mixed LTR phone/URL values without clipping.
