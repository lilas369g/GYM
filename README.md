# Al Mansour Gym — Next.js website and owner dashboard

Arabic RTL gym landing page with a protected content dashboard at `/admin`.

## What the owner can edit

- Browser title/description, gym name, location, header navigation, and CTA
- Hero copy and photo
- Trust lines, programs, schedules, facilities, gallery, and offer cards
- About copy, separate men/women WhatsApp numbers and messages
- Address, Google Maps embed, Facebook link, copyright, and designer credit
- Raster image uploads (JPG, PNG, WebP, or AVIF; maximum 5 MB)

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the site and `http://localhost:3000/admin` for
the dashboard. In development only, the fallback password is `change-me`.

Copy `.env.example` values into `.env` and set these before deployment:

```dotenv
ADMIN_PASSWORD=a-long-unique-owner-password
ADMIN_SESSION_SECRET=at-least-32-random-characters
```

Existing WhatsApp/email environment values are used as fallbacks until the
owner saves those fields from the dashboard.

## Storage and deployment

By default, published content is stored atomically in `data/site-content.json`
and uploads are stored in `public/uploads`. This is suitable for a persistent
Node.js server/VPS. Serverless hosts commonly use read-only or ephemeral file
systems; use durable object/database storage before deploying there.

Optional paths for a persistent mounted volume:

```dotenv
CONTENT_FILE=data/site-content.json
UPLOAD_DIR=public/uploads
```

`UPLOAD_DIR` must resolve inside `public/` so uploaded files remain publicly
servable. The dashboard uses an HTTP-only, signed, eight-hour owner session;
all save/upload endpoints repeat authorization checks and same-origin checks.

## Verification

```bash
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

The Playwright suite covers owner login/authorization, publishing, validation,
WhatsApp output, image upload rejection, unsaved-change protection, mobile menu
keyboard behavior, and horizontal overflow from 320 px through 3440 px.

## Optional next phases (not implemented)

- Draft → preview → publish, revision history, and one-click rollback
- Automated image crops/AVIF derivatives and focal-point controls
- Structured holiday/cancellation notices and schedule conflict warnings
- Privacy-friendly CTA analytics, scheduled publishing, and multiple staff roles
