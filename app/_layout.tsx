import { Ionicons } from '@expo/vector-icons';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { Monomakh_400Regular } from '@expo-google-fonts/monomakh';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { PostHogProvider, usePostHog } from 'posthog-react-native';
import 'react-native-reanimated';

import { loadTranslations } from '@/components/WordCard';
import { AuthProvider } from '@/contexts/AuthContext';
import { CategoryProvider } from '@/contexts/CategoryContext';
import { HistoryProvider } from '@/contexts/HistoryContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { RandomProvider } from '@/contexts/RandomContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Fonts } from '@/constants/Fonts';
import { ThemeMode } from '@/constants/Colors';
import { setPostHogInstance } from '@/services/analytics';
import { StorageService } from '@/services/storage';
import { loadWordsFromAPI } from '@/utils/wordHelpers';
import { useEffect, useState } from 'react';
import { Animated, Easing, Image, Platform, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

// The native animated module doesn't exist on web — requesting it there just
// prints a noisy fallback warning on every animation.
const NATIVE_DRIVER = Platform.OS !== 'web';

const SpinningDice = () => {
  const [spin] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: NATIVE_DRIVER })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Image
        source={require('@/assets/images/dice-static-small.png')}
        style={styles.bootDice}
        resizeMode="contain"
        fadeDuration={0}
      />
    </Animated.View>
  );
};

function AnalyticsInitializer() {
  const posthog = usePostHog();
  useEffect(() => {
    if (posthog) {
      setPostHogInstance(posthog);
    }
  }, [posthog]);
  return null;
}

// html/body are pinned with position:fixed (see app/+html.tsx) so the
// document itself can't scroll — but iOS WebKit still pans the *visual
// viewport* (a separate concept from the layout viewport position:fixed
// is relative to) to bring a focused input into view, which is what was
// cropping content above the fold when a TextInput got focused.
// visualViewport.offsetTop is exactly that pan amount, so counteracting
// it with an equal-and-opposite translateY on the body cancels it out.
function ViewportPinFix() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.visualViewport) return;
    const vv = window.visualViewport;
    const counteract = () => {
      document.body.style.transform = vv.offsetTop ? `translateY(${-vv.offsetTop}px)` : '';
    };
    vv.addEventListener('resize', counteract);
    vv.addEventListener('scroll', counteract);
    return () => {
      vv.removeEventListener('resize', counteract);
      vv.removeEventListener('scroll', counteract);
      document.body.style.transform = '';
    };
  }, []);
  return null;
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedThemeMode, setSavedThemeMode] = useState<ThemeMode | null>(null);
  const colorScheme = useColorScheme();
  // Prefer the theme the user picked in-app (Config > Dark Mode) once it's
  // loaded from storage; ThemeProvider itself doesn't mount until after this
  // boot screen, so without this the loading screen ignored that choice and
  // just followed the OS-level color scheme instead.
  const isDarkBoot = savedThemeMode ? savedThemeMode === 'dark' : colorScheme !== 'light';
  const bootBackground = isDarkBoot ? '#0A0A0A' : '#F2F2F2';
  const bootText = isDarkBoot ? '#F2F2F2' : '#0A0A0A';

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Monomakh_400Regular,
  });

  const prepare = async () => {
    try {
      setError(null);
      await Promise.all([
        loadWordsFromAPI(),
        loadTranslations()
      ]);
      setIsReady(true);
    } catch (e) {
      console.error('Error loading content:', e);
      setError('Failed to load content. Please check your connection.');
    }
  };

  useEffect(() => {
    // One-time content fetch on mount; prepare() is also reused as the Retry
    // button's handler, so it can't be restructured to avoid the indirection.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    prepare();
  }, []);

  useEffect(() => {
    // Kept separate from prepare() so the boot screen can pick up the right
    // colors as soon as this resolves, without waiting on the (potentially
    // much slower, network-bound) word/translation fetch.
    StorageService.loadTheme().then((mode) => {
      setSavedThemeMode(mode);
    });
  }, []);

  const pageTitle = (
    <Head>
      <title>EestiRoll</title>
    </Head>
  );

  if (error) {
    return (
      <>
        {pageTitle}
        <View style={[styles.centerContainer, { backgroundColor: bootBackground }]}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={prepare}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  if (!isReady || !fontsLoaded) {
    return (
      <>
        {pageTitle}
        <View style={[styles.centerContainer, { backgroundColor: bootBackground }]}>
          <SpinningDice />
          <Text style={[styles.loadingText, { color: bootText }]}>Loading content...</Text>
        </View>
      </>
    );
  }

  const appContent = (
    <>
      {pageTitle}
      <ViewportPinFix />
      <ThemeProvider>
      <AuthProvider>
      <LanguageProvider>
        <RandomProvider>
          <CategoryProvider>
            <HistoryProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
              <StatusBar style="auto" />
            </HistoryProvider>
          </CategoryProvider>
        </RandomProvider>
      </LanguageProvider>
      </AuthProvider>
      </ThemeProvider>
    </>
  );

  if (!POSTHOG_API_KEY) {
    console.warn('PostHog API key not set. Analytics disabled.');
    return appContent;
  }

  return (
    <PostHogProvider
      apiKey={POSTHOG_API_KEY}
      options={{
        host: POSTHOG_HOST,
        captureAppLifecycleEvents: true,
        disableGeoip: true,
      }}
      autocapture={{
        captureScreens: false,
        captureTouches: false,
      }}
    >
      <AnalyticsInitializer />
      {appContent}
    </PostHogProvider>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  bootDice: {
    width: 40,
    height: 40,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontFamily: Fonts.bodyMedium,
  },
  errorText: {
    color: '#E95A35',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: Fonts.bodyMedium,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#35529D',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.bodyBold,
  },
});