import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

// Height of the on-screen keyboard, 0 when hidden. On web this comes from
// `visualViewport` shrinking (RN's own Keyboard module has no show/hide
// events there — see its no-op implementation in react-native-web). On
// native it comes from the real keyboard show/hide events.
export function useKeyboardOffset(): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const vv = typeof window !== 'undefined' ? window.visualViewport : null;
      if (!vv) return;

      const handle = () => {
        const covered = window.innerHeight - vv.height - vv.offsetTop;
        setOffset(Math.max(0, Math.round(covered)));
      };
      vv.addEventListener('resize', handle);
      vv.addEventListener('scroll', handle);
      handle();
      return () => {
        vv.removeEventListener('resize', handle);
        vv.removeEventListener('scroll', handle);
      };
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (e) => setOffset(e.endCoordinates?.height ?? 0));
    const hideSub = Keyboard.addListener(hideEvent, () => setOffset(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return offset;
}
