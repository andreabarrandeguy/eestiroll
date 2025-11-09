import { ScreenContainer } from '@/components/ScreenContainer';
import { Theme } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

// Reusable component for settings rows
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
  
  // Temporary state - TODO: Move to context when implementing real functionality
  const [language, setLanguage] = useState('English');

  const handleCategoriesPress = () => {
    router.push('/categories');
  };

  const handleLanguagePress = () => {
    // TODO: Open modal or navigate to language selection screen
    console.log('Open language selector');
  };

  return (
    <ScreenContainer title="Configuration">
      <View style={[styles.settingsGroup, { backgroundColor: theme.cardBackground }]}>
        {/* Categories - navigates to another screen */}
        <SettingRow
          icon="grid-outline"
          label="Categories"
          onPress={handleCategoriesPress}
          theme={theme}
          rightComponent={
            <Ionicons name="chevron-forward" size={20} color={theme.iconInactive} />
          }
        />
        
        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* Dark Mode - direct toggle */}
        <SettingRow
          icon="moon-outline"
          label="Dark Mode"
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
        
        {/* Language - navigates to selector */}
        <SettingRow
          icon="language-outline"
          label="Language"
          onPress={handleLanguagePress}
          theme={theme}
          rightComponent={
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: theme.iconInactive }]}>{language}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.iconInactive} />
            </View>
          }
        />
      </View>

      {/* Bottom spacing */}
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