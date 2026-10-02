import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

const APP_URL = 'https://andreabarrandeguy.github.io/eestiroll/';
const OG_IMAGE_URL = `${APP_URL}og-image.png`;
const DESCRIPTION = 'Learn Estonian, one roll at a time. Practice vocabulary and get AI feedback on your sentences.';

// The exported build is deployed under a /eestiroll subpath (GitHub Pages),
// so static files (manifest.json, apple-touch-icon.png) need that prefix —
// but the local dev server serves everything from its own root instead, so
// the same hardcoded prefix 404s there. process.env.NODE_ENV tracks which
// one we're in the same way Expo's own asset pipeline already does.
const BASE_PATH = process.env.NODE_ENV === 'production' ? '/eestiroll' : '';

// Root HTML for the static web export. Without this, Expo Router ships an
// empty <title> and no Open Graph tags, so share-sheet/link previews (iMessage,
// WhatsApp, etc.) fall back to a generic monogram instead of the app icon.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Actual <title> is set per-route via expo-router/head in app/_layout.tsx */}
        <meta name="description" content={DESCRIPTION} />

        <meta property="og:title" content="EestiRoll" />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content={OG_IMAGE_URL} />
        {/* Width/height/type are unnecessary per spec, but WhatsApp's crawler is
            known to silently skip rendering the image without them. */}
        <meta property="og:image:width" content="2400" />
        <meta property="og:image:height" content="1260" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:url" content={APP_URL} />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="EestiRoll" />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE_URL} />

        {/* Lets "Add to Home Screen" install as a standalone app with the
            real dice icon instead of a page screenshot + browser chrome. */}
        <link rel="manifest" href={`${BASE_PATH}/manifest.json`} />
        <link rel="apple-touch-icon" href={`${BASE_PATH}/apple-touch-icon.png`} />
        <meta name="theme-color" content="#35529D" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="EestiRoll" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
