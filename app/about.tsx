import { ScreenContainer } from '@/components/ScreenContainer';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Stack } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function AboutScreen() {
  const { theme } = useTheme();
  const { t } = useTranslations();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenContainer title={t('about')} showBackButton>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.avatar}
            resizeMode="contain"
          />

          {/* TODO: swap this placeholder for the real bio (who's behind the app, why it exists, links) */}
          <Text style={[styles.bio, { color: theme.text }]}>
            Hi, I&apos;m the person behind EestiRoll. Replace this paragraph with your own
            story — why you built the app, what it&apos;s for, and anything else you&apos;d
            like people to know.
          </Text>
        </View>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: 16,
  },
  bio: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
