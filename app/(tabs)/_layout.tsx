import { HowItWorksModal } from '@/components/HowItWorksModal';
import { Icon } from '@/components/Icon';
import { Fonts } from '@/constants/Fonts';
import { useRandom } from '@/contexts/RandomContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from '@/hooks/useTranslations';
import { EVENTS, track } from '@/services/analytics';
import { BlurView } from 'expo-blur';
import { Tabs, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { triggerRandom, randomTrigger } = useRandom();
  const { theme, isDark } = useTheme();
  const { t } = useTranslations();
  const insets = useSafeAreaInsets();
  const [shakeAnim] = useState(() => new Animated.Value(0));
  const idleLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const [howItWorksVisible, setHowItWorksVisible] = useState(false);

  // Before the first roll, gently wiggle the dice every couple seconds to
  // draw attention to it as the button to press.
  useEffect(() => {
    if (randomTrigger > 0) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(1400),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
        Animated.delay(1800),
      ])
    );
    idleLoopRef.current = loop;
    loop.start();

    return () => {
      loop.stop();
      shakeAnim.setValue(0);
    };
  }, [randomTrigger, shakeAnim]);

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

    triggerRandom();
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
  // HomeScreen uses for its own pre-roll hint (randomTrigger stays 0 in
  // lockstep with useRandomWords' refreshKey, since both only advance off
  // the same triggerRandom() call).
  const showHowItWorksLink = pathname === '/' && randomTrigger === 0;

  return (
    <View style={{ flex: 1 }}>
    <Tabs
      sceneContainerStyle={{ backgroundColor: theme.background }}
      screenOptions={{
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.text,
        tabBarStyle: {
          position: 'absolute',
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
                      <DiceImage />
                    </TouchableOpacity>
                  </View>
                ),
              }
            : {
                title: '',
                tabBarIcon: () => (
                  <View style={styles.diceButtonMobile}>
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

      {showHowItWorksLink && (
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
});