import { FeedbackModal } from '@/components/FeedbackModal';
import { Icon } from '@/components/Icon';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SubscribeModal } from '@/components/SubscribeModal';
import { Theme } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { TranslationKey } from '@/utils/translations';
import { useTranslations } from '@/hooks/useTranslations';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

function SectionLabel({ label, theme }: { label: string; theme: Theme }) {
  return (
    <Text style={[styles.sectionLabel, { color: theme.iconInactive }]}>{label}</Text>
  );
}

function ListRow({
  icon,
  iconColor,
  text,
  theme,
  badge,
  badgeColor,
}: {
  icon: 'checkmark-circle' | 'time-outline';
  iconColor: string;
  text: string;
  theme: Theme;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <View style={styles.listRow}>
      <Icon name={icon} size={18} color={iconColor} />
      {/* Nested rather than a separate element, so the marker flows with the
          text and lands after its last word however the line wraps, instead
          of being parked somewhere the sentence is not. */}
      <Text style={[styles.listRowText, { color: theme.text }]}>
        {text}
        {badge ? (
          <Text style={[styles.listRowBadge, { color: badgeColor }]}>{'  ' + badge}</Text>
        ) : null}
      </Text>
    </View>
  );
}

function FeedbackListRow({
  text,
  theme,
  onPress,
}: {
  text: string;
  theme: Theme;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.listRow} onPress={onPress}>
      <Icon name="time-outline" size={18} color={theme.accent} />
      <Text style={[styles.listRowText, { color: theme.text }]}>{text}</Text>
      <Icon name="flag-outline" size={16} color={theme.iconInactive} />
    </Pressable>
  );
}

export default function AboutScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslations();
  const router = useRouter();
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [subscribeVisible, setSubscribeVisible] = useState(false);

  const features: TranslationKey[] = ['aboutFeature1', 'aboutFeature2', 'aboutFeature3', 'aboutFeature4', 'aboutFeature5', 'aboutFeature6'];
  // Carried over to the next release: whatever is still new gets marked here,
  // and the rest of the list stays untouched.
  const newFeatures = new Set<TranslationKey>(['aboutFeature4', 'aboutFeature5']);
  // #35529D is the same in both themes and disappears against the dark
  // background, the same reason the dice uses the lighter blue there.
  const badgeColor = isDark ? theme.lightblue : theme.accent;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenContainer title={t('about')} showBackButton>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Image
            source={require('@/assets/images/dice-static-small.png')}
            style={styles.avatar}
            resizeMode="contain"
          />
          <Text style={[styles.bio, { color: theme.text }]}>{t('aboutBio')}</Text>
        </View>

        <SectionLabel label={t('aboutFeaturesTitle')} theme={theme} />
        <View style={[styles.listGroup, { backgroundColor: theme.cardBackground }]}>
          {features.map((key, i) => (
            <View key={key}>
              <ListRow
                icon="checkmark-circle"
                iconColor={theme.green}
                text={t(key)}
                theme={theme}
                badge={newFeatures.has(key) ? t('badgeNew') : undefined}
                badgeColor={badgeColor}
              />
              {i < features.length - 1 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
            </View>
          ))}
        </View>

        <SectionLabel label={t('aboutRoadmapTitle')} theme={theme} />
        <View style={[styles.listGroup, { backgroundColor: theme.cardBackground }]}>
          {/* The sentence-to-translate row lived here until it shipped. What
              replaces it is whatever people ask for, which is what the row
              below is for. */}
          <FeedbackListRow text={t('aboutRoadmap2')} theme={theme} onPress={() => setFeedbackVisible(true)} />
        </View>

        <Pressable onPress={() => setSubscribeVisible(true)} style={styles.subscribeCta}>
          <Text style={[styles.subscribeCtaText, { color: theme.iconInactive }]}>{t('aboutSubscribeCta')}</Text>
        </Pressable>

        {/* English-only page aimed at teachers; not a translated app string. */}
        <Pressable onPress={() => router.push('/teachers')} style={styles.subscribeCta}>
          <Text style={[styles.subscribeCtaText, { color: theme.iconInactive }]}>For teachers</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/privacy')} style={styles.subscribeCta}>
          <Text style={[styles.subscribeCtaText, { color: theme.iconInactive }]}>{t('privacyPolicy')}</Text>
        </Pressable>

        <View style={{ height: 20 }} />
      </ScreenContainer>

      <FeedbackModal
        visible={feedbackVisible}
        onDismiss={() => setFeedbackVisible(false)}
        source="about"
      />

      <SubscribeModal
        visible={subscribeVisible}
        onDismiss={() => setSubscribeVisible(false)}
        onSubscribed={() => {}}
      />
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
    width: 53,
    height: 53,
    borderRadius: 16,
    marginBottom: 16,
  },
  bio: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 20,
  },
  listGroup: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  // Weight rather than a font family: nothing else in this file sets one, so
  // the rows are on the system face and a family here would stand out as a
  // different typeface rather than as emphasis.
  listRowBadge: {
    fontWeight: '700',
  },
  listRowText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginLeft: 42,
  },
  subscribeCta: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  subscribeCtaText: {
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
