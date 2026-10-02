import { AIShimmerIcon } from '@/components/AIShimmerIcon';
import { FeedbackModal } from '@/components/FeedbackModal';
import { Icon } from '@/components/Icon';
import { SentenceExamplesModal } from '@/components/SentenceExamplesModal';
import { SignInPromptModal } from '@/components/SignInPromptModal';
import { SubscribeModal } from '@/components/SubscribeModal';
import { getWordTranslation, WordCard } from '@/components/WordCard';
import { Theme } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useAuth } from '@/contexts/AuthContext';
import { useHistory } from '@/contexts/HistoryContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRandomWords } from '@/hooks/useRandomWords';
import { useSignInPromptModal } from '@/hooks/useSignInPromptModal';
import { useSubscribeModal } from '@/hooks/useSubscribeModal';
import { useTranslations } from '@/hooks/useTranslations';
import { AICheckResponse, checkSentenceWithAI, DailyLimitError, HttpError, ResponseParseError, SessionInvalidError } from '@/services/aiService';
import { EVENTS, track } from '@/services/analytics';
import { TranslationKey } from '@/utils/translations';
import { categoryColorMap } from '@/utils/wordData';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Keyboard, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const languageMap: Record<string, string> = {
  es: "Spanish",
  en: "English",
  ru: "Russian",
};

const BASE_INPUT_HEIGHT = 30;
const MAX_INPUT_HEIGHT = 120; // matches styles.input.maxHeight

// The native animated module doesn't exist on web — requesting it there just
// prints a noisy fallback warning on every animation.
const NATIVE_DRIVER = Platform.OS !== 'web';

// AI_CHECK_FAILED used to fire with no properties at all, so there was no
// way to tell a backend 500 apart from a malformed/truncated response apart
// from a plain network drop — this is what makes the next occurrence
// diagnosable in PostHog instead of just counting how often it happens.
const aiErrorProperties = (e: unknown): Record<string, string | number> => {
  if (e instanceof ResponseParseError) {
    return { reason: 'response_parse_error', status: e.status, bodyLength: e.bodyLength };
  }
  if (e instanceof HttpError) {
    return { reason: 'http_error', status: e.status };
  }
  if (e instanceof Error) {
    return { reason: 'network_error', message: e.message };
  }
  return { reason: 'unknown' };
};

const SkeletonLine = ({ width = '100%' as any, height = 16, style = {} }) => {
  const [opacity] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: NATIVE_DRIVER,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: NATIVE_DRIVER,
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

// The owner's own hand-drawn arrow, pixel-traced from her photo (contour
// extraction on the inked silhouette, not a hand-guessed bezier approximation)
// so it keeps her actual stroke shape and natural width variation. Filled,
// not stroked — the path is the ink's outline, with the loop's hole as an
// evenodd sub-path. Sized as width/height="100%" of its (flex-measured)
// wrapper rather than fixed pixels, so it scales to fit on any screen height
// instead of a fixed size overflowing into the text above it.
const SquiggleArrow = ({ color }: { color: string }) => (
  <Svg width="100%" height="100%" viewBox="0 0 473 727" preserveAspectRatio="xMidYMid meet">
    <Path
      fillRule="evenodd"
      fill={color}
      d="M250.0,718.5 L217.0,713.5 L186.0,702.5 L177.5,695.0 L177.5,687.0 L187.0,680.5 L228.5,695.0 L211.5,674.0 L196.5,645.0 L188.5,620.0 L183.5,583.0 L186.5,534.0 L205.5,404.0 L206.5,352.0 L204.5,334.0 L160.0,340.5 L127.0,339.5 L89.0,330.5 L60.0,315.5 L33.5,291.0 L14.5,260.0 L8.5,243.0 L4.5,220.0 L7.5,193.0 L16.5,175.0 L29.0,162.5 L42.0,154.5 L57.0,149.5 L93.0,149.5 L111.0,154.5 L130.0,163.5 L155.0,181.5 L177.5,206.0 L191.5,228.0 L204.5,257.0 L212.5,283.0 L217.5,313.0 L231.0,309.5 L260.0,295.5 L288.0,276.5 L323.5,243.0 L347.5,213.0 L379.5,163.0 L404.5,114.0 L423.5,68.0 L438.5,14.0 L444.0,8.5 L452.0,7.5 L460.5,14.0 L461.5,22.0 L442.5,71.0 L402.5,153.0 L356.5,226.0 L333.5,254.0 L297.0,288.5 L267.0,308.5 L219.5,329.0 L222.5,364.0 L221.5,401.0 L202.5,539.0 L200.5,583.0 L204.5,612.0 L212.5,637.0 L225.5,661.0 L245.0,682.5 L247.5,679.0 L252.5,635.0 L258.0,630.5 L265.0,629.5 L273.5,636.0 L272.5,702.0 L265.0,713.5 L250.0,718.5 Z M165.5,325.0 L200.0,319.5 L202.5,318.0 L202.5,312.0 L196.5,283.0 L187.5,256.0 L174.5,230.0 L158.5,208.0 L131.0,183.5 L115.0,174.5 L95.0,167.5 L83.0,165.5 L63.0,166.5 L53.0,169.5 L38.0,178.5 L28.5,190.0 L23.5,202.0 L22.5,228.0 L30.5,256.0 L47.5,283.0 L70.0,303.5 L95.0,316.5 L135.0,325.5 L165.5,325.0 Z"
    />
  </Svg>
);

const AI_LOADING_MESSAGE_KEYS: TranslationKey[] = ['aiLoadingMsg1', 'aiLoadingMsg2', 'aiLoadingMsg3', 'aiLoadingMsg4'];

const AILoadingState = ({ theme, t }: { theme: Theme; t: (key: TranslationKey) => string }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const msgIndexRef = useRef(0);
  const [fade] = useState(() => new Animated.Value(1));
  const [spin] = useState(() => new Animated.Value(0));

  useEffect(() => {
    msgIndexRef.current = msgIndex;
  }, [msgIndex]);

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: NATIVE_DRIVER,
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
      Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: NATIVE_DRIVER }).start(() => {
        setMsgIndex(i => Math.min(i + 1, AI_LOADING_MESSAGE_KEYS.length - 1));
        Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: NATIVE_DRIVER }).start();
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
        <Animated.Text style={{ opacity: fade, color: theme.iconInactive, fontSize: 13, fontFamily: Fonts.bodyMedium }}>
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
    <Text style={{ color: theme.text, fontSize: 16, fontFamily: Fonts.bodySemiBold, marginTop: 10, textAlign: 'center' }}>
      {t('aiCheckErrorTitle')}
    </Text>
    <Text style={{ color: theme.iconInactive, fontSize: 13, fontFamily: Fonts.bodyRegular, textAlign: 'center', marginTop: 4, maxWidth: 280 }}>
      {t('aiCheckErrorSubtitle')}
    </Text>
    <TouchableOpacity
      onPress={onRetry}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: theme.accent,
        paddingHorizontal: 20,
        paddingVertical: 11,
        borderRadius: 999,
        marginTop: 16,
      }}
    >
      <Icon name="refresh-outline" size={16} color={theme.accentText} />
      <Text style={{ color: theme.accentText, fontFamily: Fonts.bodyBold, fontSize: 14 }}>{t('retry')}</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={onEdit} style={{ marginTop: 12 }}>
      <Text style={{ color: theme.iconInactive, fontSize: 13, fontFamily: Fonts.bodyRegular, textDecorationLine: 'underline' }}>
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
  const [aiIsAuthenticated, setAiIsAuthenticated] = useState(false);
  const [aiReportVisible, setAiReportVisible] = useState(false);
  const [inputMountKey, setInputMountKey] = useState(0);
  const [examplesModalVisible, setExamplesModalVisible] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const wasSentenceEmptyRef = useRef(true);
  const subscribeModal = useSubscribeModal();
  const signInPromptModal = useSignInPromptModal();
  const { signOut } = useAuth();
  const [prevRefreshKey, setPrevRefreshKey] = useState(refreshKey);

  const use3Columns = words.length >= 5;

  // When new words appear (new roll), go back to input mode. Adjusted directly
  // during render (rather than in an effect) since it's just resetting state to
  // match a new refreshKey, not synchronizing with anything external.
  if (refreshKey !== prevRefreshKey) {
    setPrevRefreshKey(refreshKey);
    setShowingFeedback(false);
    setAiResult(null);
    setAiLoading(false);
    setAiError(false);
    setWebInputHeight(BASE_INPUT_HEIGHT);
  }

  // Refs can't be written during render (unlike state) — this piece of the
  // same reset stays in an effect.
  useEffect(() => {
    wasSentenceEmptyRef.current = true;
  }, [refreshKey]);

  // On web, the box height is driven by the last-measured content size (see
  // onContentSizeChange below), which only ever grows — a textarea's
  // scrollHeight can't report less than its current rendered height. So the
  // moment typing starts, collapse it back down first; the next keystroke's
  // measurement will then correctly size it to the (short) real content
  // instead of staying stuck at the placeholder's taller height.
  const collapseInputIfWasEmpty = (newText: string) => {
    if (Platform.OS !== 'web') return;
    const wasEmpty = wasSentenceEmptyRef.current;
    const isEmpty = newText.length === 0;
    if (wasEmpty && !isEmpty) {
      setWebInputHeight(BASE_INPUT_HEIGHT);
    }
    wasSentenceEmptyRef.current = isEmpty;
  };

  const handleSentenceChange = (text: string) => {
    collapseInputIfWasEmpty(text);
    setSentence(text);
  };

  const handleDoubleTap = (word: string) => {
    const before = sentence.slice(0, cursorPosition);
    const after = sentence.slice(cursorPosition);
    const newSentence = before + word + after;
    collapseInputIfWasEmpty(newSentence);
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
      setAiIsAuthenticated(result.isAuthenticated);
      addEntry(words, sentenceToCheck, result);
      subscribeModal.onAICheckSuccess();
      setSentence('');
      setInputMountKey(k => k + 1);
      wasSentenceEmptyRef.current = true;
    } catch (e) {
      if (e instanceof DailyLimitError) {
        addEntry(words, sentenceToCheck);
        setSentence('');
        setInputMountKey(k => k + 1);
        wasSentenceEmptyRef.current = true;
        setAiRemaining(0);
        setAiIsAuthenticated(e.isAuthenticated);
      } else if (e instanceof SessionInvalidError) {
        console.error("AI check failed: invalid session, signing out", e);
        signOut().catch(() => {});
        track(EVENTS.AI_CHECK_FAILED, { reason: 'session_invalid' });
        setAiError(true);
      } else {
        console.error("AI check failed:", e);
        track(EVENTS.AI_CHECK_FAILED, aiErrorProperties(e));
        setAiError(true);
      }
    } finally {
      setAiLoading(false);
    }
  }, [words, language, addEntry, subscribeModal, setSentence, signOut]);

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
          EestiR
          <Image
            source={require('@/assets/images/dice-static-small.png')}
            style={styles.titleDiceO}
            resizeMode="contain"
          />
          ll
        </Text>

        {words.length === 0 && !showingFeedback && refreshKey === 0 && (
          <View style={styles.rollHintContainer}>
            <View style={styles.rollHintSpacerTop} />

            <View style={styles.emptyTextGroup}>
              <Text style={[styles.emptyTextBold, { color: theme.text }]}>{t('rollHintLine1')}</Text>
              <Text style={[styles.emptyTextBold, { color: theme.text }]}>{t('rollHintLine2')}</Text>
            </View>

            <View style={styles.squiggleWrap}>
              <SquiggleArrow color="#35529D" />
            </View>
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
                  style={{ width: use3Columns ? '30%' : '48%' }}
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

            <View style={styles.stepHeaderRow}>
              <Icon name="create-outline" size={18} color={theme.text} />
              <Text style={[styles.stepTitle, { color: theme.text }]}>
                {t('sentenceBuilderTitle')}{' '}
                <Text
                  style={[styles.builderExamplesLink, { color: theme.text }]}
                  onPress={() => setExamplesModalVisible(true)}
                >
                  {t('sentenceBuilderExamplesLink')}
                </Text>
              </Text>
            </View>

            <View style={[
              styles.inputContainer,
              {
                backgroundColor: theme.inputBackground,
                borderWidth: inputFocused ? 2 : 1,
                borderColor: inputFocused ? '#3468DC' : theme.border,
                marginTop: 16,
              }
            ]}>
              <TextInput
                key={`${refreshKey}-${inputMountKey}`}
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
                onChangeText={handleSentenceChange}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
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
            {sentence.length > 0 && (
              <Text style={[styles.sendHint, { color: theme.iconInactive }]}>{t('sendHint')}</Text>
            )}
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
                  <View style={styles.scoreLabelGroup}>
                    <Text style={[styles.scoreLabel, { color: theme.text }]}>
                      {getScoreLabel(aiResult.score)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setAiReportVisible(true)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Icon name="flag-outline" size={13} color={theme.iconInactive} />
                    </TouchableOpacity>
                  </View>
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
              <Text style={{ color: '#E95A35', fontSize: 16, fontFamily: Fonts.bodySemiBold, textAlign: 'center' }}>
                {t(aiIsAuthenticated ? 'dailyLimitReachedAuth' : 'dailyLimitReachedAnon')}
              </Text>
            ) : (
              <AILoadingState theme={theme} t={t} />
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
                      {aiResult.coreIssue ? (
                        <View style={styles.fieldContainer}>
                          <Text style={[styles.fieldValue, { color: theme.text, fontFamily: Fonts.bodySemiBold }]}>{aiResult.coreIssue}</Text>
                        </View>
                      ) : null}
                      {aiResult.rule ? (
                        <View style={styles.fieldContainer}>
                          <Text style={[styles.fieldValue, { color: theme.text, fontFamily: Fonts.bodySemiBold, fontSize: 18 }]}>{aiResult.rule}</Text>
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
                  <Text style={{ color: theme.text, fontSize: 14, fontFamily: Fonts.bodyRegular, textAlign: 'center', marginTop: 10, opacity: 0.7 }}>
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
      <SignInPromptModal
        visible={signInPromptModal.visible}
        onDismiss={signInPromptModal.onDismiss}
        onSignIn={signInPromptModal.hide}
      />
      <SentenceExamplesModal
        visible={examplesModalVisible}
        onDismiss={() => setExamplesModalVisible(false)}
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
    textAlign: 'center',
    fontFamily: Fonts.heading,
  },
  // Stands in for the "o" in "Roll" — the wordmark's one bit of personality.
  // Inline images inside <Text> baseline-align differently on native vs web, hence the per-platform offset.
  titleDiceO: {
    width: 20,
    height: 20,
    marginLeft: -3,
    marginRight: -2,
    transform: [{ translateY: Platform.OS === 'web' ? 3 : -3 }],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  // Pre-roll hint: text pinned near the top, a flexible squiggle arrow
  // filling the space down to the dice, and the "how it works" link
  // anchored near the bottom, close to the dice tab button below it.
  rollHintContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  // Percentage padding resolves against the container's WIDTH in CSS/RN Web
  // (a common flexbox surprise), not its height — so vertical position here
  // is split via flex ratios on real siblings instead, which measure against
  // the actual available height.
  rollHintSpacerTop: {
    flex: 5,
  },
  emptyTextGroup: {
    alignItems: 'center',
  },
  squiggleWrap: {
    flex: 4,
    width: '100%',
    maxWidth: 160,
    alignSelf: 'center',
    minHeight: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
    // Nudges the arrow relative to the dice below it — tweak these two
    // numbers to fine-tune the aim. Negative translateX moves it left,
    // positive translateY moves it down.
    transform: [{ translateX: -35 }, { translateY: 1 }],
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
    marginRight: 5,
    fontFamily: Fonts.bodyRegular,
  },
  emptyTextBold: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: Fonts.bodyBold,
  },
  configHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordsContainer: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
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
    lineHeight: 20,
    maxHeight: 120,
    paddingRight: 10,
    paddingVertical: 5,
    fontFamily: Fonts.bodyRegular,
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
    fontFamily: Fonts.bodyExtraBold,
  },
  scoreMax: {
    fontSize: 20,
    fontFamily: Fonts.bodyBold,
  },
  scoreLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreLabel: {
    fontSize: 16,
    fontFamily: Fonts.bodySemiBold,
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    opacity: 0.5,
    fontFamily: Fonts.bodySemiBold,
  },
  userSentenceText: {
    fontSize: 16,
    fontStyle: 'italic',
    fontFamily: Fonts.bodySemiBold,
  },
  fieldContainer: {
    marginTop: 14,
  },
  fieldValue: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Fonts.bodyRegular,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  stepTitle: {
    fontSize: 17,
    fontFamily: Fonts.bodyBold,
  },
  builderExamplesLink: {
    fontSize: 13,
    textDecorationLine: 'underline',
    fontFamily: Fonts.bodyRegular,
  },
  sendHint: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: Fonts.bodyRegular,
  },
});