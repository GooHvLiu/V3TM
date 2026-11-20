<script setup>
// Points at the dev server locally; falls back to the demo-app sub-path in production so visitors do not hit their own 5173
const demoUrl =
  import.meta.env.VITE_DEMO_APP_URL ||
  (import.meta.env.DEV ? "http://localhost:5173" : `${import.meta.env.BASE_URL}demo-app/`);
</script>

# Playground

What is embedded below is the template's own dev server. Start `npm run dev` in the project root first, then open this page — it frames the running app, not a screenshot.

<div class="demo-frame">
  <iframe :src="demoUrl" title="V3TM demo" loading="lazy" />
</div>

```bash
npm run dev          # in a second terminal
npm run docs:dev     # then open this page
```

The default address is `http://localhost:5173`. When the demo lives elsewhere, set `VITE_DEMO_APP_URL` in `.env` and the docs build reads it. Left empty, it falls back to local 5173.

## Why an embed instead of a screenshot

Screenshots expire. Every component change means another round of retakes, and nobody knows when the last one was taken. An embed shows the app as it runs, which is always current — the trade-off is that this page needs a dev server behind it.

On first load you will see the sign-in page inside the frame; use `superAdmin / superAdmin123456@` (or `admin / admin123456@`).

## What is worth trying inside the frame

- The language and theme switches in the top bar, with both palettes live;
- Dashboard charts recolouring with the theme;
- Table density, column settings and saved column preferences;
- The settings panel's three-level navigation and scroll anchoring;
- Narrow-screen behaviour — drag the frame narrower, or shrink the browser window.

## Structure

```html
<div class="demo-frame">
  <iframe src="http://localhost:5173" title="V3TM demo" loading="lazy" />
</div>
```

`.demo-frame` is styled in `custom.css`: a 16:9 ratio with rounded corners and a border, dropping to 4:3 on narrow screens. The iframe has no fixed height and follows its width through `aspect-ratio`.
