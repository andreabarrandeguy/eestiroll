import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleProp, ViewStyle } from 'react-native';

// The native animated module doesn't exist on web — requesting it there just
// prints a noisy fallback warning on every animation.
const NATIVE_DRIVER = Platform.OS !== 'web';

interface SkeletonLineProps {
  width?: number | string;
  height?: number;
  style?: StyleProp<ViewStyle>;
  /**
   * The pulse says "something is on its way". Pass false where the bar is
   * standing in for content that nothing is fetching — the previews on the
   * home screen, which are a drawing of what a step will hold, not a wait.
   * A pulsing bar there reads as loading, or as broken.
   */
  animated?: boolean;
}

export function SkeletonLine({
  width = '100%',
  height = 16,
  style = {},
  animated = true,
}: SkeletonLineProps) {
  const [opacity] = useState(() => new Animated.Value(animated ? 0.3 : 0.22));

  useEffect(() => {
    if (!animated) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: NATIVE_DRIVER,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: NATIVE_DRIVER,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animated, opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: 6,
          backgroundColor: '#888',
          opacity,
          marginVertical: 4,
        },
        style,
      ]}
    />
  );
}
