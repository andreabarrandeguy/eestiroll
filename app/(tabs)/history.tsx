import { ScreenContainer } from '@/components/ScreenContainer';
import { useHistory } from '@/contexts/HistoryContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from '@/hooks/useTranslations';
import { categoryColorMap } from '@/utils/wordData';
import { StyleSheet, Text, View } from 'react-native';

export default function HistoryScreen() {
  const { history } = useHistory();
  const { theme } = useTheme();
  const { t } = useTranslations();

  return (
    <ScreenContainer title={t('history')}>
      {history.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.text }]}>
          {t('noHistoryYet')}
        </Text>
      ) : (
        history.map((entry, index) => (
          <View 
            key={index} 
            style={[
              styles.entryContainer, 
              { backgroundColor: theme.cardBackground }
            ]}
          >
            <Text style={[
              styles.sentenceText,
              { 
                color: theme.text,
                fontStyle: entry.sentence ? 'normal' : 'italic', 
                opacity: entry.sentence ? 1 : 0.5 
              }
            ]}>
              {entry.sentence || '(no sentence)'}
            </Text>
            
            <View style={styles.wordsGrid}>
              {entry.words.map((item, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.wordChip,
                    { backgroundColor: categoryColorMap[item.category] }
                  ]}
                >
                  <Text style={styles.wordChipText}>
                    {item.word}
                  </Text>
                </View>
              ))}
            </View>
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sentenceText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 24,
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  wordChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});