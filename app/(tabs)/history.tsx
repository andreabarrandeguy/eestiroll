import { ScreenContainer } from '@/components/ScreenContainer';
import { useHistory } from '@/contexts/HistoryContext';
import { useTheme } from '@/contexts/ThemeContext';
import { StyleSheet, Text, View } from 'react-native';

export default function HistoryScreen() {
  const { history } = useHistory();
  const { theme } = useTheme();

  return (
    <ScreenContainer title="History">
      {history.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.text }]}>No history yet</Text>
      ) : (
        history.map((entry, index) => (
          <View key={index} style={[styles.entryContainer, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.entryNumber, { color: theme.text }]}>#{history.length - index}</Text>
            
            <Text style={[styles.wordsTitle, { color: theme.text }]}>Words:</Text>
            {entry.words.map((item, i) => (
              <Text key={i} style={[styles.wordText, { color: theme.text }]}>
                {item.category}: {item.word}
              </Text>
            ))}
            
            <Text style={[styles.sentenceTitle, { color: theme.text }]}>Sentence:</Text>
            <Text style={[
              styles.sentenceText,
              { 
                color: theme.text,
                fontStyle: entry.sentence ? 'normal' : 'italic', 
                opacity: entry.sentence ? 1 : 0.5 
              }
            ]}>
              {entry.sentence || '(empty)'}
            </Text>
          </View>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 40,
  },
  entryContainer: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  entryNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  wordsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 5,
  },
  wordText: {
    fontSize: 12,
    opacity: 0.8,
    marginLeft: 10,
  },
  sentenceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  sentenceText: {
    fontSize: 14,
    marginLeft: 10,
  },
});