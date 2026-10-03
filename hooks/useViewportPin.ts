import { useEffect } from 'react';
import { Platform } from 'react-native';

// Keeps the app root pinned to the visible band of the screen on web.
//
// The document can't scroll (expo-router's ScrollViewStyleReset sets
// body{overflow:hidden} + height:100%), so when iOS Safari focuses an input it
// doesn't scroll the page — it *pans the visual viewport* instead, and it pans
// far enough to center the focused element even when that element was already
// visible. There's no API to undo that pan, which is why both the
// position:fixed and the body-transform attempts failed: the only thing that
// works is moving the app along with it.
//
// `visualViewport.offsetTop` is where the visible band starts (in layout
// viewport coordinates, which is what position:fixed is relative to) and
// `.height` is how tall it is, so writing those two into the CSS vars that
// #root is sized by (see app/+html.tsx) makes the app cover exactly the
// visible band. Since the home screen's content is top-anchored, shrinking it
// moves nothing — the page just stays put with the keyboard over the bottom.
export function useViewportPin() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.visualViewport) return;

    const vv = window.visualViewport;
    const root = document.documentElement;

    const reset = () => {
      root.style.setProperty('--app-height', '100%');
      root.style.setProperty('--app-top', '0px');
    };

    const apply = () => {
      // Pinch-zoom shrinks and pans the visual viewport too. Pinning there
      // would fight the user's own zoom, so stand down above 1x.
      if (vv.scale > 1.01) {
        reset();
        return;
      }
      // Height only. Following offsetTop as well is what used to leave #root
      // offset from the visible band for a frame — the white flash — and it is
      // no longer needed now that the screen scrolls: the browser reveals the
      // input by scrolling that container, so it has no reason to pan.
      root.style.setProperty('--app-height', `${vv.height}px`);
      // Safari is also known to scroll an overflow:hidden document on focus.
      if (window.scrollY !== 0) window.scrollTo(0, 0);
    };

    apply();
    vv.addEventListener('resize', apply);
    vv.addEventListener('scroll', apply);
    return () => {
      vv.removeEventListener('resize', apply);
      vv.removeEventListener('scroll', apply);
      root.style.removeProperty('--app-height');
      root.style.removeProperty('--app-top');
    };
  }, []);
}
