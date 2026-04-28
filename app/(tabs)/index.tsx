import { Icon } from '@/components/Icon';
import { getWordTranslation, WordCard } from '@/components/WordCard';
import { useHistory } from '@/contexts/HistoryContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRandomWords } from '@/hooks/useRandomWords';
import { useTranslations } from '@/hooks/useTranslations';
import { AICheckResponse, checkSentenceWithAI } from '@/services/aiService';
import { categoryColorMap } from '@/utils/wordData';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Keyboard, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const languageMap: Record<string, string> = {
  es: "Spanish",
  en: "English",
  ru: "Russian",
};

const SkeletonLine = ({ width = '100%' as any, height = 16, style = {} }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[{
        width,
        height,
        borderRadius: 6,
        backgroundColor: '#888',
        opacity,
        marginVertical: 4,
      }, style]}
    />
  );
};

const SHIMMER_COLORS = [
  '#B566FF', '#3468DC', '#6D91FF', '#8EC7A3',
  '#3C8D5F', '#EFC320', '#E95A35', '#EB579C',
];

const AIShimmerIcon = ({ size = 20, loading = false, inactiveColor = '#888' }) => {
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => setColorIndex(i => (i + 1) % SHIMMER_COLORS.length), 1500);
    return () => clearInterval(interval);
  }, [loading]);

  const color = loading ? inactiveColor : SHIMMER_COLORS[colorIndex];

  return <Icon name="paper-plane" size={size} color={color} />;
};

export default function HomeScreen() {
  const { theme } = useTheme();
  const { t, language } = useTranslations();
  const { addEntry } = useHistory();
  const { 
    words, 
    refreshKey, 
    sentence, 
    setSentence, 
  } = useRandomWords();

  const [cursorPosition, setCursorPosition] = useState(0);
  const [aiResult, setAiResult] = useState<AICheckResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showingFeedback, setShowingFeedback] = useState(false);
  const [lastSentence, setLastSentence] = useState('');
  const [aiRemaining, setAiRemaining] = useState<number | null>(null);

  const use3Columns = words.length >= 9;

  // When new words appear (new roll), go back to input mode
  useEffect(() => {
    setShowingFeedback(false);
    setAiResult(null);
    setAiLoading(false);
  }, [refreshKey]);

  useFocusEffect(
    useCallback(() => {
      return () => {};
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

  const handleAICheck = useCallback(async () => {
    if (!sentence.trim()) return;

    const aiWords = words.map(w => ({
      estonian: w.word,
      translation: getWordTranslation(w.word, w.category, language),
    }));

    setLastSentence(sentence.trim());
    setAiResult(null);
    setShowingFeedback(true);
    setAiLoading(true);
    Keyboard.dismiss();

    try {
      const result = await checkSentenceWithAI({
        words: aiWords,
        sentence: sentence.trim(),
        language: languageMap[language] || "English",
      });
      setAiResult(result);
      setAiRemaining(result.remaining);
      addEntry(words, sentence.trim(), result);
      setSentence('');
    } catch (e) {
      if (e instanceof Error && e.message === "daily_limit") {
        addEntry(words, sentence.trim());
        setSentence('');
        setAiRemaining(0);
      } else {
        console.error("AI check failed:", e);
        setShowingFeedback(false);
      }
    } finally {
      setAiLoading(false);
    }
  }, [words, sentence, language, addEntry]);

  const getScoreColor = (score: number) => {
    if (score >= 4) return '#3C8D5F';
    if (score >= 3) return '#EFC320';
    return '#E95A35';
  };

  const getScoreLabel = (score: number) => {
    switch (score) {
      case 5: return 'Tubli! 🎉';
      case 4: return 'Hea, aga... 🤔';
      case 3: return 'Nii ja naa 😐';
      case 2: return 'Ei ole hea 😬';
      default: return 'Ma ei saa aru 😵';
    }
  };

  const content = (
    <View style={styles.contentWrapper}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          EestiRoll
        </Text>

        {words.length === 0 && !showingFeedback && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTextBold, { color: theme.text }]}>
              {t('noCategoriesSelected')}
            </Text>
            <View style={styles.configHintContainer}>
              <Text style={[styles.emptyText, { color: theme.text }]}>
                {t('customizeCategories')} 
              </Text>
              <Icon name="settings-outline" size={16} color={theme.text} />
            </View>
          </View>
        )}

        {!showingFeedback && words.length > 0 && (
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
                style={[
                  styles.input, 
                  { color: theme.inputText },
                  Platform.OS === 'web' && { outlineStyle: 'none', height: 30 } as any
                ]}
                placeholder={t('enterSentence')}
                placeholderTextColor={theme.iconInactive}
                value={sentence}
                onChangeText={setSentence}
                onSelectionChange={Platform.OS !== 'web' ? handleSelectionChange : undefined}
                maxLength={140}
                multiline={Platform.OS !== 'web'}
              />
              {sentence.length > 0 && (
                <TouchableOpacity 
                  style={styles.sendButton} 
                  onPress={handleAICheck}
                  disabled={aiLoading}
                >
                  {aiRemaining !== 0 ? (
                    <AIShimmerIcon size={20} loading={aiLoading} inactiveColor={theme.iconInactive} />
                  ) : (
                    <Icon 
                      name="paper-plane" 
                      size={20} 
                      color={aiLoading ? theme.iconInactive : theme.inputText} 
                    />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {showingFeedback && (
          <View style={styles.feedbackContainer}>
            {/* Fixed: Score card */}
            {aiResult ? (
              <View style={[styles.scoreCard, { backgroundColor: getScoreColor(aiResult.score) + '20', borderColor: getScoreColor(aiResult.score) }]}>
                <View style={styles.scoreTopRow}>
                  <Text style={[styles.scoreText, { color: getScoreColor(aiResult.score) }]}>
                    {aiResult.score}<Text style={styles.scoreMax}>/5</Text>
                  </Text>
                  <Text style={[styles.scoreLabel, { color: theme.text }]}>
                    {getScoreLabel(aiResult.score)}
                  </Text>
                </View>
                <View style={styles.scorePills}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <View
                      key={i}
                      style={[
                        styles.scorePill,
                        { backgroundColor: i <= aiResult.score ? getScoreColor(aiResult.score) : getScoreColor(aiResult.score) + '30' }
                      ]}
                    />
                  ))}
                </View>
              </View>
            ) : aiRemaining === 0 ? (
              <Text style={{ color: '#E95A35', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                {t('dailyLimitReached')}
              </Text>
            ) : (
              <View style={{ alignItems: 'center', marginVertical: 8 }}>
                <SkeletonLine width="100%" height={80} style={{ borderRadius: 12 }} />
              </View>
            )}

            {/* Fixed: User sentence */}
            <View style={[styles.userSentenceContainer, { borderColor: theme.border }]}>
              <Text style={[styles.userSentenceLabel, { color: theme.text }]}>{t('yourSentence')}</Text>
              <Text style={[styles.userSentenceText, { color: theme.text }]}>{lastSentence}</Text>
            </View>

            {/* Scrollable: AI feedback fields */}
            <ScrollView 
              style={styles.feedbackScroll}
              contentContainerStyle={styles.feedbackScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {aiResult ? (
                <>
                  <View style={styles.fieldContainer}>
                    <Text style={[styles.fieldValue, { color: theme.text }]}>{aiResult.validation}</Text>
                  </View>
                  {aiResult.score < 5 && (
                    <>
                      {aiResult.core_issue ? (
                        <View style={styles.fieldContainer}>
                          <Text style={[styles.fieldValue, { color: theme.text, fontWeight: '600' }]}>{aiResult.core_issue}</Text>
                        </View>
                      ) : null}
                      {aiResult.rule ? (
                        <View style={styles.fieldContainer}>
                          <Text style={[styles.fieldValue, { color: theme.text, fontWeight: '600', fontSize: 18 }]}>{aiResult.rule}</Text>
                        </View>
                      ) : null}
                      {aiResult.corrected_sentence ? (
                        <View style={styles.fieldContainer}>
                          <Text style={[styles.fieldValue, { color: theme.text, fontStyle: 'italic' }]}>{t('correction')}: {aiResult.corrected_sentence}</Text>
                        </View>
                      ) : null}
                      {aiResult.notes ? (
                        <View style={styles.fieldContainer}>
                          <Text style={[styles.fieldValue, { color: theme.text }]}>{aiResult.notes}</Text>
                        </View>
                      ) : null}
                    </>
                  )}
                </>
              ) : aiRemaining === 0 ? (
                <View style={{ alignItems: 'center', marginTop: 20 }}>
                  <Text style={{ color: theme.text, fontSize: 14, textAlign: 'center', marginTop: 10, opacity: 0.7 }}>
                    {t('savedToHistory')}
                  </Text>
                </View>
              ) : (
                <>
                  <SkeletonLine width="90%" />
                  <SkeletonLine width="75%" />
                  <SkeletonLine width="60%" style={{ marginTop: 12 }} />
                  <SkeletonLine width="95%" style={{ marginTop: 12 }} />
                  <SkeletonLine width="80%" />
                </>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {content}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {content}
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  contentWrapper: {
    flex: 1,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
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
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackContainer: {
    marginTop: 20,
    flex: 1,
  },
  feedbackScroll: {
    flex: 1,
    marginTop: 4,
  },
  feedbackScrollContent: {
    paddingBottom: 140,
  },
  scoreCard: {
    borderWidth: 2,
    borderRadius: 14,
    padding: 14,
  },
  scoreTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '800',
  },
  scoreMax: {
    fontSize: 20,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  scorePills: {
    flexDirection: 'row',
    gap: 6,
  },
  scorePill: {
    flex: 1,
    height: 10,
    borderRadius: 5,
  },
  userSentenceContainer: {
    marginTop: 14,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  userSentenceLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.5,
    marginBottom: 4,
  },
  userSentenceText: {
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  fieldContainer: {
    marginTop: 14,
  },
  fieldValue: {
    fontSize: 15,
    lineHeight: 22,
  },
});