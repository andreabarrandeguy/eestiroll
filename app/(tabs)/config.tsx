import { ScreenContainer } from '@/components/ScreenContainer';
import { Theme } from '@/constants/Colors';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

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
        <Ionicons name={icon} size={22} color={theme.text} style={styles.settingIcon} />
        <Text style={[styles.settingLabel, { color: theme.text }]}>{label}</Text>
      </View>
      {rightComponent}
    </TouchableOpacity>
  );
}

export default function ConfigScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { currentLanguageOption } = useLanguage();
  const { t } = useTranslations();

  const handleCategoriesPress = () => {
    router.push('/categories');
  };

  const handleLanguagePress = () => {
    router.push('/language');
  };

  return (
    <ScreenContainer title={t('configuration')}>
      <View style={[styles.settingsGroup, { backgroundColor: theme.cardBackground }]}>
        <SettingRow
          icon="grid-outline"
          label={t('categories')}
          onPress={handleCategoriesPress}
          theme={theme}
          rightComponent={
            <Ionicons name="chevron-forward" size={20} color={theme.iconInactive} />
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
              <Ionicons name="chevron-forward" size={20} color={theme.iconInactive} />
            </View>
          }
        />
      </View>

      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
  }
});