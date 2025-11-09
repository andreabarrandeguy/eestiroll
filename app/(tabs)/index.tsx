import { WordCard } from '@/components/WordCard';
import { useTheme } from '@/contexts/ThemeContext';
import { useRandomWords } from '@/hooks/useRandomWords';
import { categoryColorMap } from '@/utils/wordData';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Keyboard, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { 
    words, 
    refreshKey, 
    sentence, 
    setSentence, 
    handleSend 
  } = useRandomWords();

  useFocusEffect(
    useCallback(() => {
      return () => {
        // Cleanup logic if needed
      };
    }, [])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>Randomize</Text>

          {words.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTextBold, { color: theme.text }]}>NB!</Text>
              <View style={styles.configHintContainer}>
                <Text style={[styles.emptyText, { color: theme.text }]}>Customize categories in </Text>
                <Ionicons name="settings-outline" size={16} color={theme.text} style={{ opacity: 0.6 }} />
              </View>
            </View>
          )}

          {words.length > 0 && (
            <>
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

              <View style={[
                styles.inputContainer, 
                { 
                  backgroundColor: theme.inputBackground,
                  borderWidth: 1,
                  borderColor: theme.border
                }
              ]}>
                <TextInput
                  style={[styles.input, { color: theme.inputText }]}
                  placeholder="Enter your sentence..."
                  placeholderTextColor={theme.iconInactive}
                  value={sentence}
                  onChangeText={setSentence}
                  maxLength={140}
                  multiline
                />
                {sentence.length > 0 && (
                  <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                    <Ionicons name="paper-plane" size={20} color={theme.inputText} />
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
          
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1,
    padding: 20
  },
  title: {
    fontSize: 24,
    textAlign: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
    marginRight: 5
  },
  emptyTextBold: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  configHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  inputContainer: {
    marginTop: 20,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    marginLeft: 10,
    padding: 8,
  }
});