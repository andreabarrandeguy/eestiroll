import { FeedbackModal } from '@/components/FeedbackModal';
import { Icon } from '@/components/Icon';
import { SubscribeModal } from '@/components/SubscribeModal';
import { getWordTranslation, WordCard } from '@/components/WordCard';
import { Theme } from '@/constants/Colors';
import { useHistory } from '@/contexts/HistoryContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRandomWords } from '@/hooks/useRandomWords';
import { useSubscribeModal } from '@/hooks/useSubscribeModal';
import { useTranslations } from '@/hooks/useTranslations';
import { AICheckResponse, checkSentenceWithAI } from '@/services/aiService';
import { EVENTS, track } from '@/services/analytics';
import { TranslationKey } from '@/utils/translations';
import { categoryColorMap } from '@/utils/wordData';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Keyboard, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const languageMap: Record<string, string> = {
  es: "Spanish",
  en: "English",
  ru: "Russian",
};

const BASE_INPUT_HEIGHT = 30;
const MAX_INPUT_HEIGHT = 120; // matches styles.input.maxHeight

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

const AI_LOADING_MESSAGE_KEYS: TranslationKey[] = ['aiLoadingMsg1', 'aiLoadingMsg2', 'aiLoadingMsg3', 'aiLoadingMsg4'];

const AILoadingState = ({ theme, t }: { theme: Theme; t: (key: TranslationKey) => string }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const msgIndexRef = useRef(0);
  const fade = useRef(new Animated.Value(1)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    msgIndexRef.current = msgIndex;
  }, [msgIndex]);

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinLoop.start();
    return () => spinLoop.stop();
  }, [spin]);

  useEffect(() => {
    // Cycle through the messages once and settle on the last one — looping back
    // to "Reading your sentence..." after "Almost there..." would feel dishonest.
    const interval = setInterval(() => {
      if (msgIndexRef.current >= AI_LOADING_MESSAGE_KEYS.length - 1) {
        clearInterval(interval);
        return;
      }
      Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setMsgIndex(i => Math.min(i + 1, AI_LOADING_MESSAGE_KEYS.length - 1));
        Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      });
    }, 2400);
    return () => clearInterval(interval);
  }, [fade]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={{ alignItems: 'center', marginVertical: 8 }}>
      <SkeletonLine width="100%" height={80} style={{ borderRadius: 12 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 }}>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Icon name="sparkles-outline" size={16} color={theme.iconInactive} />
        </Animated.View>
        <Animated.Text style={{ opacity: fade, color: theme.iconInactive, fontSize: 13, fontWeight: '500' }}>
          {t(AI_LOADING_MESSAGE_KEYS[msgIndex])}
        </Animated.Text>
      </View>
    </View>
  );
};

const AIErrorState = ({
  theme,
  t,
  onRetry,
  onEdit,
}: {
  theme: Theme;
  t: (key: TranslationKey) => string;
  onRetry: () => void;
  onEdit: () => void;
}) => (
  <View style={{ alignItems: 'center', paddingVertical: 20 }}>
    <Icon name="alert-circle-outline" size={36} color={theme.iconInactive} />
    <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600', marginTop: 10, textAlign: 'center' }}>
      {t('aiCheckErrorTitle')}
    </Text>
    <Text style={{ color: theme.iconInactive, fontSize: 13, textAlign: 'center', marginTop: 4, maxWidth: 280 }}>
      {t('aiCheckErrorSubtitle')}
    </Text>
    <TouchableOpacity
      onPress={onRetry}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#EFC320',
        paddingHorizontal: 20,
        paddingVertical: 11,
        borderRadius: 999,
        marginTop: 16,
      }}
    >
      <Icon name="refresh-outline" size={16} color="#0A0A0A" />
      <Text style={{ color: '#0A0A0A', fontWeight: '700', fontSize: 14 }}>{t('retry')}</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={onEdit} style={{ marginTop: 12 }}>
      <Text style={{ color: theme.iconInactive, fontSize: 13, textDecorationLine: 'underline' }}>
        {t('editSentence')}
      </Text>
    </TouchableOpacity>
  </View>
);

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
  const [webInputHeight, setWebInputHeight] = useState(BASE_INPUT_HEIGHT);
  const [aiResult, setAiResult] = useState<AICheckResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [showingFeedback, setShowingFeedback] = useState(false);
  const [lastSentence, setLastSentence] = useState('');
  const [aiRemaining, setAiRemaining] = useState<number | null>(null);
  const [aiReportVisible, setAiReportVisible] = useState(false);
  const subscribeModal = useSubscribeModal();

  const use3Columns = words.length >= 9;

  // When new words appear (new roll), go back to input mode
  useEffect(() => {
    setShowingFeedback(false);
    setAiResult(null);
    setAiLoading(false);
    setAiError(false);
  }, [refreshKey]);

  // Shrink the web input back down once the sentence is cleared (sent, or a new roll)
  useEffect(() => {
    if (!sentence) setWebInputHeight(BASE_INPUT_HEIGHT);
  }, [sentence]);

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

  const runAICheck = useCallback(async (sentenceToCheck: string) => {
    const aiWords = words.map(w => ({
      estonian: w.word,
      translation: getWordTranslation(w.word, w.category, language),
    }));

    setLastSentence(sentenceToCheck);
    setAiResult(null);
    setAiError(false);
    setShowingFeedback(true);
    setAiLoading(true);
    Keyboard.dismiss();

    try {
      const result = await checkSentenceWithAI({
        words: aiWords,
        sentence: sentenceToCheck,
        language: languageMap[language] || "English",
      });
      setAiResult(result);
      setAiRemaining(result.remaining);
      addEntry(words, sentenceToCheck, result);
      subscribeModal.onAICheckSuccess();
      setSentence('');
    } catch (e) {
      if (e instanceof Error && e.message === "daily_limit") {
        addEntry(words, sentenceToCheck);
        setSentence('');
        setAiRemaining(0);
      } else {
        console.error("AI check failed:", e);
        track(EVENTS.AI_CHECK_FAILED);
        setAiError(true);
      }
    } finally {
      setAiLoading(false);
    }
  }, [words, language, addEntry, subscribeModal, setSentence]);

  const handleAICheck = useCallback(() => {
    if (!sentence.trim()) return;
    runAICheck(sentence.trim());
  }, [sentence, runAICheck]);

  const handleRetry = useCallback(() => {
    runAICheck(lastSentence);
  }, [lastSentence, runAICheck]);

  const handleEditSentence = useCallback(() => {
    setSentence(lastSentence);
    setShowingFeedback(false);
    setAiError(false);
  }, [lastSentence, setSentence]);

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

        {words.length === 0 && !showingFeedback && refreshKey === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTextBold, { color: theme.text }]}>{t('rollHintLine1')}</Text>
            <Text style={[styles.emptyTextBold, { color: theme.text }]}>{t('rollHintLine2')}</Text>
          </View>
        )}

        {words.length === 0 && !showingFeedback && refreshKey > 0 && (
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
                  Platform.OS === 'web' && {
                    outlineStyle: 'none',
                    height: Math.min(webInputHeight, MAX_INPUT_HEIGHT),
                  } as any
                ]}
                placeholder={t('enterSentence')}
                placeholderTextColor={theme.iconInactive}
                value={sentence}
                onChangeText={setSentence}
                onSelectionChange={Platform.OS !== 'web' ? handleSelectionChange : undefined}
                onContentSizeChange={
                  Platform.OS === 'web'
                    ? (e) => setWebInputHeight(e.nativeEvent.contentSize.height)
                    : undefined
                }
                maxLength={140}
                multiline
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

        {showingFeedback && aiError && (
          <View style={styles.feedbackContainer}>
            <AIErrorState theme={theme} t={t} onRetry={handleRetry} onEdit={handleEditSentence} />
          </View>
        )}

        {showingFeedback && !aiError && (
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
              <AILoadingState theme={theme} t={t} />
            )}

            {/* Fixed: User sentence */}
            <View style={[styles.userSentenceContainer, { borderColor: theme.border }]}>
              <View style={styles.userSentenceLabelRow}>
                <Text style={[styles.userSentenceLabel, { color: theme.text }]}>{t('yourSentence')}</Text>
                {aiResult ? (
                  <TouchableOpacity
                    onPress={() => setAiReportVisible(true)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon name="flag-outline" size={13} color={theme.iconInactive} />
                  </TouchableOpacity>
                ) : null}
              </View>
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
                      {aiResult.coreIssue ? (
                        <View style={styles.fieldContainer}>
                          <Text style={[styles.fieldValue, { color: theme.text, fontWeight: '600' }]}>{aiResult.coreIssue}</Text>
                        </View>
                      ) : null}
                      {aiResult.rule ? (
                        <View style={styles.fieldContainer}>
                          <Text style={[styles.fieldValue, { color: theme.text, fontWeight: '600', fontSize: 18 }]}>{aiResult.rule}</Text>
                        </View>
                      ) : null}
                      {aiResult.correctedSentence ? (
                        <View style={styles.fieldContainer}>
                          <Text style={[styles.fieldValue, { color: theme.text, fontStyle: 'italic' }]}>{t('correction')}: {aiResult.correctedSentence}</Text>
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

  const modals = (
    <>
      <SubscribeModal
        visible={subscribeModal.visible}
        onDismiss={subscribeModal.onDismiss}
        onSubscribed={subscribeModal.onSubscribed}
      />
      <FeedbackModal
        visible={aiReportVisible}
        onDismiss={() => setAiReportVisible(false)}
        source="ai_result"
        word={lastSentence}
        context={{ words, sentence: lastSentence, aiResult }}
      />
    </>
  );

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {content}
        {modals}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {content}
      </TouchableWithoutFeedback>
      {modals}
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
    paddingHorizontal: 24,
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
    textAlign: 'center',
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
  userSentenceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userSentenceLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.5,
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