import { CategoryCard } from '@/components/CategoryCard';
import { Colors } from '@/constants/Colors';
import { useCategories } from '@/contexts/CategoryContext';
import { categories, categoryColorMap } from '@/utils/wordData';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ConfigScreen() {
  const { selectedCategories, toggleCategory, isLoading } = useCategories();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Randomize</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Randomize</Text>

          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <View key={category} style={styles.categoryWrapper}>
                <CategoryCard
                  category={category}
                  color={categoryColorMap[category]}
                  isSelected={selectedCategories.includes(category)}
                  onPress={() => toggleCategory(category)}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20
  },
  title: {
    fontSize: 24,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 20
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  categoryWrapper: {
    width: '48%',
    marginBottom: 8
  }
});