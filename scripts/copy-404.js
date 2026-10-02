#!/usr/bin/env node

// GitHub Pages only serves a custom error page from a file named exactly
// "404.html" at the site root — "+not-found.html" (Expo Router's own
// not-found convention) isn't recognized. Without this, any URL GitHub can't
// match to a literal exported file (most commonly a trailing slash on a
// route the browser/PWA remembered, e.g. "/eestiroll/config/") falls through
// to GitHub's generic error page instead of this app.
//
// Every route this app exports is an identical client-side-rendered shell
// (the real screen is picked after hydration, based on the URL), so copying
// index.html to 404.html is a safe, complete fix — not a lossy fallback.

const fs = require('fs');
const path = require('path');

const distDir = path.join(process.cwd(), 'dist');
const src = path.join(distDir, 'index.html');
const dest = path.join(distDir, '404.html');

if (!fs.existsSync(src)) {
  console.error(`copy-404: ${src} not found — run "expo export --platform web" first.`);
  process.exit(1);
}

fs.copyFileSync(src, dest);
console.log('copy-404: wrote dist/404.html');
