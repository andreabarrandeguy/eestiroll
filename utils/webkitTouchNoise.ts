import { Platform } from 'react-native';

/**
 * Silences one false alarm react-native-web prints on iOS, and nothing else.
 *
 * ## What the message is
 *
 * `Cannot find single active touch.` — a development-only console.error from
 * the library's own ResponderTouchHistoryStore. It is not in the production
 * bundle, so it never reached anyone using the site; it only ever made the dev
 * console look broken.
 *
 * ## Why it fires
 *
 * Captured from a real occurrence on an iPhone, with taps in quick succession:
 *
 *   +37300ms  touchstart  touches=[1434216171]  changed=[1434216171]
 *   +37457ms  touchend    touches=[1434216172]  changed=[1434216171]
 *   +37461ms  touchstart  touches=[1434216172]  changed=[1434216172]
 *
 * On the `touchend`, WebKit already lists the *next* touch as active, four
 * milliseconds before it dispatches that touch's `touchstart`. The library
 * reads `touches.length === 1`, goes looking for the active touch in its
 * records, and finds nothing — the touch it is being told about has not
 * started yet as far as it knows. So it reports a broken invariant that is
 * really just WebKit getting ahead of itself.
 *
 * It takes one finger, not two: every `changedTouches` above has a single
 * entry. Tapping fast enough that one gesture begins while the last is ending
 * is all it needs, which is why it turned up while editing a sentence.
 *
 * The library is not built for these identifiers either. iOS hands out large,
 * monotonically increasing ones (1434216171 above) and never recycles them,
 * while the store indexes a flat array by identifier and warns above
 * MAX_TOUCH_BANK = 20. The resulting array is nominally a billion entries
 * long. That reads alarming, and a full scan of one takes 48 seconds in Node —
 * but the four milliseconds between the two events above are measured on the
 * device, so JavaScriptCore is plainly not walking it. Noise, not a stall.
 *
 * ## Why suppressing rather than fixing
 *
 * The bug is in react-native-web, in a branch guarded by `__DEV__`, with no
 * consequence beyond the log line. Patching the library through patch-package
 * to quiet a cosmetic dev warning costs more than it returns. If it ever stops
 * being cosmetic — a real stall, or the same message in production — this is
 * the note to come back to.
 *
 * Deliberately narrow: it matches that one string, in development, on web, and
 * leaves every other console.error alone.
 */

const MESSAGE = 'Cannot find single active touch';

export function silenceWebKitTouchNoise() {
  if (Platform.OS !== 'web' || !__DEV__) return;
  if (typeof window === 'undefined') return;
  // Hot reload re-runs this module, and wrapping a wrapper would stack up.
  if ((window as any).__webkitTouchNoiseSilenced) return;
  (window as any).__webkitTouchNoiseSilenced = true;

  const original = console.error;
  console.error = function (...args: unknown[]) {
    if (typeof args[0] === 'string' && args[0].includes(MESSAGE)) return;
    original.apply(console, args as []);
  };
}
