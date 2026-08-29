# Al Mansour — Gym Landing Page

Static landing page. HTML + Tailwind CSS (CDN) + vanilla JavaScript.

## Run it

First, put the WhatsApp number and contact email in `.env`, then generate the
browser configuration:

```bash
npm run build:config
```

Then open `index.html`. For the smoothest experience (fonts, relative asset
paths), serve it locally instead of double-clicking the file:

```bash
# from inside al-mansour-gym/
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Before going live

1. ضع الأرقام الظاهرة في `WHATSAPP_NUMBER` (رجال) و`WOMEN_WHATSAPP_NUMBER`
   (سيدات) داخل `.env`. روابط واتساب نفسها تستخدم الأرقام المطابقة من إعدادات
   السيرفر، ثم شغّل
   `npm run build:config`. Do not edit `assets/js/config.js` directly.
2. Swap the placeholder images in `index.html` for real photography.
3. Update the dummy phone number, address, and social links in the footer.
4. If the gym's exact map pin becomes available, update the Google Maps
   `src` query in the Contact section.

## Project memory & journal

- `memory.md` — locked-in facts: design tokens, typography, section order,
  scope boundaries. Read this before changing anything structural.
- `journal.md` — append-only log of what's been done each session, and what's
  still outstanding.

## The `/start-session` and `/end-session` commands

`.claude/commands/start-session.md` and `.claude/commands/end-session.md` are
written as **Claude Code custom slash commands**. If you're working on this
project inside Claude Code (or another tool that reads `.claude/commands/`),
typing `/start-session` will make it read `memory.md` + `journal.md` and brief
you before continuing, and `/end-session` will make it write up what changed.

If you're instead working in the claude.ai chat/app (no filesystem access
between conversations), those two files won't run as real slash commands —
paste their contents into the chat at the start/end of a session and Claude
will follow the same steps manually.
