import { ScreenContainer } from '@/components/ScreenContainer';
import { useCategories } from '@/contexts/CategoryContext';
import { useTheme } from '@/contexts/ThemeContext';
import { categories, categoryColorMap } from '@/utils/wordData';
import { Stack } from 'expo-router';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function CategoriesScreen() {
  const { selectedCategories, toggleCategory, isLoading } = useCategories();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenContainer title="Categories">
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading...</Text>
        </ScreenContainer>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenContainer title="Categories" showBackButton>
        <View style={[styles.settingsGroup, { backgroundColor: theme.cardBackground }]}>
          {categories.map((category, index) => (
            <View key={category}>
              <TouchableOpacity 
                style={styles.categoryRow}
                onPress={() => toggleCategory(category)}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.categoryDot, { backgroundColor: categoryColorMap[category] }]} />
                  <Text style={[styles.categoryLabel, { color: theme.text }]}>{category}</Text>
                </View>
                <Switch
                  value={selectedCategories.includes(category)}
                  onValueChange={() => toggleCategory(category)}
                  trackColor={{ false: '#767577', true: categoryColorMap[category] }}
                  thumbColor='#f4f3f4'
                />
              </TouchableOpacity>
              {index < categories.length - 1 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
            </View>
          ))}
        </View>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  loadingText: {
    textAlign: 'center',
    opacity: 0.6
  },
  settingsGroup: {
    borderRadius: 12,
    overflow: 'hidden'
  },
  categoryRow: {
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
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  divider: {
    height: 1,
    marginLeft: 50
  }
});