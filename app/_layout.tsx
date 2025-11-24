import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { CategoryProvider } from '@/contexts/CategoryContext';
import { HistoryProvider } from '@/contexts/HistoryContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { RandomProvider } from '@/contexts/RandomContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

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