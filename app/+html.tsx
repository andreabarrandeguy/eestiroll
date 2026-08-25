import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

const APP_URL = 'https://andreabarrandeguy.github.io/eestiroll/';
const OG_IMAGE_URL = `${APP_URL}og-image.png`;
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
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Actual <title> is set per-route via expo-router/head in app/_layout.tsx */}
        <meta name="description" content={DESCRIPTION} />

        <meta property="og:title" content="EestiRoll" />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content={OG_IMAGE_URL} />
        {/* Width/height/type are unnecessary per spec, but WhatsApp's crawler is
            known to silently skip rendering the image without them. */}
        <meta property="og:image:width" content="1024" />
        <meta property="og:image:height" content="1024" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:url" content={APP_URL} />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="EestiRoll" />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE_URL} />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
