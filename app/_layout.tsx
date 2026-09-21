import { Ionicons } from '@expo/vector-icons';
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
import { setPostHogInstance } from '@/services/analytics';
import { loadWordsFromAPI } from '@/utils/wordHelpers';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

function AnalyticsInitializer() {
  const posthog = usePostHog();
  useEffect(() => {
    if (posthog) {
      setPostHogInstance(posthog);
    }
  }, [posthog]);
  return null;
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDarkBoot = colorScheme !== 'light';
  const bootBackground = isDarkBoot ? '#0A0A0A' : '#F2F2F2';
  const bootText = isDarkBoot ? '#F2F2F2' : '#0A0A0A';

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
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
          <ActivityIndicator size="large" color="#EFC320" />
          <Text style={[styles.loadingText, { color: bootText }]}>Loading content...</Text>
        </View>
      </>
    );
  }

  const appContent = (
    <>
      {pageTitle}
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
  loadingText: {
    marginTop: 20,
    fontSize: 16,
  },
  errorText: {
    color: '#E95A35',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#EFC320',
    borderRadius: 8,
  },
  retryText: {
    color: '#0A0A0A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});