import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

const APP_URL = 'https://eestiroll.ee/';
// Versioned filename on purpose: Facebook (and WhatsApp, LinkedIn, iMessage)
// cache the preview image by URL, separately from the page's metadata, so
// re-scraping the page keeps serving the old picture. Bumping the name is
// the only invalidation that works everywhere — including the clients that
// offer no debugger at all. Bump it whenever the image changes.
const OG_IMAGE_URL = `${APP_URL}og-image-v2.png`;
const DESCRIPTION = 'Learn Estonian, one roll at a time. Practice vocabulary and get AI feedback on your sentences.';

// Root HTML for the static web export. Without this, Expo Router ships an
// empty <title> and no Open Graph tags, so share-sheet/link previews (iMessage,
// WhatsApp, etc.) fall back to a generic monogram instead of the app icon.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* GitHub Pages serves the custom domain over plain http as well as
            https, without redirecting. The two are different origins, and only
            https://eestiroll.ee is in the backend's CORS allowlist — so anyone
            who reached the app over http (a saved http:// URL in the browser's
            history is enough) had every AI check die at the preflight: the
            POST never left the browser and the app could only report a generic
            network error. Hop to https before the bundle loads. Scoped to the
            production host so http dev servers aren't affected. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if(location.protocol==='http:'&&location.hostname==='eestiroll.ee'){location.replace('https://'+location.host+location.pathname+location.search+location.hash);}`,
          }}
        />
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
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#35529D" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="EestiRoll" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        <ScrollViewStyleReset />

        {/* iOS Safari doesn't scroll the page when an input is focused — the
            document can't scroll at all (the reset above sets
            body{overflow:hidden}), so WebKit pans the *visual viewport*
            instead, far enough to center the focused element even when it was
            already visible. That pan is what used to shove the title and the
            word cards off the top of the screen. It can't be cancelled, so
            instead the app root is pinned to the visible band: these two vars
            are driven from visualViewport by hooks/useViewportPin.ts, and
            because the screen's content is top-anchored, resizing the root
            moves nothing — the page stays put and the keyboard just covers
            the bottom. The defaults keep the static export correct until the
            hook mounts. */}
        <style>{`
          :root { --app-height: 100%; --app-top: 0px; }
          html, body { height: 100%; overflow: hidden; overscroll-behavior: none; }
          #root {
            position: fixed;
            left: 0;
            width: 100%;
            top: var(--app-top);
            height: var(--app-height);
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
