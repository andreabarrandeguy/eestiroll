import { HowItWorksModal } from '@/components/HowItWorksModal';
import { Icon } from '@/components/Icon';
import { Fonts } from '@/constants/Fonts';
import { useRandom } from '@/contexts/RandomContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useKeyboardOffset } from '@/hooks/useKeyboardOffset';
import { useTranslations } from '@/hooks/useTranslations';
import { EVENTS, track } from '@/services/analytics';
import { BlurView } from 'expo-blur';
import { Tabs, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Each theme carries its own strength rather than the two sharing one number.
// A dark blue on a light background loses contrast far faster than a light
// blue does on a near-black one, so the alphas that read clearly in dark mode
// left the rings all but invisible in light.
const BLOOM = {
  dark: { rgb: '144,169,228', ring: 0.55, glow: 0.4, glowMid: 0.12 },  // theme.lightblue
  light: { rgb: '53,82,157', ring: 0.95, glow: 0.22, glowMid: 0.07 },  // theme.accent
};
type Bloom = typeof BLOOM.dark;

// A soft bloom under the dice, so the rings read as light coming off the
// button rather than two wireframe circles drawn around it. React Native has
// no radial gradient, but react-native-web passes backgroundImage straight
// through to CSS; everywhere else this degrades to a flat translucent disc,
// which is the same idea with harder edges.
const glowStyle = (b: Bloom) =>
  Platform.OS === 'web'
    ? ({
        backgroundImage:
          'radial-gradient(circle, rgba(' + b.rgb + ',' + b.glow + ') 0%, rgba(' + b.rgb + ',' +
          b.glowMid + ') 45%, rgba(' + b.rgb + ',0) 70%)',
      } as any)
    : ({ backgroundColor: 'rgba(' + b.rgb + ',' + b.glowMid + ')' } as any);

// The rings themselves are painted rather than stroked. A border is a hard
// edge at both of its sides, which is what made them read as drawn circles
// sitting on the screen instead of light leaving the dice. This is the same
// band of colour with nothing to catch the eye at its edges: transparent until
// 70% of the way out, strongest at 80%, gone again by 90%. `closest-side`
// pins those percentages to the box's half-width, so the band sits at a
// radius we can reason about rather than at a fraction of the diagonal.
//
// Native keeps the stroke, there being no gradient to fall back on.
const ringStyle = (b: Bloom) =>
  Platform.OS === 'web'
    ? ({
        backgroundImage:
          'radial-gradient(circle closest-side, rgba(' + b.rgb + ',0) 70%, rgba(' + b.rgb + ',' +
          b.ring + ') 80%, rgba(' + b.rgb + ',0) 90%)',
      } as any)
    : ({ borderWidth: 1.5, borderColor: 'rgba(' + b.rgb + ',' + b.ring + ')' } as any);

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { triggerRandom, randomTrigger, feedbackOpen } = useRandom();
  const { theme, isDark } = useTheme();
  const { t } = useTranslations();
  const insets = useSafeAreaInsets();
  const keyboardOffset = useKeyboardOffset();
  const [shakeAnim] = useState(() => new Animated.Value(0));
  // One clock for the whole bloom: the glow and both rings read their own
  // stretch of it, which is what keeps them a quarter-beat apart without
  // three animations to keep in step.
  const [pulse] = useState(() => new Animated.Value(0));
  const idleLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const [howItWorksVisible, setHowItWorksVisible] = useState(false);

  // Before the first roll, gently wiggle the dice every couple seconds to
  // draw attention to it as the button to press. A bloom spreads out of it on
  // the same beat — the same tap-ripple the tutorial's first step uses, so
  // what the tutorial demonstrates and what the screen does are one gesture.
  useEffect(() => {
    if (randomTrigger > 0) return;

    const NATIVE = Platform.OS !== 'web';
    const loop = Animated.loop(
      Animated.sequence([
        // Roughly every two seconds rather than every three and a half: at the
        // old pace the dice sat still long enough that someone glancing at the
        // screen could easily never see it move.
        Animated.delay(400),
        // Animated.loop resets the animation, not the values it drove, so the
        // clock has to be sent back to zero by hand or the second iteration
        // starts from where the first one ended.
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: NATIVE }),
        Animated.parallel([
          // Deliberately linear. Each ring slows down on its own, inside its
          // own interpolation (see DiceRipple) — an easing here would bend the
          // glow and both rings by one curve and leave the trailing ring
          // crawling out of step with the one ahead of it.
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1300,
            easing: Easing.linear,
            useNativeDriver: NATIVE,
          }),
          Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: NATIVE }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: NATIVE }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: NATIVE }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: NATIVE }),
          ]),
        ]),
        Animated.delay(400),
      ])
    );
    idleLoopRef.current = loop;
    loop.start();

    return () => {
      loop.stop();
      shakeAnim.setValue(0);
      pulse.setValue(0);
    };
  }, [randomTrigger, shakeAnim, pulse]);

  // Pressing the dice tab button does double duty as a tab and as the "roll"
  // action. If the dice tab isn't focused yet, this press is just navigation
  // back to it — don't roll new words and wipe whatever the user had going.
  // Only an actual press while already on that screen should roll. Checked
  // via usePathname() (re-read fresh on every render) rather than a focus
  // prop from the tab bar, since that prop is captured once and goes stale.
  const handleDicePress = () => {
    if (pathname !== '/') {
      router.push('/');
      return;
    }

    idleLoopRef.current?.stop();
    track(EVENTS.ROLL, { source: 'tab_button' });
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    // One frame later: rolling rebuilds most of the screen, and doing that
    // synchronously inside the touch's own event means the DOM changes under a
    // gesture the browser has not finished reporting.
    requestAnimationFrame(() => triggerRandom());
  };

  const DiceImage = () => (
    <Animated.View
      style={{
        transform: [{
          rotate: shakeAnim.interpolate({
            inputRange: [-10, 10],
            outputRange: ['-10deg', '10deg']
          })
        }]
      }}
    >
      <Image
        source={require('@/assets/images/dice-static-small.png')}
        style={styles.diceImage}
        resizeMode="contain"
      />
    </Animated.View>
  );

  // Before the first roll the dice is the only thing to press, so a ripple
  // marks it — the hand-drawn arrow that used to point at it does not fit the
  // step scaffold that replaced the old empty state.
  //
  // A single hard ring that held full strength the whole way out and then
  // blinked off read as a circle being switched on and off. A wave is
  // brightest where it is born and fainter the further it travels, so: each
  // ring fades continuously across its whole trip, two of them run a quarter
  // beat apart so there is always something in flight, and a soft bloom
  // underneath keeps them from reading as bare outlines. They are also born at
  // the dice's own edge now — 0.85 of a 100px box against an 83px dice -
  // rather than at 0.7, which started them hidden underneath it.
  const DiceRipple = () => {
    // #35529D on #0A0A0A is too dark to register, the same reason the step
    // numbers moved off the accent in dark mode.
    const bloom = isDark ? BLOOM.dark : BLOOM.light;
    // Never unmounted — removing a child of the element being pressed is what
    // left react-native-web's touch bookkeeping without the touch it was
    // tracking. Held at zero opacity instead.
    const live = showFirstRollCues;

    const ring = (from: number, to: number, peak: number) => ({
      opacity: live
        ? pulse.interpolate({
            inputRange: [from, from + 0.05, to],
            outputRange: [0, peak, 0],
            extrapolate: 'clamp' as const,
          })
        : 0,
      transform: [
        {
          scale: pulse.interpolate({
            // Quick out of the gate and slowing as it widens: the shape of
            // something spending its energy, which a straight line is not.
            inputRange: [from, from + 0.12, from + 0.3, to],
            outputRange: [0.85, 1.25, 1.5, 1.7],
            extrapolate: 'clamp' as const,
          }),
        },
      ],
    });

    return (
      <>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.diceGlow,
            glowStyle(bloom),
            {
              opacity: live
                ? pulse.interpolate({
                    inputRange: [0, 0.1, 0.55],
                    outputRange: [0, 1, 0],
                    extrapolate: 'clamp' as const,
                  })
                : 0,
              transform: [
                {
                  scale: pulse.interpolate({
                    inputRange: [0, 0.55],
                    outputRange: [0.9, 1.3],
                    extrapolate: 'clamp' as const,
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[styles.diceRipple, ringStyle(bloom), ring(0, 0.58, 0.9)]}
        />
        <Animated.View
          pointerEvents="none"
          style={[styles.diceRipple, ringStyle(bloom), ring(0.26, 0.84, 0.55)]}
        />
      </>
    );
  };

  const TabIcon = ({ name, focused }: { name: 'settings-outline' | 'time-outline'; focused: boolean }) => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.webIconContainer}>
          <Icon
            name={name}
            size={32}
            color={focused ? theme.accent : theme.text}
          />
        </View>
      );
    }
    
    return (
      <BlurView
        intensity={60}
        tint={isDark ? 'dark' : 'light'}
        style={styles.blurContainer}
      >
        <View style={styles.iconContainer}>
          <Icon
            name={name}
            size={40}
            color={focused ? theme.accent : theme.text}
          />
        </View>
      </BlurView>
    );
  };

  // Shown only on the dice tab, before the first roll — same condition
  // HomeScreen uses to decide between a step's preview and its content
  // (randomTrigger stays 0 in lockstep with useRandomWords' refreshKey, since
  // both only advance off the same triggerRandom() call).
  const showFirstRollCues = pathname === '/' && randomTrigger === 0;

  return (
    <View style={{ flex: 1 }}>
    <Tabs
      sceneContainerStyle={{ backgroundColor: theme.background }}
      screenOptions={{
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.text,
        tabBarStyle: {
          position: 'absolute',
          // The feedback view owns the screen and carries its own actions, so
          // the bar stays out of the way for all of it: during the wait there
          // is nothing useful to press and the dice would abandon the request,
          // and once the answer is up the dice only competes with the explicit
          // "continue learning" button.
          ...(feedbackOpen && { display: 'none' }),
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'web' ? 90 : 90 + insets.bottom,
          elevation: 0,
          boxShadow: 'none',
          // The bar's own box is mostly transparent padding around the three
          // small icons, but by default it still captures every touch that
          // lands anywhere inside its (large) bounding box — including
          // scroll/swipe gestures meant for content underneath, like the
          // tail end of a long AI feedback response. 'box-none' lets empty
          // space pass touches through while the icon buttons stay tappable.
          pointerEvents: 'box-none',
          ...(Platform.OS === 'web' && {
            maxWidth: 500,
            width: '100%',
            alignSelf: 'center',
            left: 0,
            right: 0,
            marginHorizontal: 'auto',
            // The root is pinned to the visible viewport (see
            // hooks/useViewportPin.ts), so with the keyboard up this bar would
            // otherwise ride right on top of it, squeezed against the sentence
            // input. Native apps hide the tab bar while typing; do the same.
            ...(keyboardOffset > 0 && { display: 'none' }),
          }),
        },
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        headerShown: false,
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="config"
        options={{
          title: 'Config',
          tabBarIcon: ({ focused }) => <TabIcon name="settings-outline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={
          Platform.OS === 'web'
            ? {
                title: '',
                tabBarButton: () => (
                  <View style={styles.diceWrapperWeb}>
                    <TouchableOpacity
                      onPress={handleDicePress}
                      activeOpacity={0.7}
                      style={styles.diceButtonWeb}
                    >
                      <DiceRipple />
                      <DiceImage />
                    </TouchableOpacity>
                  </View>
                ),
              }
            : {
                title: '',
                tabBarIcon: () => (
                  <View style={styles.diceButtonMobile}>
                    <DiceRipple />
                    <DiceImage />
                  </View>
                ),
                tabBarButton: (props) => (
                  <Pressable {...props} onPress={handleDicePress} />
                ),
              }
        }
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => <TabIcon name="time-outline" focused={focused} />,
        }}
      />
    </Tabs>

      {showFirstRollCues && (
        <TouchableOpacity
          onPress={() => { track(EVENTS.HOW_IT_WORKS_OPENED); setHowItWorksVisible(true); }}
          style={[styles.howItWorksLinkBelowDice, { bottom: Platform.OS === 'web' ? 2 : insets.bottom + 2 }]}
        >
          <Text style={[styles.howItWorksLinkText, { color: theme.iconInactive }]}>{t('howItWorksLink')}</Text>
        </TouchableOpacity>
      )}

      <HowItWorksModal
        visible={howItWorksVisible}
        onDismiss={() => setHowItWorksVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diceWrapperWeb: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diceButtonWeb: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  diceButtonMobile: {
    width: 80,
    height: 80,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 35,
    // Android renders `elevation` as an opaque box unless the view has an
    // explicit (transparent) background — without this it shows up as a
    // plain white square behind the dice.
    backgroundColor: 'transparent',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.3)',
    elevation: 8,
  },
  diceImage: {
    width: 83,
    height: 83,
  },
  // Rendered as a sibling after <Tabs>, not inside it — the tab bar's own
  // (invisible) view swallows touches anywhere within its box, including
  // its bottom padding, so a link placed underneath it via HomeScreen was
  // never actually clickable there.
  howItWorksLinkBelowDice: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 8,
  },
  howItWorksLinkText: {
    fontSize: 13,
    textDecorationLine: 'underline',
    fontFamily: Fonts.bodyRegular,
  },
  // 125 rather than 100 because the band sits at 80% of the half-width: 50px
  // out from the centre, which is where the stroke used to be. The scales the
  // rings travel through are unchanged, so they still begin at the dice's edge
  // and end well clear of it.
  diceRipple: {
    position: 'absolute',
    width: 125,
    height: 125,
    borderRadius: 62.5,
  },
  diceGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
});