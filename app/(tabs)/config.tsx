import { FeedbackModal } from '@/components/FeedbackModal';
import { Icon } from '@/components/Icon';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Theme } from '@/constants/Colors';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from '@/hooks/useTranslations';
import { EVENTS, track } from '@/services/analytics';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Share, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

const APP_SHARE_URL = 'https://andreabarrandeguy.github.io/eestiroll/';

function SettingRow({
  icon,
  label,
  onPress,
  rightComponent,
  theme
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  theme: Theme;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Icon name={icon} size={22} color={theme.text} />
        </View>
        <Text style={[styles.settingLabel, { color: theme.text }]}>{label}</Text>
      </View>
      {rightComponent}
    </TouchableOpacity>
  );
}

function SectionLabel({ label, theme, first }: { label: string; theme: Theme; first?: boolean }) {
  return (
    <Text style={[styles.sectionLabel, { color: theme.iconInactive, marginTop: first ? 0 : 20 }]}>{label}</Text>
  );
}

export default function ConfigScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { currentLanguageOption } = useLanguage();
  const { t } = useTranslations();
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  const handleCategoriesPress = () => {
    router.push('/categories');
  };

  const handleLanguagePress = () => {
    router.push('/language');
  };

  const handleAboutPress = () => {
    router.push('/about');
  };

  const handleShare = async () => {
    track(EVENTS.SHARE, { source: 'config' });
    const shareText = `${t('shareMessage')} ${APP_SHARE_URL}`;

    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({ title: 'EestiRoll', text: shareText });
        } catch {
          // User dismissed the share sheet — nothing to do
        }
      } else {
        await Clipboard.setStringAsync(APP_SHARE_URL);
        window.alert(t('copied'));
      }
      return;
    }

    // Pass the URL only inside `message` — adding a separate `url` field too
    // duplicates the link in the composed share on iOS.
    await Share.share({ message: shareText });
  };

  return (
    <ScreenContainer title={t('configuration')}>
      <SectionLabel label={t('sectionApp')} theme={theme} first />
      <View style={[styles.settingsGroup, { backgroundColor: theme.cardBackground }]}>
        <SettingRow
          icon="grid-outline"
          label={t('categories')}
          onPress={handleCategoriesPress}
          theme={theme}
          rightComponent={
            <Icon name="chevron-forward" size={20} color={theme.iconInactive} />
          }
        />

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <SettingRow
          icon="moon-outline"
          label={t('darkMode')}
          theme={theme}
          rightComponent={
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor='#f4f3f4'
            />
          }
        />

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <SettingRow
          icon="language-outline"
          label={t('language')}
          onPress={handleLanguagePress}
          theme={theme}
          rightComponent={
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: theme.iconInactive }]}>
                {currentLanguageOption.nativeName}
              </Text>
              <Icon name="chevron-forward" size={20} color={theme.iconInactive} />
            </View>
          }
        />
      </View>

      <SectionLabel label={t('sectionOther')} theme={theme} />
      <View style={[styles.settingsGroup, { backgroundColor: theme.cardBackground }]}>
        <SettingRow
          icon="share-outline"
          label={t('share')}
          onPress={handleShare}
          theme={theme}
          rightComponent={
            <Icon name="chevron-forward" size={20} color={theme.iconInactive} />
          }
        />

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <SettingRow
          icon="flag-outline"
          label={t('feedback')}
          onPress={() => setFeedbackVisible(true)}
          theme={theme}
          rightComponent={
            <Icon name="chevron-forward" size={20} color={theme.iconInactive} />
          }
        />

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <SettingRow
          icon="information-circle-outline"
          label={t('about')}
          onPress={handleAboutPress}
          theme={theme}
          rightComponent={
            <Icon name="chevron-forward" size={20} color={theme.iconInactive} />
          }
        />
      </View>

      <View style={{ height: 40 }} />

      <FeedbackModal
        visible={feedbackVisible}
        onDismiss={() => setFeedbackVisible(false)}
        source="config"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  settingsGroup: {
    borderRadius: 12,
    overflow: 'hidden'
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  settingIcon: {
    marginRight: 12,
    opacity: 0.8
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500'
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  settingValue: {
    fontSize: 16,
    marginRight: 8
  },
  divider: {
    height: 1,
    marginLeft: 50
  },
});
