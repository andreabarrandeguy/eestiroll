import { WordCard } from '@/components/WordCard';
import { Colors } from '@/constants/Colors';
import { useCategories } from '@/contexts/CategoryContext';
import { useRandom } from '@/contexts/RandomContext';
import { categoryColorMap } from '@/utils/wordData';
import { getRandomWords } from '@/utils/wordHelpers';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const [words, setWords] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const { randomTrigger } = useRandom();
  const { selectedCategories } = useCategories();

  const handleRandom = () => {
    setWords(getRandomWords(selectedCategories));
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    if (randomTrigger > 0) {
      handleRandom();
    }
  }, [randomTrigger, selectedCategories]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setWords([]);
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Randomize</Text>

        {words.length > 0 && (
          <View style={styles.wordsContainer}>
            {words.map((item, index) => (
              <View key={index} style={styles.wordWrapper}>
                <WordCard 
                  word={item.word} 
                  category={item.category}
                  color={categoryColorMap[item.category]}
                  refreshKey={refreshKey}
                />
              </View>
            ))}
          </View>
        )}
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black
  },
  content: {
    padding: 20
  },
  title: {
    fontSize: 24,
    color: Colors.white,
    textAlign: 'center'
  },
  wordsContainer: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  wordWrapper: {
    width: '48%',
    marginBottom: 8
  }
});