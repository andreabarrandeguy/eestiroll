import { Colors } from '@/constants/Colors';
import { Pressable, StyleSheet, Text } from 'react-native';

interface CategoryCardProps {
  category: string;
  color: string;
  isSelected: boolean;
  onPress: () => void;
}

export function CategoryCard({ category, color, isSelected, onPress }: CategoryCardProps) {
  return (
    <Pressable 
      style={[
        styles.card, 
        { 
          backgroundColor: isSelected ? color : Colors.white,
        }
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.categoryText,
        { opacity: isSelected ? 1 : 0.3 }
      ]}>
        {category}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.black,
  }
});