import { WordCard } from '@/components/WordCard';
import { useTheme } from '@/contexts/ThemeContext';
import { useRandomWords } from '@/hooks/useRandomWords';
import { useTranslations } from '@/hooks/useTranslations';
import { categoryColorMap } from '@/utils/wordData';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { t } = useTranslations();
  const { 
    words, 
    refreshKey, 
    sentence, 
    setSentence, 
    handleSend 
  } = useRandomWords();

  const [cursorPosition, setCursorPosition] = useState(0);

  const use3Columns = words.length >= 9;

  useFocusEffect(
    useCallback(() => {
      return () => {
        // Cleanup logic if needed
      };
    }, [])
  );

  const handleDoubleTap = (word: string) => {
    const before = sentence.slice(0, cursorPosition);
    const after = sentence.slice(cursorPosition);
    const newSentence = before + word + after;
    setSentence(newSentence);
    setCursorPosition(cursorPosition + word.length);
  };

  const handleSelectionChange = (event: any) => {
    setCursorPosition(event.nativeEvent.selection.start);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>
            Randomize
          </Text>

          {words.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTextBold, { color: theme.text }]}>
                {t('noCategoriesSelected')}
              </Text>
              <View style={styles.configHintContainer}>
                <Text style={[styles.emptyText, { color: theme.text }]}>
                  {t('customizeCategories')} 
                </Text>
                <Ionicons name="settings-outline" size={16} color={theme.text} style={{ opacity: 0.6 }} />
              </View>
            </View>
          )}

          {words.length > 0 && (
            <>
              <View style={styles.wordsContainer}>
                {words.map((item, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.wordWrapper,
                      { width: use3Columns ? '32%' : '48%' }
                    ]}
                  >
                    <WordCard 
                      word={item.word} 
                      category={item.category}
                      color={categoryColorMap[item.category]}
                      refreshKey={refreshKey}
                      uppercaseCategory={true}
                      compact={use3Columns}
                      onDoubleTap={handleDoubleTap}
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
                  placeholder={t('enterSentence')}
                  placeholderTextColor={theme.iconInactive}
                  value={sentence}
                  onChangeText={setSentence}
                  onSelectionChange={handleSelectionChange}
                  maxLength={140}
                  multiline
                />
                {sentence.length > 0 && (
                  <TouchableOpacity 
                    style={styles.sendButton} 
                    onPress={handleSend}
                  >
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
    padding: 20,
    paddingBottom: 120
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
    marginBottom: 8
  },
  inputContainer: {
    marginTop: 20,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 120,
    paddingRight: 10,
    marginBottom: 3,
  },
  sendButton: {
    alignSelf: 'flex-end',
    marginBottom: 3,
  }
});