import { ScreenContainer } from '@/components/ScreenContainer';
import { AVAILABLE_LANGUAGES, useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LanguageScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslations();

  const handleLanguageSelect = (languageCode: string) => {
    setLanguage(languageCode as any);
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenContainer title={t('language')} showBackButton>
        <View style={[styles.languageGroup, { backgroundColor: theme.cardBackground }]}>
          {AVAILABLE_LANGUAGES.map((lang, index) => (
            <View key={lang.code}>
              <TouchableOpacity 
                style={styles.languageRow}
                onPress={() => handleLanguageSelect(lang.code)}
                activeOpacity={0.7}
              >
                <View style={styles.languageLeft}>
                  <Text style={[styles.languageLabel, { color: theme.text }]}>
                    {lang.nativeName}
                  </Text>
                  <Text style={[styles.languageSubLabel, { color: theme.text, opacity: 0.6 }]}>
                    {lang.name}
                  </Text>
                </View>
                {language === lang.code && (
                  <Ionicons name="checkmark" size={24} color={theme.yellow} />
                )}
              </TouchableOpacity>
              {index < AVAILABLE_LANGUAGES.length - 1 && (
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
              )}
            </View>
          ))}
        </View>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  languageGroup: {
    borderRadius: 12,
    overflow: 'hidden'
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  languageLeft: {
    flex: 1
  },
  languageLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  languageSubLabel: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginLeft: 16
  }
});