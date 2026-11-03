import { AIShimmerIcon } from '@/components/AIShimmerIcon';
import { FeedbackModal } from '@/components/FeedbackModal';
import { Icon } from '@/components/Icon';
import { SentenceExamplePreview } from '@/components/SentenceExamplePreview';
import { SentenceExamplesModal } from '@/components/SentenceExamplesModal';
import { SignInPromptModal } from '@/components/SignInPromptModal';
import { SkeletonLine } from '@/components/SkeletonLine';
import { SubscribeModal } from '@/components/SubscribeModal';
import { getWordTranslation, WordCard, WordCardPlaceholder } from '@/components/WordCard';
import { Theme } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useAuth } from '@/contexts/AuthContext';
import { useHistory } from '@/contexts/HistoryContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRandom } from '@/contexts/RandomContext';
import { useRandomWords } from '@/hooks/useRandomWords';
import { useSignInPromptModal } from '@/hooks/useSignInPromptModal';
import { useSubscribeModal } from '@/hooks/useSubscribeModal';
import { useTranslations } from '@/hooks/useTranslations';
import { AICheckResponse, checkSentenceWithAI, DailyLimitError, HttpError, ResponseParseError, SessionInvalidError, suggestSentence, SuggestLimitError, WordsNotAdjustedError } from '@/services/aiService';
import { EVENTS, track } from '@/services/analytics';
import { TranslationKey } from '@/utils/translations';
import { categoryColorMap } from '@/utils/wordData';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Keyboard, LayoutChangeEvent, Platform, ScrollView, StyleProp, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const languageMap: Record<string, string> = {
  es: "Spanish",
  en: "English",
  ru: "Russian",
};

const BASE_INPUT_HEIGHT = 30;
const MAX_INPUT_HEIGHT = 120; // matches styles.input.maxHeight

// Long enough to read as a movement, short enough that it is over well before
// the AI answers — it fills the start of the wait, it does not add to it.
const HANDOFF_MS = 600;
// Partway through the trip the field stops being a field: the label's room
// opens, the sentence takes the card's italic and the box settles into the
// card's shape. One moment, late enough that the movement is nearly done.
const MORPH_AT = 0.55;

// styles.userSentenceLabel's lineHeight plus its marginBottom: the room the
// travelling box opens for the label once it has landed.
const SENTENCE_LABEL_BLOCK = 18;
// styles.feedbackContainer's marginTop, which the rise has to stop short of.
const FEEDBACK_TOP_MARGIN = 20;

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


// One step of the home scaffold. The action and the words that complete it are
// one sentence — "Tap the dice to get some Estonian words" — so they share a
// single Text and wrap together; splitting them across the row read as two
// unrelated labels. `action` is what the person does, in bold; `rest` finishes
// the phrase. `trailing` hangs an optional control off the end.
const StepHeader = ({
  step,
  action,
  rest,
  theme,
  isDark,
  trailing,
}: {
  step: string;
  action: string;
  rest: string;
  theme: Theme;
  isDark: boolean;
  trailing?: React.ReactNode;
}) => (
  <View style={styles.stepRow}>
    <Text style={[styles.stepHeading, { color: theme.text }]}>
      {/* #35529D is too dark to carry a small numeral on a near-black
          background, so the numbers borrow the lighter blue in dark mode. */}
      <Text style={[styles.stepNumber, { color: isDark ? theme.lightblue : theme.accent }]}>
        {step}
      </Text>
      {'  '}
      {action}
      <Text style={[styles.stepRest, { color: theme.iconInactive }]}>{' ' + rest}</Text>
    </Text>
    {trailing}
  </View>
);

// The score lands above a sentence card that is already on screen and pushes
// it down. Fading and settling in makes that read as the answer arriving rather
// than as the layout jumping.
const ScoreCardEntrance = ({ style, children }: { style: any; children: React.ReactNode }) => {
  const [enter] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: NATIVE_DRIVER,
    }).start();
  }, [enter]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: enter,
          transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

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
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 }}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Icon name="sparkles-outline" size={18} color={theme.iconInactive} />
      </Animated.View>
      <Animated.Text style={{ opacity: fade, color: theme.iconInactive, fontSize: 15, fontFamily: Fonts.bodyMedium }}>
        {t(AI_LOADING_MESSAGE_KEYS[msgIndex])}
      </Animated.Text>
    </View>
  );
};

// What stands in the score card's slot until there is a score. Separate from
// the spinner above so the sentence can sit between them — in the same place it
// ends up once the answer arrives, instead of jumping down past the score.
const AIScoreSkeleton = () => (
  <View style={{ marginTop: 8 }}>
    <SkeletonLine width="100%" height={80} style={{ borderRadius: 12 }} />
  </View>
);

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

// Not an error state, so it carries none of the signals of one: no alert
// icon, no retry (the same words would get the same answer), and the accent
// colour rather than a warning. The only way forward is back to the sentence.
const WordsNotAdjustedState = ({
  theme,
  t,
  onEdit,
  onExamples,
}: {
  theme: Theme;
  t: (key: TranslationKey) => string;
  onEdit: () => void;
  onExamples: () => void;
}) => (
  <View style={{ alignItems: 'center', paddingVertical: 20 }}>
    {/* A warning, not a tip. Nothing was corrected and nothing was scored, so
        the screen has to read as "this didn't go through" rather than as an
        aside someone can skip. Same orange the app already uses to pull
        attention, which carries on both themes. */}
    <Icon name="alert-circle-outline" size={36} color="#E95A35" />
    <Text style={{ color: theme.text, fontSize: 16, fontFamily: Fonts.bodySemiBold, marginTop: 10, textAlign: 'center', maxWidth: 300 }}>
      {t('wordsNotAdjustedTitle')}
    </Text>
    <Text style={{ color: theme.iconInactive, fontSize: 13, fontFamily: Fonts.bodyRegular, textAlign: 'center', marginTop: 6, maxWidth: 300 }}>
      {t('wordsNotAdjustedSubtitle')}
    </Text>
    {/* On screen, not behind a tap. Someone who sent the words back unchanged
        has just shown the shape of the game didn't land, so the worked example
        is the one thing this view owes them — and a button reading "go read an
        example" is a dead end dressed as an action. With the example already
        here, the button can be what actually moves them on. */}
    <SentenceExamplePreview onMore={onExamples} />
    <TouchableOpacity
      onPress={onEdit}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: theme.accent,
        paddingHorizontal: 20,
        paddingVertical: 11,
        borderRadius: 999,
        marginTop: 18,
      }}
    >
      <Icon name="create-outline" size={16} color={theme.accentText} />
      <Text style={{ color: theme.accentText, fontFamily: Fonts.bodyBold, fontSize: 14 }}>{t('editSentence')}</Text>
    </TouchableOpacity>
  </View>
);

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const { t, language } = useTranslations();
  const { addEntry } = useHistory();
  const { 
    words, 
    refreshKey, 
    sentence, 
    setSentence, 
  } = useRandomWords();
  const { triggerRandom, setFeedbackOpen } = useRandom();

  const [cursorPosition, setCursorPosition] = useState(0);
  const [webInputHeight, setWebInputHeight] = useState(BASE_INPUT_HEIGHT);
  const [aiResult, setAiResult] = useState<AICheckResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [wordsNotAdjusted, setWordsNotAdjusted] = useState(false);
  // The sentence to translate, and what the card under step 2 is showing. One
  // value rather than a flag each, because the four states are exclusive.
  const [suggestion, setSuggestion] = useState('');
  const [suggestState, setSuggestState] =
    useState<'idle' | 'loading' | 'limit' | 'error'>('idle');
  // Null until a request comes back with it: the allowances live on the
  // backend and nothing here can know them before asking. So the counts
  // appear once one has been spent, rather than being guessed at on load.
  const [suggestRemaining, setSuggestRemaining] = useState<number | null>(null);
  // The offer holds back a few seconds after the words land. Appearing with
  // them reads as the app answering a question nobody has asked yet, and most
  // people want a moment to look at what they got before being handed help.
  const [offerReady, setOfferReady] = useState(false);
  const [offerFade] = useState(() => new Animated.Value(0));
  const [showingFeedback, setShowingFeedback] = useState(false);
  const [lastSentence, setLastSentence] = useState('');
  const [aiRemaining, setAiRemaining] = useState<number | null>(null);
  const [aiIsAuthenticated, setAiIsAuthenticated] = useState(false);
  const [aiReportVisible, setAiReportVisible] = useState(false);
  const [inputMountKey, setInputMountKey] = useState(0);
  const [examplesModalVisible, setExamplesModalVisible] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  // The hand-off from "sentence sent" to "answer on screen" used to be a hard
  // cut, which made sending and reading look like two unrelated screens. It is
  // one movement now, and the thing that carries it is the field itself: the
  // box the sentence was typed into travels down into the feedback section and
  // *is* the box that holds the sentence while the AI thinks. Nothing is
  // crossfaded into place, so there is nothing to recognise as a substitution.
  //
  // `sending` holds the screen in the input layout while it plays. The request
  // goes out first, so the animation runs inside the wait rather than adding
  // to it.
  const [sending, setSending] = useState(false);
  const [handoff] = useState(() => new Animated.Value(0));
  // Measured rather than guessed: with three words or nine, the distances are
  // completely different, and a hardcoded one is wrong in most cases.
  //
  // Heights, not positions. react-native-web drives onLayout off a
  // ResizeObserver, so it reports a box only when that box's own size changes
  // — never when something above it grows and shoves it down the screen. Any
  // offset read that way goes stale the first time a roll fills the word
  // cards. The one exception is the card's offset inside the panel, which
  // nothing above it can move.
  const [stepsHeight, setStepsHeight] = useState(0);
  const [fieldHeight, setFieldHeight] = useState(0);
  const [cardBox, setCardBox] = useState({ y: 0, height: 0 });
  // Flipped between the two stages: the descent is made by the field exactly as
  // it was, and only once it has landed does it turn into the sentence card.
  const [becameCard, setBecameCard] = useState(false);
  const handoffStartedRef = useRef(false);
  // Where the card ends up, less where the box starts. The panel does not move
  // at all any more: for the whole send it is parked at the feedback layout's
  // own top margin, so the landing place is that margin plus the card's offset
  // inside the panel. That offset is read off an invisible copy of the real
  // card, taken on the card itself so its own margin is inside the reading. The
  // box starts directly below the steps, which is their height.
  const cardTravel = FEEDBACK_TOP_MARGIN + cardBox.y - stepsHeight;
  const inputNodeRef = useRef<unknown>(null);
  // Where the caret belongs once the field has re-rendered after a tapped word
  // was inserted. See the layout effect that drains it.
  const pendingCaretRef = useRef<number | null>(null);
  const sentenceStartedRef = useRef(false);
  const subscribeModal = useSubscribeModal();
  const signInPromptModal = useSignInPromptModal();
  const { signOut } = useAuth();
  const [prevRefreshKey, setPrevRefreshKey] = useState(refreshKey);

  // The cards always sit three to a row and wrap, so steps 2 and 3 land in the
  // same place whatever someone set the roll size to in Config.
  const hasWords = words.length > 0;
  // The one genuine error state: a roll happened and produced nothing because
  // everything is excluded. Before the first roll an empty board is just the
  // board, not a problem.
  const noCategoriesSelected = !hasWords && refreshKey > 0;

  // When new words appear (new roll), go back to input mode. Adjusted directly
  // during render (rather than in an effect) since it's just resetting state to
  // match a new refreshKey, not synchronizing with anything external.
  if (refreshKey !== prevRefreshKey) {
    setPrevRefreshKey(refreshKey);
    setShowingFeedback(false);
    setAiResult(null);
    setAiLoading(false);
    setAiError(false);
    setWordsNotAdjusted(false);
    // The task belonged to the old words. Keeping it would leave a sentence
    // on screen that cannot be built from what is now on the cards.
    setSuggestion('');
    setSuggestState('idle');
    setWebInputHeight(BASE_INPUT_HEIGHT);
  }

  // The tab bar is rendered by the layout, which can't see this screen's state,
  // so the flag is mirrored into the shared context. An effect rather than a
  // call inside runAICheck because the refreshKey reset above clears this
  // during render, where writing another component's state isn't allowed.
  // Hidden from the moment the plane leaves, not just once the answer is up:
  // tapping the dice mid-flight would abandon the request that is already on
  // its way and lose the sentence with it.
  useEffect(() => {
    setFeedbackOpen(showingFeedback || sending);
  }, [showingFeedback, sending, setFeedbackOpen]);

  // Leaving the screen must not strand the bar hidden.
  useEffect(() => () => setFeedbackOpen(false), [setFeedbackOpen]);

  // Refs can't be written during render (unlike state) — this piece of the
  // same reset stays in an effect.
  useEffect(() => {
    sentenceStartedRef.current = false;
    setSending(false);
    setBecameCard(false);
    handoffStartedRef.current = false;
    handoff.setValue(0);
  }, [refreshKey, handoff]);

  // Impression on the first-run invitation. Without it, a visitor who saw the
  // hint and left can't be told apart from one who saw something broken.
  useEffect(() => {
    if (words.length === 0 && !showingFeedback && refreshKey === 0) {
      track(EVENTS.ROLL_HINT_SHOWN);
    }
  }, [words.length, showingFeedback, refreshKey]);

  // A textarea's scrollHeight can never report less than the height the
  // element already has, and react-native-web reads it during onChange off an
  // element that is still at its old, taller size. That is why the field grew
  // to two lines and then stayed there however much text was deleted.
  //
  // Measuring here instead, with the height collapsed for the length of the
  // read, gives a figure that can come down as well as go up. It has to be
  // zero and not `auto`: react-native-web renders a multiline field as a
  // <textarea>, and a textarea left to size itself falls back on its `rows`
  // attribute, which defaults to two — so `auto` measures the element's own
  // default rather than the text in it, and the field sits two lines tall
  // while empty. At zero, scrollHeight reports the content and its padding,
  // which for one line is exactly BASE_INPUT_HEIGHT.
  //
  // A layout effect rather than a change handler so it also covers text
  // arriving by other routes — a word tapped into the sentence, the field
  // being cleared — and so it lands before the frame is painted.
  useLayoutEffect(() => {
    if (Platform.OS !== 'web') return;
    const node: any = inputNodeRef.current;
    if (!node || !node.style) return;

    const held = node.style.height;
    node.style.height = '0px';
    const measured = node.scrollHeight;
    node.style.height = held;

    if (measured > 0) setWebInputHeight(measured);
  }, [sentence, refreshKey, inputMountKey, sending]);

  // Put the caret back where the tapped word left it. A word dropped into the
  // middle of a sentence would otherwise push the caret to the end, so the
  // next one landed in the wrong place and typing carried on somewhere else
  // than where you were looking.
  useLayoutEffect(() => {
    if (Platform.OS !== 'web') return;
    const caret = pendingCaretRef.current;
    if (caret == null) return;
    pendingCaretRef.current = null;

    const node: any = inputNodeRef.current;
    if (node && typeof node.setSelectionRange === 'function') {
      node.setSelectionRange(caret, caret);
    }
  }, [sentence]);

  const handleSentenceChange = (text: string) => {
    // Once per round, the moment the box stops being empty.
    if (!sentenceStartedRef.current && text.length > 0) {
      sentenceStartedRef.current = true;
      track(EVENTS.SENTENCE_STARTED, { wordCount: words.length });
    }
    setSentence(text);
  };

  const handleDoubleTap = (word: string) => {
    const node: any = inputNodeRef.current;

    // Read the caret off the field itself on web. `onSelectionChange` is wired
    // for native only, so the tracked position had no relationship to where
    // the caret actually was and every word landed at the end of whatever had
    // been typed. Native has no selectionStart and does track it, so it keeps
    // using the state.
    const caret =
      Platform.OS === 'web' && node && typeof node.selectionStart === 'number'
        ? node.selectionStart
        : cursorPosition;

    const at = Math.max(0, Math.min(caret, sentence.length));
    const before = sentence.slice(0, at);
    const after = sentence.slice(at);

    // Two words have to come out as two words. Only where there isn't already
    // whitespace, so repeated taps don't pile up spaces.
    const lead = before.length > 0 && !/\s$/.test(before) ? ' ' : '';
    const trail = after.length > 0 && !/^\s/.test(after) ? ' ' : '';

    const nextCaret = at + lead.length + word.length;
    setSentence(before + lead + word + trail + after);
    setCursorPosition(nextCaret);
    // Applied after the field re-renders with the new text — setting it now
    // would be overwritten by that render.
    pendingCaretRef.current = nextCaret;

    // Same bookkeeping typing gets, so a sentence built entirely by tapping
    // still counts as one that was started.
    if (!sentenceStartedRef.current) {
      sentenceStartedRef.current = true;
      track(EVENTS.SENTENCE_STARTED, { wordCount: words.length });
    }

    // Tapping the card took focus off the field, so the keyboard dropped and
    // the next keystroke went nowhere. Putting it back inside the same gesture
    // is also what lets a mobile browser reopen the keyboard at all.
    if (node && typeof node.focus === 'function') node.focus();
  };

  useEffect(() => {
    offerFade.setValue(0);
    setOfferReady(false);
    if (!hasWords) return;
    const timer = setTimeout(() => {
      setOfferReady(true);
      Animated.timing(offerFade, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: NATIVE_DRIVER,
      }).start();
    }, 2500);
    return () => clearTimeout(timer);
  }, [hasWords, refreshKey, offerFade]);

  const handleSuggest = useCallback(async () => {
    if (suggestState === 'loading' || !hasWords) return;

    setSuggestState('loading');
    setSuggestion('');
    track(EVENTS.SUGGEST_REQUESTED, { wordCount: words.length });

    try {
      const result = await suggestSentence({
        words: words.map(w => ({
          estonian: w.word,
          translation: getWordTranslation(w.word, w.category, language),
        })),
        language: languageMap[language] || 'English',
      });
      setSuggestion(result.promptSentence);
      setSuggestRemaining(result.remaining);
      setSuggestState('idle');
    } catch (e) {
      if (e instanceof SuggestLimitError) {
        track(EVENTS.SUGGEST_LIMIT_REACHED);
        setSuggestRemaining(0);
        setSuggestState('limit');
      } else if (e instanceof SessionInvalidError) {
        signOut().catch(() => {});
        setSuggestState('error');
      } else {
        const why = aiErrorProperties(e);
        console.error('Suggest failed:', JSON.stringify(why), e);
        track(EVENTS.SUGGEST_FAILED, why);
        setSuggestState('error');
      }
    }
  }, [words, hasWords, language, suggestState, signOut]);

  // Both the prompt box and the field below it key off this: the two are drawn
  // as one shape only while there is something in the prompt.
  const suggestCardVisible = hasWords && (!!suggestion || suggestState !== 'idle');

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
    setWordsNotAdjusted(false);
    setAiLoading(true);
    Keyboard.dismiss();
    // Who switches to the feedback layout depends on the caller: a first send
    // hands over when its animation lands, a retry is already there.

    try {
      const result = await checkSentenceWithAI({
        words: aiWords,
        sentence: sentenceToCheck,
        language: languageMap[language] || "English",
      });
      setAiResult(result);
      track(EVENTS.AI_CHECK_SUCCEEDED, { score: result.score, remaining: result.remaining });
      setAiRemaining(result.remaining);
      setAiIsAuthenticated(result.isAuthenticated);
      addEntry(words, sentenceToCheck, result);
      subscribeModal.onAICheckSuccess();
      setSentence('');
      setInputMountKey(k => k + 1);
    } catch (e) {
      if (e instanceof DailyLimitError) {
        // Tracked as neither success nor failure before, so hitting the cap
        // looked like silence.
        track(EVENTS.AI_LIMIT_REACHED, { isAuthenticated: e.isAuthenticated });
        addEntry(words, sentenceToCheck);
        setSentence('');
        setInputMountKey(k => k + 1);
          setAiRemaining(0);
        setAiIsAuthenticated(e.isAuthenticated);
      } else if (e instanceof WordsNotAdjustedError) {
        // Deliberately not saved to History and not cleared from the input:
        // there is nothing to look back on, and the sentence is what they are
        // about to go fix.
        track(EVENTS.AI_WORDS_NOT_ADJUSTED, { wordCount: words.length });
        setAiRemaining(e.remaining);
        setAiIsAuthenticated(e.isAuthenticated);
        setWordsNotAdjusted(true);
      } else if (e instanceof SessionInvalidError) {
        console.error("AI check failed: invalid session, signing out", e);
        signOut().catch(() => {});
        track(EVENTS.AI_CHECK_FAILED, { reason: 'session_invalid' });
        setAiError(true);
      } else {
        const why = aiErrorProperties(e);
        // Logged classified rather than raw: Safari prints a bare fetch
        // rejection as a stack with no cause above it, so the one failure that
        // turned up in testing said nothing at all about what had gone wrong.
        // This is the same reading that goes to PostHog, in the console.
        console.error('AI check failed:', JSON.stringify(why), e);
        track(EVENTS.AI_CHECK_FAILED, why);
        setAiError(true);
      }
    } finally {
      setAiLoading(false);
    }
  }, [words, language, addEntry, subscribeModal, setSentence, signOut]);

  const startHandoff = useCallback(() => {
    if (!sentence.trim()) return;

    setSending(true);
    setBecameCard(false);
    // Thrown away so the gate below waits for a reading of the card this send
    // is flying towards: a longer sentence wraps onto a second line, and the box
    // has to morph to that height rather than to the last one's.
    setCardBox({ y: 0, height: 0 });
    handoffStartedRef.current = false;
    handoff.setValue(0);
    // Sent first, animated second — the request is not held back by it. The
    // movement itself starts from the effect below, once the screen has been
    // measured.
    runAICheck(sentence.trim());
  }, [sentence, runAICheck, handoff]);

  const handleAICheck = useCallback(() => {
    if (!sentence.trim()) return;
    // One frame later, for the same reason the dice defers its roll: the
    // hand-off rearranges the screen around the button that was just pressed,
    // and doing that inside the touch's own event leaves the browser reporting
    // a gesture whose element has moved out from under it.
    requestAnimationFrame(() => startHandoff());
  }, [sentence, startHandoff]);


  // One movement, one value. The typography change still has its own moment —
  // a listener flips it at MORPH_AT rather than a second animation doing it —
  // so the box never stops or changes direction on the way.
  const runHandoff = useCallback(() => {
    const id = handoff.addListener(({ value }) => {
      if (value >= MORPH_AT) setBecameCard(true);
    });

    Animated.timing(handoff, {
      toValue: 1,
      duration: HANDOFF_MS,
      easing: Easing.inOut(Easing.cubic),
      // The field's background and text colour travel together, and colours
      // cannot go through the native driver. Web has no native driver anyway,
      // which is where this runs.
      useNativeDriver: false,
    }).start(({ finished }) => {
      handoff.removeListener(id);
      if (!finished) return;
      // The box is now exactly where the feedback layout draws the sentence,
      // showing the same thing, so swapping the layout underneath it changes
      // nothing on screen.
      setShowingFeedback(true);
      setSending(false);
      setBecameCard(false);
    });
  }, [handoff]);

  // How far the box falls depends on the score's stand-in, which only exists
  // once `sending` is true — so the first frame of a send is spent measuring
  // and the movement begins on the next one. The timer is a safety net: if a
  // measurement never arrives, the hand-off still happens rather than leaving
  // someone watching a field that will never move.
  useEffect(() => {
    if (!sending || handoffStartedRef.current) return;
    const begin = () => {
      if (handoffStartedRef.current) return;
      handoffStartedRef.current = true;
      runHandoff();
    };

    if (cardBox.height > 0 && fieldHeight > 0 && stepsHeight > 0) {
      begin();
      return;
    }
    const fallback = setTimeout(begin, 250);
    return () => clearTimeout(fallback);
  }, [sending, cardBox.height, fieldHeight, stepsHeight, runHandoff]);

  const handleRetry = useCallback(() => {
    setShowingFeedback(true);
    runAICheck(lastSentence);
  }, [lastSentence, runAICheck]);

  const handleEditSentence = useCallback(() => {
    setSentence(lastSentence);
    setShowingFeedback(false);
    setAiError(false);
    setWordsNotAdjusted(false);
    setSending(false);
    setBecameCard(false);
    handoffStartedRef.current = false;
    handoff.setValue(0);
  }, [lastSentence, setSentence, handoff]);

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

  // The screen scrolls while the sentence input is on it. Without a scroller,
  // focusing the input gives the browser nothing to scroll, so iOS WebKit moves
  // the whole visual viewport instead — which is what made the page jump, and
  // what no amount of compensating from JS could fix without either flashing or
  // stranding the input under the keyboard on a tall roll. With one, the
  // browser scrolls this container the way it does on any web form: the title
  // slides up, the input always stays reachable, and nothing fights anything.
  // The feedback view keeps its own layout — it has a ScrollView of its own.
  // One definition, two places: the invisible copy that reserves the landing
  // spot during a send, and the real one the feedback layout draws under the
  // score. `extra` is how the reserved copy hides itself and gets measured —
  // on the card itself, margin included, so what the box aims at is the card's
  // true frame rather than a wrapper's.
  const renderSentenceCard = (extra?: { style?: StyleProp<ViewStyle>; onLayout?: (e: LayoutChangeEvent) => void }) => (
    <View
      style={[styles.userSentenceContainer, { borderColor: theme.border }, extra?.style]}
      onLayout={extra?.onLayout}
    >
      <Text style={[styles.userSentenceLabel, { color: theme.text }]}>{t('yourSentence')}</Text>
      <Text style={[styles.userSentenceText, { color: theme.text }]}>{lastSentence}</Text>
    </View>
  );

  const inner = (
    <>
        <Text style={[styles.title, { color: theme.text }]}>
          EestiR
          <Image
            source={require('@/assets/images/dice-static-small.png')}
            style={styles.titleDiceO}
            resizeMode="contain"
          />
          ll
        </Text>

        {/* The three steps are one continuous scaffold rather than states that
            replace each other: before the first roll each step shows a drawing
            of what it will hold, and the real thing takes the same slot when it
            arrives. Nothing moves, so nothing reads as appearing or breaking —
            which is the whole point, since the screen used to say what the app
            did without ever showing it. */}
        {/* One parent for both layers, starting right under the title, which is
            also where the feedback layout begins — that is what makes the two
            comparable at all. */}
        {!showingFeedback && (
          <View>
          {/* Everything above the answer, as one layer. The moment a send
              starts it leaves the flow, and with nothing holding that space the
              panel below simply sits where the feedback layout will draw it: no
              rise, no transform, no distances to keep in agreement, and nothing
              left to shift when the two layouts swap. Taking it out of the flow
              does not move it, since it was already the first thing in this
              parent. */}
          <View style={sending ? styles.departing : undefined}>
          <Animated.View
            onLayout={e => setStepsHeight(e.nativeEvent.layout.height)}
            style={{
              opacity: handoff.interpolate({ inputRange: [0, 0.55], outputRange: [1, 0], extrapolate: 'clamp' }),
              transform: [
                { translateY: handoff.interpolate({ inputRange: [0, 1], outputRange: [0, -44] }) },
              ],
            }}
          >
            <StepHeader
              step="1"
              action={t('rollStep1Title')}
              rest={t('rollStep1Body')}
              theme={theme}
              isDark={isDark}
            />

            {hasWords ? (
              <View style={[styles.wordsContainer, words.length < 3 && styles.wordsContainerShort]}>
                {words.map((item, index) => (
                  <View key={index} style={styles.wordSlot}>
                    <WordCard
                      word={item.word}
                      category={item.category}
                      color={categoryColorMap[item.category]}
                      refreshKey={refreshKey}
                      uppercaseCategory={true}
                      compact
                      onDoubleTap={handleDoubleTap}
                    />
                  </View>
                ))}
              </View>
            ) : noCategoriesSelected ? (
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
            ) : (
              <View style={styles.wordsContainer}>
                {[0, 1, 2].map(i => (
                  <View key={i} style={styles.wordSlot}>
                    <WordCardPlaceholder borderColor={theme.border} markColor={theme.iconInactive} />
                  </View>
                ))}
              </View>
            )}

            <StepHeader
              step="2"
              action={t('rollStep2Title')}
              rest={t('rollStep2Body')}
              theme={theme}
              isDark={isDark}
              trailing={
                hasWords ? (
                  <TouchableOpacity
                    onPress={() => {
                      track(EVENTS.EXAMPLES_OPENED);
                      setExamplesModalVisible(true);
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.stepInfoButton}
                  >
                    <Icon name="information-circle-outline" size={18} color={theme.text} />
                  </TouchableOpacity>
                ) : undefined
              }
            />

            {/* Above the field rather than in it: it stays readable while the
                answer is being typed, which is the whole time it is useful. */}
            {suggestCardVisible && (
              <View style={[styles.suggestCard, { borderColor: theme.border }]}>
                <View style={styles.suggestTopRow}>
                  <Text style={[styles.suggestLabel, { color: theme.accent }]}>
                    {t('suggestLabel')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => { setSuggestion(''); setSuggestState('idle'); }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Icon name="close" size={14} color={theme.iconInactive} />
                  </TouchableOpacity>
                </View>
                {suggestState === 'loading' ? (
                  <SkeletonLine width="80%" />
                ) : suggestState === 'limit' ? (
                  <Text style={[styles.suggestNote, { color: theme.iconInactive }]}>
                    {t('suggestLimitReached')}
                  </Text>
                ) : suggestState === 'error' ? (
                  <Text style={[styles.suggestNote, { color: theme.iconInactive }]}>
                    {t('suggestError')}
                  </Text>
                ) : (
                  <Text style={[styles.suggestSentence, { color: theme.text }]}>
                    {suggestion}
                  </Text>
                )}
              </View>
            )}

          </Animated.View>


            {/* The travelling box. On the way down its fill and border morph
                into the sentence card's, and its contents swap from the field
                to the sentence itself — the element is never unmounted, so
                there is no substitution to notice. It reads `lastSentence`
                while sending because a successful check clears `sentence`,
                which would empty the box mid-wait. */}
            <Animated.View
              // Frozen while sending: the box's own shape changes as it
              // travels, and re-measuring it mid-flight would keep moving the
              // target it is flying towards.
              onLayout={e => {
                if (sending) return;
                setFieldHeight(e.nativeEvent.layout.height);
              }}
              style={[
              styles.inputContainer,
              sending && styles.sentenceBoxSending,
              {
                backgroundColor: sending
                  ? handoff.interpolate({
                      inputRange: [0, MORPH_AT, 1],
                      outputRange: [theme.inputBackground, isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'],
                    })
                  : hasWords ? theme.inputBackground : 'transparent',
                borderWidth: inputFocused && !sending ? 2 : 1,
                borderColor: sending
                  ? theme.border
                  : inputFocused ? '#3468DC' : theme.border,
                marginTop: 0,
                // Square where the two meet, so the prompt and the field it
                // belongs to read as one box with a divider rather than two
                // unrelated cards stacked up. Round again the moment a send
                // starts, since the box leaves on its own from there.
                ...(suggestCardVisible && !sending
                  ? { borderTopLeftRadius: 0, borderTopRightRadius: 0 }
                  : null),
                // Through the descent the box keeps the field's exact
                // dimensions — nothing about it should change while it is
                // moving. It takes on the card's shape afterwards, together
                // with the label and the italic, as one change rather than
                // three scattered through the trip.
                ...(sending ? {
                  height: handoff.interpolate({
                    inputRange: [0, MORPH_AT, 1],
                    outputRange: [fieldHeight, fieldHeight, cardBox.height || fieldHeight],
                  }),
                  paddingHorizontal: handoff.interpolate({ inputRange: [0, MORPH_AT, 1], outputRange: [15, 15, 12] }),
                  paddingVertical: handoff.interpolate({ inputRange: [0, MORPH_AT, 1], outputRange: [10, 10, 12] }),
                  borderRadius: handoff.interpolate({ inputRange: [0, MORPH_AT, 1], outputRange: [12, 12, 10] }),
                } : null),
                transform: [
                  { translateY: handoff.interpolate({ inputRange: [0, 1], outputRange: [0, cardTravel] }) },
                ],
              }
            ]}>
              {sending ? (
                <View style={styles.sentenceBoxBody}>
                  {/* Only once the box has landed: the label's room opens and
                      the sentence takes the card's italic at the same moment,
                      so there is one visible change instead of a slow drift
                      through the descent. */}
                  {becameCard && (
                    <Animated.View
                      style={{
                        height: handoff.interpolate({ inputRange: [MORPH_AT, 1], outputRange: [0, SENTENCE_LABEL_BLOCK], extrapolate: 'clamp' }),
                        overflow: 'hidden',
                        opacity: handoff.interpolate({ inputRange: [MORPH_AT, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
                      }}
                    >
                      <Text style={[styles.userSentenceLabel, { color: theme.text }]}>
                        {t('yourSentence')}
                      </Text>
                    </Animated.View>
                  )}
                  {/* The colour travels with the background. Left at the
                      card's near-white, the sentence was invisible for the
                      first half of the trip — white on a field that was still
                      white — and looked like it had vanished and come back. */}
                  <Animated.Text
                    style={[
                      becameCard ? styles.userSentenceText : styles.sentencePlain,
                      {
                        color: handoff.interpolate({
                          inputRange: [0, MORPH_AT, 1],
                          outputRange: [theme.inputText, theme.text, theme.text],
                        }),
                      },
                    ]}
                  >
                    {lastSentence}
                  </Animated.Text>
                </View>
              ) : (
              <TextInput
                key={`${refreshKey}-${inputMountKey}`}
                ref={node => { inputNodeRef.current = node; }}
                style={[
                  styles.input,
                  { color: hasWords ? theme.inputText : theme.text },
                  Platform.OS === 'web' && {
                    outlineStyle: 'none',
                    height: Math.min(webInputHeight, MAX_INPUT_HEIGHT),
                    // `editable={false}` becomes `readOnly` on a <textarea>,
                    // and a read-only textarea still takes focus and shows a
                    // caret — so before the first roll the preview field
                    // answered to a tap and looked live. On native, editable
                    // already blocks focus; this is the web half of it.
                    ...(hasWords ? null : { pointerEvents: 'none' as const }),
                  } as any
                ]}
                placeholder={t('enterSentence')}
                placeholderTextColor={theme.iconInactive}
                value={sentence}
                editable={hasWords}
                onChangeText={handleSentenceChange}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onSelectionChange={Platform.OS !== 'web' ? handleSelectionChange : undefined}
                onContentSizeChange={
                  Platform.OS === 'web'
                    ? undefined
                    : (e) => setWebInputHeight(e.nativeEvent.contentSize.height)
                }
                maxLength={140}
                multiline
              />
              )}

              {(sentence.length > 0 || sending) && (
                <TouchableOpacity
                  // Taken out of the flow for the descent so the sentence can
                  // use the card's full width — otherwise the text reflows the
                  // moment the real card replaces this one.
                  style={[styles.sendButton, sending && styles.sendButtonLeaving]}
                  onPress={handleAICheck}
                  disabled={aiLoading || sending}
                >
                  {/* Away and up, at the halfway point of the descent: the
                      sentence has left, and the box carrying it keeps going
                      down without it. */}
                  <Animated.View
                    style={{
                      opacity: handoff.interpolate({ inputRange: [0.25, 0.6], outputRange: [1, 0], extrapolate: 'clamp' }),
                      transform: [
                        { translateY: handoff.interpolate({ inputRange: [0, 1], outputRange: [0, -70] }) },
                        { rotate: handoff.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-20deg'] }) },
                      ],
                    }}
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
                  </Animated.View>
                </TouchableOpacity>
              )}
            </Animated.View>
            {/* One line under the field, never two: the send hint once there
                is something to send, and before that the offer of a sentence
                to translate. A bare icon in the step header said nothing about
                what it did until you pressed it, and this is the moment the
                question actually comes up. */}
            {sentence.length > 0 ? (
              <Animated.Text
                style={[
                  styles.sendHint,
                  { color: theme.iconInactive, opacity: handoff.interpolate({ inputRange: [0, 0.3], outputRange: [1, 0], extrapolate: 'clamp' }) },
                ]}
              >
                {t('sendHint')}
                {aiRemaining !== null
                  ? '  ·  ' + t('remainingCount').replace('{n}', String(aiRemaining))
                  : ''}
              </Animated.Text>
            ) : !sending ? (
              // Present before the first roll as well, not only once there are
              // words: the preview scaffold has to account for everything the
              // real screen will hold, or step 3 drops by the height of this
              // line the moment the dice land. Which is the one thing this
              // screen was built not to do.
              //
              // So the line is always held and only the ink waits: invisible
              // with no words to suggest from, and fading in a few seconds
              // after they arrive, since offering help in the same instant
              // answers a question nobody has asked yet.
              <Animated.View
                style={{ opacity: offerFade, alignSelf: 'flex-start' }}
                pointerEvents={offerReady ? 'auto' : 'none'}
              >
                <TouchableOpacity
                  onPress={handleSuggest}
                  disabled={suggestState === 'loading'}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.suggestAskRow}
                >
                  <Icon
                    name="sparkles-outline"
                    size={14}
                    color={suggestState === 'loading' ? theme.iconInactive : theme.accent}
                  />
                  <Text
                    style={[
                      styles.suggestAsk,
                      { color: suggestState === 'loading' ? theme.iconInactive : theme.accent },
                    ]}
                  >
                    {t(suggestion ? 'suggestAnother' : 'suggestAsk')}
                  </Text>
                  {suggestRemaining !== null && (
                    <Text style={[styles.remainingCount, { color: theme.iconInactive }]}>
                      {t('remainingCount').replace('{n}', String(suggestRemaining))}
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ) : null}

            {/* Step 3 is a drawing until send: then its header leaves with the
                rest and its body slides down to clear the space the descending
                box is about to occupy. */}
            <Animated.View
              style={{
                opacity: handoff.interpolate({ inputRange: [0, 0.25], outputRange: [1, 0], extrapolate: 'clamp' }),
              }}
            >
              <StepHeader
                step="3"
                action={t('rollStep3Title')}
                rest={t('rollStep3Body')}
                theme={theme}
                isDark={isDark}
              />
            </Animated.View>
            </View>

            {/* The answer's own layout, held at the same top margin
                styles.feedbackContainer has. With the steps out of the flow
                this is the only thing above it, so what is on screen during the
                send and what replaces it afterwards begin at the same pixel. */}
            <View style={sending ? styles.landingPanel : undefined}>
              {sending ? (
                // The feedback layout, piece for piece, drawn where that
                // layout will draw it, with the sentence's place left open for
                // the box on its way in. By the time the layouts swap, both
                // sides are showing the same thing in the same place, so the
                // swap itself is invisible.
                <>
                  {/* Shown only once the box has all but arrived. Earlier than
                      that and there are two things moving at once for the eye
                      to reconcile. */}
                  <Animated.View
                    style={{ opacity: handoff.interpolate({ inputRange: [0.72, 0.95], outputRange: [0, 1], extrapolate: 'clamp' }) }}
                  >
                    <AIScoreSkeleton />
                  </Animated.View>

                  {/* The real card, invisible, holding the place the box is
                      flying into. Reserving the space this way means the gap is
                      the card's own height by definition, and the landing spot
                      is read off it rather than added up from constants. */}
                  {renderSentenceCard({
                    style: styles.reservedCard,
                    onLayout: e =>
                      setCardBox({ y: e.nativeEvent.layout.y, height: e.nativeEvent.layout.height }),
                  })}

                  <Animated.View
                    style={{
                      opacity: handoff.interpolate({ inputRange: [0.8, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
                    }}
                  >
                    <View style={styles.thinkingRow}>
                      <AILoadingState theme={theme} t={t} />
                    </View>
                    <SkeletonLine width="90%" />
                    <SkeletonLine width="75%" />
                    <SkeletonLine width="60%" style={{ marginTop: 12 }} />
                    <SkeletonLine width="95%" style={{ marginTop: 12 }} />
                    <SkeletonLine width="80%" />
                  </Animated.View>
                </>
              ) : (
                <View style={[styles.previewFeedback, { borderColor: theme.border }]}>
                  <SkeletonLine animated={false} width="82%" height={9} />
                  <SkeletonLine animated={false} width="64%" height={9} />
                  <SkeletonLine animated={false} width="45%" height={9} />
                </View>
              )}
            </View>
          </View>
        )}

        {showingFeedback && aiError && (
          <View style={styles.feedbackContainer}>
            <AIErrorState theme={theme} t={t} onRetry={handleRetry} onEdit={handleEditSentence} />
          </View>
        )}

        {showingFeedback && !aiError && wordsNotAdjusted && (
          <View style={styles.feedbackContainer}>
            <WordsNotAdjustedState
              theme={theme}
              t={t}
              onEdit={handleEditSentence}
              onExamples={() => {
                track(EVENTS.EXAMPLES_OPENED);
                setExamplesModalVisible(true);
              }}
            />
          </View>
        )}

        {showingFeedback && !aiError && !wordsNotAdjusted && (
          <View style={styles.feedbackContainer}>
            {/* While the answer is still coming, the sentence is on top — the
                box that just travelled down the screen left it there. The score
                takes that place when it arrives and the sentence settles under
                it, which is the order it reads best in once there is something
                to read. */}
            {aiResult ? (
              <ScoreCardEntrance style={[styles.scoreCard, { backgroundColor: getScoreColor(aiResult.score) + '20', borderColor: getScoreColor(aiResult.score) }]}>
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
              </ScoreCardEntrance>
            ) : aiRemaining === 0 ? (
              <Text style={{ color: '#E95A35', fontSize: 16, fontFamily: Fonts.bodySemiBold, textAlign: 'center' }}>
                {t(aiIsAuthenticated ? 'dailyLimitReachedAuth' : 'dailyLimitReachedAnon')}
              </Text>
            ) : (
              <AIScoreSkeleton />
            )}

            {renderSentenceCard()}

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
                  <View style={styles.thinkingRow}>
                    <AILoadingState theme={theme} t={t} />
                  </View>
                  <SkeletonLine width="90%" />
                  <SkeletonLine width="75%" />
                  <SkeletonLine width="60%" style={{ marginTop: 12 }} />
                  <SkeletonLine width="95%" style={{ marginTop: 12 }} />
                  <SkeletonLine width="80%" />
                </>
              )}

              {/* The dice in the tab bar does roll again, but nothing says so
                  from in here. Spell it out at the end of the answer, where
                  someone who has finished reading is looking anyway. */}
              {(aiResult || aiRemaining === 0) && (
                <>
                  <TouchableOpacity
                    onPress={() => triggerRandom()}
                    style={[styles.continueButton, { backgroundColor: theme.accent }]}
                  >
                    <Icon name="refresh-outline" size={16} color={theme.accentText} />
                    <Text style={[styles.continueButtonText, { color: theme.accentText }]}>
                      {t('continueLearning')}
                    </Text>
                  </TouchableOpacity>
                  {/* Under the button rather than up with the answer: pressing
                      Continue learning is what spends the next one, so this is
                      where the question comes up. Shown at zero too, which is
                      the number someone most needs to see. */}
                  {aiRemaining !== null && (
                    <Text style={[styles.continueRemaining, { color: theme.iconInactive }]}>
                      {t('remainingCorrections').replace('{n}', String(aiRemaining))}
                    </Text>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        )}
    </>
  );

  const content = (
    <View style={styles.contentWrapper}>
      {showingFeedback ? (
        <View style={styles.contentFixed}>{inner}</View>
      ) : (
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {inner}
        </ScrollView>
      )}
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
  contentScroll: {
    flex: 1,
  },
  // Scroll content container: must grow with the content, so flexBasis stays
  // auto. `flex: 1` here would pin it to the viewport and defeat the scroll.
  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 120
  },
  // Feedback view: the opposite requirement. Its height has to be capped at the
  // parent's so the ScrollView nested inside it has somewhere to scroll — with
  // flexBasis auto it would stretch to fit the whole response instead.
  // No bottom padding at all: this is the scroller's frame, and anything here
  // is dead margin the content can never scroll through — it clipped the
  // continue button at the end of a long answer. The breathing room belongs
  // inside the scroll content instead (feedbackScrollContent).
  contentFixed: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 10,
    gap: 6,
  },
  stepHeading: {
    fontSize: 16,
    fontFamily: Fonts.bodyBold,
    flexShrink: 1,
  },
  stepNumber: {
    fontSize: 15,
    fontFamily: Fonts.bodyBold,
  },
  // Same size as the action it follows, so the line reads as one sentence —
  // only the weight and the colour separate the instruction from its object.
  stepRest: {
    fontSize: 16,
    fontFamily: Fonts.bodyRegular,
  },
  stepInfoButton: {
    paddingVertical: 2,
  },
  // Drawings of what each step will hold. Deliberately unfilled and static —
  // anything that pulses or looks finished reads as loading or as content.
  previewFeedback: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  // What the travelling box becomes: the sentence card's padding and radius,
  // taken on for the descent so that by the time the feedback layout draws the
  // real card in its place, the two are the same shape.
  sentenceBoxSending: {
    alignItems: 'stretch',
  },
  sentencePlain: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: Fonts.bodyRegular,
  },
  sentenceBoxBody: {
    flex: 1,
    justifyContent: 'center',
  },
  thinkingRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  // Out of the flow while a send is in the air: the steps, the travelling box
  // and the send button all leave together, and none of them should be holding
  // space the answer is about to need. Written out rather than
  // StyleSheet.absoluteFillObject, which this React Native version does not
  // type.
  departing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  landingPanel: {
    marginTop: FEEDBACK_TOP_MARGIN,
  },
  suggestCard: {
    marginTop: 10,
    marginBottom: 0,
    // No bottom edge and no bottom corners: the field below closes the shape.
    borderBottomWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    // The dismiss icon makes the label row taller than the 10px label, so even
    // padding left the sentence sitting low in the box. Less above it, more
    // below, and the two read as evenly inset. Horizontal padding and radius
    // match the field beneath so their text lines up on the same left edge.
    paddingTop: 10,
    paddingBottom: 13,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
  },
  suggestTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  suggestLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontFamily: Fonts.bodyBold,
  },
  suggestSentence: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily: Fonts.bodySemiBold,
  },
  suggestAskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  suggestAsk: {
    fontSize: 13,
    fontFamily: Fonts.bodySemiBold,
  },
  remainingCount: {
    fontSize: 11,
    fontFamily: Fonts.bodyRegular,
  },
  suggestNote: {
    fontSize: 13,
    fontFamily: Fonts.bodyRegular,
  },
  reservedCard: {
    opacity: 0,
  },
  sendButtonLeaving: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  // The card is the first thing in the feedback layout now, so it carries the
  // top margin the score card used to.
  userSentenceLead: {
    marginTop: 20,
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
  // Three to a row, filling the width exactly. `gap` plus a percentage width
  // cannot do that — 3 x 30% leaves a gap's worth of dead space on the right —
  // so the gutter is padding inside each slot, cancelled at the two outer
  // edges by the container's negative margin. Percentages keep wrapping
  // working for rolls of up to nine.
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -4,
  },
  // A roll of one or two would otherwise hug the left edge and look like the
  // rest failed to arrive.
  wordsContainerShort: {
    justifyContent: 'center',
  },
  wordSlot: {
    width: '33.3333%',
    paddingHorizontal: 4,
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
    paddingBottom: 32,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 999,
    marginTop: 24,
  },
  continueButtonText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
  },
  continueRemaining: {
    alignSelf: 'center',
    marginTop: 10,
    fontSize: 12,
    fontFamily: Fonts.bodyRegular,
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
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    opacity: 0.5,
    fontFamily: Fonts.bodySemiBold,
  },
  userSentenceText: {
    fontSize: 16,
    lineHeight: 20,
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
  sendHint: {
    fontSize: 12,
    marginTop: 8,
    // Under the send button it refers to, not adrift in the middle.
    textAlign: 'right',
    fontFamily: Fonts.bodyRegular,
  },
});