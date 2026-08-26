import { FeedbackModal } from '@/components/FeedbackModal';
import { Icon } from '@/components/Icon';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SubscribeModal } from '@/components/SubscribeModal';
import { Theme } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { TranslationKey } from '@/utils/translations';
import { useTranslations } from '@/hooks/useTranslations';
import { Stack } from 'expo-router';
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
}: {
  icon: 'checkmark-circle' | 'time-outline';
  iconColor: string;
  text: string;
  theme: Theme;
}) {
  return (
    <View style={styles.listRow}>
      <Icon name={icon} size={18} color={iconColor} />
      <Text style={[styles.listRowText, { color: theme.text }]}>{text}</Text>
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
      <Icon name="time-outline" size={18} color={theme.yellow} />
      <Text style={[styles.listRowText, { color: theme.text }]}>{text}</Text>
      <Icon name="flag-outline" size={16} color={theme.iconInactive} />
    </Pressable>
  );
}

export default function AboutScreen() {
  const { theme } = useTheme();
  const { t } = useTranslations();
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [subscribeVisible, setSubscribeVisible] = useState(false);

  const features: TranslationKey[] = ['aboutFeature1', 'aboutFeature2', 'aboutFeature3', 'aboutFeature4'];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenContainer title={t('about')} showBackButton>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Image
            source={require('@/assets/images/dice-static.png')}
            style={styles.avatar}
            resizeMode="contain"
          />
          <Text style={[styles.bio, { color: theme.text }]}>{t('aboutBio')}</Text>
        </View>

        <SectionLabel label={t('aboutFeaturesTitle')} theme={theme} />
        <View style={[styles.listGroup, { backgroundColor: theme.cardBackground }]}>
          {features.map((key, i) => (
            <View key={key}>
              <ListRow icon="checkmark-circle" iconColor={theme.green} text={t(key)} theme={theme} />
              {i < features.length - 1 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
            </View>
          ))}
        </View>

        <SectionLabel label={t('aboutRoadmapTitle')} theme={theme} />
        <View style={[styles.listGroup, { backgroundColor: theme.cardBackground }]}>
          <ListRow icon="time-outline" iconColor={theme.yellow} text={t('aboutRoadmap1')} theme={theme} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <FeedbackListRow text={t('aboutRoadmap2')} theme={theme} onPress={() => setFeedbackVisible(true)} />
        </View>

        <Pressable onPress={() => setSubscribeVisible(true)} style={styles.subscribeCta}>
          <Text style={[styles.subscribeCtaText, { color: theme.iconInactive }]}>{t('aboutSubscribeCta')}</Text>
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
    width: 64,
    height: 64,
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
