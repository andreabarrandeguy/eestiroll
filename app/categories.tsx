import { Icon } from '@/components/Icon';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useCategories } from '@/contexts/CategoryContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from '@/hooks/useTranslations';
import { categories, categoryColorMap } from '@/utils/wordData';
import { Stack } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CategoriesScreen() {
  const { 
    categoryCount, 
    excludedCategories, 
    setCategoryCount, 
    toggleExcluded,
    availableCategories,
    maxExclusions,
    isLoading 
  } = useCategories();
  const { theme } = useTheme();
  const { t } = useTranslations();

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenContainer title={t('categories')}>
          <Text style={[styles.loadingText, { color: theme.text }]}>
            {t('loading')}...
          </Text>
        </ScreenContainer>
      </>
    );
  }

  const canDecrease = categoryCount > 1;
  const canIncrease = categoryCount < availableCategories.length;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenContainer title={t('categories')} showBackButton>
        {/* Category Count Stepper */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t('categoriesPerRound')}
          </Text>
          <View style={styles.stepperContainer}>
            <TouchableOpacity 
              onPress={() => setCategoryCount(categoryCount - 1)}
              disabled={!canDecrease}
              style={[
                styles.stepperButton, 
                { backgroundColor: theme.background, opacity: canDecrease ? 1 : 0.3 }
              ]}
            >
              <Icon name="remove" size={24} color={theme.text} />
            </TouchableOpacity>
            
            <Text style={[styles.stepperValue, { color: theme.text }]}>
              {categoryCount}
            </Text>
            
            <TouchableOpacity 
              onPress={() => setCategoryCount(categoryCount + 1)}
              disabled={!canIncrease}
              style={[
                styles.stepperButton, 
                { backgroundColor: theme.background, opacity: canIncrease ? 1 : 0.3 }
              ]}
            >
              <Icon name="add" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.hint, { color: theme.iconInactive }]}>
            {t('minMax').replace('{min}', '1').replace('{max}', String(availableCategories.length))}
          </Text>
        </View>

        {/* Excluded Categories */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground, marginTop: 20 }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t('excludeCategories')}
          </Text>
          
          {categories.map((category, index) => {
            const isExcluded = excludedCategories.includes(category);
            const canToggle = isExcluded || excludedCategories.length < maxExclusions;
            
            return (
              <View key={category}>
                {index > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
                <TouchableOpacity 
                  style={[styles.categoryRow, { opacity: canToggle ? 1 : 0.4 }]}
                  onPress={() => toggleExcluded(category)}
                  disabled={!canToggle}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryLeft}>
                    <View style={[styles.categoryDot, { backgroundColor: categoryColorMap[category] }]} />
                    <Text style={[
                      styles.categoryLabel, 
                      { color: theme.text },
                      isExcluded && styles.categoryLabelExcluded
                    ]}>
                      {t(category)}
                    </Text>
                  </View>
                  <Icon 
                    name={isExcluded ? "close-circle" : "checkmark-circle"} 
                    size={24} 
                    color={isExcluded ? "#E95A35" : theme.yellow} 
                  />
                </TouchableOpacity>
              </View>
            );
          })}
          
          {maxExclusions > 0 && (
            <Text style={[styles.exclusionHint, { color: theme.iconInactive }]}>
              {t('maxExclusions')
                .replace('{current}', String(excludedCategories.length))
                .replace('{max}', String(maxExclusions))}
            </Text>
          )}
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
  section: {
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 32,
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  categoryLeft: {
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
  },
  categoryLabelExcluded: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  divider: {
    height: 1,
    marginLeft: 24
  },
  exclusionHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});