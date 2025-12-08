import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { loadTranslations } from '@/components/WordCard';
import { CategoryProvider } from '@/contexts/CategoryContext';
import { HistoryProvider } from '@/contexts/HistoryContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { RandomProvider } from '@/contexts/RandomContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { loadWordsFromAPI } from '@/utils/wordHelpers';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    prepare();
  }, []);

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={prepare}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#EFC320" />
        <Text style={styles.loadingText}>Loading content...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <RandomProvider>
          <CategoryProvider>
            <HistoryProvider>
              <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack>
                <StatusBar style="auto" />
              </NavigationThemeProvider>
            </HistoryProvider>
          </CategoryProvider>
        </RandomProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    padding: 20,
  },
  loadingText: {
    color: '#F2F2F2',
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