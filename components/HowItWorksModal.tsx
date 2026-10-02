import { AIShimmerIcon } from '@/components/AIShimmerIcon';
import { Icon } from '@/components/Icon';
import { Fonts } from '@/constants/Fonts';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from '@/hooks/useTranslations';
import { TranslationKey } from '@/utils/translations';
import { Category, categoryColorMap } from '@/utils/wordData';
import { ComponentProps, useEffect, useState } from 'react';
import { Animated, Easing, Image, Modal, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

// The native animated module doesn't exist on web — requesting it there just
// prints a noisy fallback warning on every animation.
const NATIVE_DRIVER = Platform.OS !== 'web';

interface HowItWorksModalProps {
  visible: boolean;
  onDismiss: () => void;
}

// "Add to Home Screen" only means anything in a browser tab — pointless
// inside Expo Go/a native shell, so the bonus step just doesn't exist there.
type InstallBucket = 'ios' | 'android' | 'other';

const getInstallBucket = (): InstallBucket => {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'other';
};

// Doesn't change over the life of the app, so computing it once at module
// load (rather than per-render) is fine.
const INSTALL_BUCKET = getInstallBucket();

const INSTALL_BODY_KEY: Record<InstallBucket, TranslationKey> = {
  ios: 'howItWorksStep4BodyIOS',
  android: 'howItWorksStep4BodyAndroid',
  other: 'howItWorksStep4BodyOther',
};

// share-outline = iOS's Share sheet, ellipsis-vertical = Android/Chrome's
// overflow menu. "other" covers desktop, where a real install prompt is too
// inconsistent across browsers to promise — bookmarking is what actually
// works everywhere, hence the star instead of an install icon.
const INSTALL_ICON: Record<InstallBucket, ComponentProps<typeof Icon>['name']> = {
  ios: 'share-outline',
  android: 'ellipsis-vertical',
  other: 'star-outline',
};

// hintIcon/hintLabelKey mock up an icon that's due for its own redesign later
// (settings gear, history clock) — placeholder art, not final.
const STEPS: {
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  hintKey?: TranslationKey;
  hintIcon?: ComponentProps<typeof Icon>['name'];
  hintLabelKey?: TranslationKey;
  bonus?: boolean;
}[] = [
  {
    titleKey: 'howItWorksStep1Title',
    bodyKey: 'howItWorksStep1Body',
    hintKey: 'howItWorksStep1Hint',
    hintIcon: 'settings-outline',
    hintLabelKey: 'configuration',
  },
  { titleKey: 'howItWorksStep2Title', bodyKey: 'howItWorksStep2Body' },
  {
    titleKey: 'howItWorksStep3Title',
    bodyKey: 'howItWorksStep3Body',
    hintKey: 'howItWorksStep3Hint',
    hintIcon: 'time-outline',
    hintLabelKey: 'history',
  },
  ...(Platform.OS === 'web'
    ? [
        {
          titleKey: 'howItWorksStep4Title' as TranslationKey,
          bodyKey: 'howItWorksStep4Subtitle' as TranslationKey,
          hintKey: INSTALL_BODY_KEY[INSTALL_BUCKET],
          bonus: true,
        },
      ]
    : []),
];

// The same rolled words used as the worked example on the real home screen
// card, so the tutorial and the actual UI tell one consistent story.
const DEMO_WORDS: { category: Category; word: string }[] = [
  { category: 'PLACE', word: 'Kodu' },
  { category: 'PRONOUN', word: 'Ma' },
  { category: 'VERB', word: 'Olema' },
];

const TYPED_SENTENCE = 'Ma olen kodus';

// Matches getScoreColor(5) on the real result card.
const RESULT_SCORE_COLOR = '#3C8D5F';

// Tap the dice → it shakes → the rolled words fade in below it. Loops so the
// gesture reads clearly even if someone lingers on this step.
const DiceRollDemo = ({ rippleColor }: { rippleColor: string }) => {
  const [rotate] = useState(() => new Animated.Value(0));
  const [rippleScale] = useState(() => new Animated.Value(0));
  const [rippleOpacity] = useState(() => new Animated.Value(0));
  const [chipsOpacity] = useState(() => new Animated.Value(0));
  const [chipsTranslate] = useState(() => new Animated.Value(8));

  useEffect(() => {
    let cancelled = false;

    const run = () => {
      rotate.setValue(0);
      rippleScale.setValue(0.6);
      rippleOpacity.setValue(0);
      chipsOpacity.setValue(0);
      chipsTranslate.setValue(8);

      Animated.sequence([
        Animated.delay(500),
        // Ripple and shake fire together — the "tap" and the dice's reaction
        // to it should read as one gesture, not two in sequence.
        Animated.parallel([
          Animated.sequence([
            Animated.parallel([
              Animated.timing(rippleOpacity, { toValue: 1, duration: 120, useNativeDriver: NATIVE_DRIVER }),
              Animated.timing(rippleScale, { toValue: 1.35, duration: 420, useNativeDriver: NATIVE_DRIVER }),
            ]),
            Animated.timing(rippleOpacity, { toValue: 0, duration: 200, useNativeDriver: NATIVE_DRIVER }),
          ]),
          Animated.sequence([
            Animated.timing(rotate, { toValue: 1, duration: 60, useNativeDriver: NATIVE_DRIVER }),
            Animated.timing(rotate, { toValue: -1, duration: 60, useNativeDriver: NATIVE_DRIVER }),
            Animated.timing(rotate, { toValue: 1, duration: 60, useNativeDriver: NATIVE_DRIVER }),
            Animated.timing(rotate, { toValue: 0, duration: 60, useNativeDriver: NATIVE_DRIVER }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(chipsOpacity, { toValue: 1, duration: 300, useNativeDriver: NATIVE_DRIVER }),
          Animated.timing(chipsTranslate, { toValue: 0, duration: 300, useNativeDriver: NATIVE_DRIVER }),
        ]),
        Animated.delay(1500),
        Animated.timing(chipsOpacity, { toValue: 0, duration: 250, useNativeDriver: NATIVE_DRIVER }),
      ]).start(({ finished }) => {
        if (finished && !cancelled) run();
      });
    };

    run();
    return () => { cancelled = true; };
  }, [rotate, rippleScale, rippleOpacity, chipsOpacity, chipsTranslate]);

  const rotateDeg = rotate.interpolate({ inputRange: [-1, 1], outputRange: ['-14deg', '14deg'] });

  // Words on top, dice below — mirrors the real screen, where the dice tab
  // button sits at the bottom and rolled words appear in the content above.
  return (
    <View style={{ alignItems: 'center' }}>
      <Animated.View
        style={[
          styles.wordsRow,
          { marginTop: 0, marginBottom: 14, opacity: chipsOpacity, transform: [{ translateY: chipsTranslate }] },
        ]}
      >
        {DEMO_WORDS.map((w) => (
          <View key={w.word} style={[styles.miniChip, { backgroundColor: categoryColorMap[w.category] }]}>
            <Text style={styles.miniChipText}>{w.word}</Text>
          </View>
        ))}
      </Animated.View>
      <View style={styles.diceStage}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ripple,
            {
              borderColor: rippleColor,
              opacity: rippleOpacity,
              transform: [{ scale: rippleScale }],
            },
          ]}
        />
        <Animated.View style={{ transform: [{ rotate: rotateDeg }] }}>
          <Image
            source={require('@/assets/images/dice-static-small.png')}
            style={styles.diceImage}
            resizeMode="contain"
            fadeDuration={0}
          />
        </Animated.View>
      </View>
    </View>
  );
};

// The rolled words stay in their base/dictionary form (Ma, Olema, Kodu) —
// they're raw material, not draggable blocks. What actually goes in the
// sentence is typed by hand and often changes form (olema → olen).
const WriteSentenceDemo = ({ theme }: { theme: ReturnType<typeof useTheme>['theme'] }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let typingInterval: ReturnType<typeof setInterval> | undefined;
    let restartTimeout: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    // The input box itself is static (always in view, see the plain View
    // below) — only the text inside it animates, so there's nothing to wait
    // on before typing starts.
    const startTyping = () => {
      let charIndex = 0;
      setDisplayed('');
      typingInterval = setInterval(() => {
        charIndex += 1;
        setDisplayed(TYPED_SENTENCE.slice(0, charIndex));
        if (charIndex >= TYPED_SENTENCE.length) {
          if (typingInterval) clearInterval(typingInterval);
          restartTimeout = setTimeout(() => {
            if (cancelled) return;
            startTyping();
          }, 1800);
        }
      }, 130);
    };

    startTyping();

    return () => {
      cancelled = true;
      if (typingInterval) clearInterval(typingInterval);
      if (restartTimeout) clearTimeout(restartTimeout);
    };
  }, []);

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={styles.wordsRow}>
        {DEMO_WORDS.map((w) => (
          <View key={w.word} style={[styles.miniChip, { backgroundColor: categoryColorMap[w.category] }]}>
            <Text style={styles.miniChipText}>{w.word}</Text>
          </View>
        ))}
      </View>
      <View style={[styles.typedInputBox, { borderColor: theme.border, backgroundColor: theme.inputBackground }]}>
        <Text style={{ color: theme.inputText, fontSize: 16, lineHeight: 20, fontFamily: Fonts.bodyRegular }}>
          {displayed}
        </Text>
      </View>
    </View>
  );
};

// Mirrors the real flow: the written sentence sits in the input, the send
// button gets tapped, a brief "checking" state stands in for the AI call,
// then the score lands. Loops through the three phases with a quick
// crossfade between each.
const FeedbackDemo = ({ theme }: { theme: ReturnType<typeof useTheme>['theme'] }) => {
  const { t } = useTranslations();
  const [phase, setPhase] = useState<'input' | 'loading' | 'result'>('input');
  const [fade] = useState(() => new Animated.Value(1));
  const [sendScale] = useState(() => new Animated.Value(1));
  const [rippleScale] = useState(() => new Animated.Value(0.5));
  const [rippleOpacity] = useState(() => new Animated.Value(0));
  const [spin] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let cancelled = false;
    const spinLoop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: NATIVE_DRIVER })
    );
    spinLoop.start();

    const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
    const crossfadeTo = (next: typeof phase) =>
      new Promise<void>((resolve) => {
        Animated.timing(fade, { toValue: 0, duration: 180, useNativeDriver: NATIVE_DRIVER }).start(() => {
          if (cancelled) return resolve();
          setPhase(next);
          Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: NATIVE_DRIVER }).start(() => resolve());
        });
      });
    const tapSend = () =>
      new Promise<void>((resolve) => {
        rippleScale.setValue(0.5);
        rippleOpacity.setValue(0);
        Animated.parallel([
          Animated.sequence([
            Animated.timing(sendScale, { toValue: 0.8, duration: 90, useNativeDriver: NATIVE_DRIVER }),
            Animated.timing(sendScale, { toValue: 1, duration: 120, useNativeDriver: NATIVE_DRIVER }),
          ]),
          // A quick ripple pulse around the icon — same "tap" language as the
          // dice ripple in Step 1 and the icon ripple in the bonus step —
          // since the icon's own scale-bounce alone read as too subtle.
          Animated.sequence([
            Animated.parallel([
              Animated.timing(rippleOpacity, { toValue: 1, duration: 80, useNativeDriver: NATIVE_DRIVER }),
              Animated.timing(rippleScale, { toValue: 1.6, duration: 280, useNativeDriver: NATIVE_DRIVER }),
            ]),
            Animated.timing(rippleOpacity, { toValue: 0, duration: 160, useNativeDriver: NATIVE_DRIVER }),
          ]),
        ]).start(() => resolve());
      });

    const run = async () => {
      while (!cancelled) {
        setPhase('input');
        fade.setValue(1);
        sendScale.setValue(1);
        await wait(900);
        if (cancelled) break;
        await tapSend();
        if (cancelled) break;
        await crossfadeTo('loading');
        if (cancelled) break;
        await wait(1300);
        if (cancelled) break;
        await crossfadeTo('result');
        if (cancelled) break;
        await wait(1800);
      }
    };
    run();

    return () => {
      cancelled = true;
      spinLoop.stop();
    };
  }, [fade, sendScale, rippleScale, rippleOpacity, spin]);

  const spinDeg = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    // minHeight pinned to the tallest phase (the result score card) so the
    // card frame doesn't visibly resize as the demo cycles through phases.
    <Animated.View style={{ opacity: fade, alignItems: 'center', justifyContent: 'center', minHeight: 132 }}>
      {phase === 'input' && (
        <View style={[styles.typedInputBox, styles.feedbackInputRow, { borderColor: theme.border, backgroundColor: theme.inputBackground }]}>
          <Text style={{ color: theme.inputText, fontSize: 16, lineHeight: 20, fontFamily: Fonts.bodyRegular }}>{TYPED_SENTENCE}</Text>
          <View style={styles.sendIconStage}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.sendRipple,
                { borderColor: theme.accent, opacity: rippleOpacity, transform: [{ scale: rippleScale }] },
              ]}
            />
            <Animated.View style={{ transform: [{ scale: sendScale }] }}>
              <AIShimmerIcon size={18} inactiveColor={theme.iconInactive} />
            </Animated.View>
          </View>
        </View>
      )}
      {phase === 'loading' && (
        <View style={{ alignItems: 'center' }}>
          <Animated.View style={{ transform: [{ rotate: spinDeg }] }}>
            <Icon name="sparkles-outline" size={28} color={theme.iconInactive} />
          </Animated.View>
          <Text style={{ color: theme.iconInactive, fontSize: 13, marginTop: 10, fontFamily: Fonts.bodyRegular }}>{t('aiLoadingMsg1')}</Text>
        </View>
      )}
      {phase === 'result' && (
        <View style={[styles.scoreCard, { backgroundColor: RESULT_SCORE_COLOR + '20', borderColor: RESULT_SCORE_COLOR }]}>
          <View style={styles.scoreTopRow}>
            <Text style={[styles.scoreText, { color: RESULT_SCORE_COLOR }]}>
              5<Text style={styles.scoreMax}>/5</Text>
            </Text>
            <Text style={[styles.scoreLabel, { color: theme.text }]}>Tubli! 🎉</Text>
          </View>
          <View style={styles.scorePills}>
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={[styles.scorePill, { backgroundColor: RESULT_SCORE_COLOR }]} />
            ))}
          </View>
        </View>
      )}
    </Animated.View>
  );
};

// Mirrors DiceRollDemo's "tap → result appears" gesture: tap the
// browser's install/share icon, and the app's own home-screen icon fades
// in below it, as the payoff.
const AddToHomeScreenDemo = ({ theme }: { theme: ReturnType<typeof useTheme>['theme'] }) => {
  const [rippleScale] = useState(() => new Animated.Value(0.6));
  const [rippleOpacity] = useState(() => new Animated.Value(0));
  const [iconOpacity] = useState(() => new Animated.Value(0));
  const [iconTranslate] = useState(() => new Animated.Value(8));

  useEffect(() => {
    let cancelled = false;

    const run = () => {
      rippleScale.setValue(0.6);
      rippleOpacity.setValue(0);
      iconOpacity.setValue(0);
      iconTranslate.setValue(8);

      Animated.sequence([
        Animated.delay(500),
        Animated.sequence([
          Animated.parallel([
            Animated.timing(rippleOpacity, { toValue: 1, duration: 120, useNativeDriver: NATIVE_DRIVER }),
            Animated.timing(rippleScale, { toValue: 1.5, duration: 420, useNativeDriver: NATIVE_DRIVER }),
          ]),
          Animated.timing(rippleOpacity, { toValue: 0, duration: 200, useNativeDriver: NATIVE_DRIVER }),
        ]),
        Animated.parallel([
          Animated.timing(iconOpacity, { toValue: 1, duration: 300, useNativeDriver: NATIVE_DRIVER }),
          Animated.timing(iconTranslate, { toValue: 0, duration: 300, useNativeDriver: NATIVE_DRIVER }),
        ]),
        Animated.delay(1500),
        Animated.timing(iconOpacity, { toValue: 0, duration: 250, useNativeDriver: NATIVE_DRIVER }),
      ]).start(({ finished }) => {
        if (finished && !cancelled) run();
      });
    };

    run();
    return () => { cancelled = true; };
  }, [rippleScale, rippleOpacity, iconOpacity, iconTranslate]);

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={styles.installIconStage}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.installRipple,
            { borderColor: theme.text, opacity: rippleOpacity, transform: [{ scale: rippleScale }] },
          ]}
        />
        <Icon name={INSTALL_ICON[INSTALL_BUCKET]} size={30} color={theme.text} />
      </View>
      <Animated.View style={{ marginTop: 14, alignItems: 'center', opacity: iconOpacity, transform: [{ translateY: iconTranslate }] }}>
        <View style={[styles.homeScreenIcon, { backgroundColor: theme.cardBackground }]}>
          <Image
            source={require('@/assets/images/dice-static-small.png')}
            style={styles.homeScreenIconImage}
            resizeMode="contain"
            fadeDuration={0}
          />
        </View>
        <Text style={{ marginTop: 6, fontSize: 11, color: theme.iconInactive, fontFamily: Fonts.bodyMedium }}>EestiRoll</Text>
      </Animated.View>
    </View>
  );
};

const StepVisual = ({ step, theme }: { step: number; theme: ReturnType<typeof useTheme>['theme'] }) => {
  if (step === 0) {
    return <DiceRollDemo rippleColor={theme.text} />;
  }

  if (step === 1) {
    return <WriteSentenceDemo theme={theme} />;
  }

  if (step === 2) {
    return <FeedbackDemo theme={theme} />;
  }

  return <AddToHomeScreenDemo theme={theme} />;
};

export function HowItWorksModal({ visible, onDismiss }: HowItWorksModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslations();
  const [step, setStep] = useState(0);
  // Expo Go runs fully fullscreen; a mobile browser tab (address bar, bottom
  // toolbar) eats real vertical space from the same device — this modal has
  // no scroll (it's a tap-to-advance Stories layout), so on a short viewport
  // the fixed paddings below need to shrink or the footer overlaps the text.
  const { height: windowHeight } = useWindowDimensions();
  const compact = windowHeight < 720;

  // Reset on open, not on close — resetting at close time flashed step 1's
  // content for a moment while the modal was still fading out.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (visible) setStep(0);
  }, [visible]);

  const close = () => {
    onDismiss();
  };

  const advance = () => {
    if (step >= STEPS.length - 1) {
      close();
      return;
    }
    setStep((s) => s + 1);
  };

  const back = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  const current = STEPS[step];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <View style={[styles.storyColumn, compact && styles.storyColumnCompact]}>
          <View style={styles.progressRow}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.progressTrack, { backgroundColor: theme.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: theme.accent, width: i <= step ? '100%' : '0%' },
                  ]}
                />
              </View>
            ))}
          </View>

          <Pressable style={[styles.closeButton, compact && styles.closeButtonCompact]} onPress={close} hitSlop={12}>
            <Icon name="close" size={22} color={theme.text} />
          </Pressable>

          <View style={[styles.body, compact && styles.bodyCompact]}>
            {/* Always rendered (just hidden past step 0) so it reserves the
                same fixed height on every step — otherwise "Step N:" would
                sit at a different height depending on whether this block
                was present, since the whole column used to be centered as
                one unit. */}
            <View style={[styles.introTitleWrap, compact && styles.introTitleWrapCompact]} pointerEvents="none">
              <Text style={[styles.introTitleLine1, { color: theme.text, opacity: step === 0 ? 1 : 0 }]}>{t('howItWorksIntroTitleLine1')}</Text>
              <Text style={[styles.introTitleLine2, { color: theme.text, opacity: step === 0 ? 1 : 0 }]}>{t('howItWorksIntroTitleLine2')}</Text>
              <View style={[styles.introDivider, compact && styles.introDividerCompact, { backgroundColor: theme.accent, opacity: step === 0 ? 0.6 : 0 }]} />
            </View>
            <Text style={[styles.stepLabel, compact && styles.stepLabelCompact, { color: theme.text }]}>
              <Text style={styles.stepLabelPrefix}>
                {current.bonus ? t('howItWorksBonusLabel') : `${t('howItWorksStepLabel')} ${step + 1}:`}
              </Text>
              <Text style={styles.stepLabelTitle}> {t(current.titleKey)}</Text>
            </Text>
            <View style={[styles.visualWrap, compact && styles.visualWrapCompact, { backgroundColor: theme.cardBackground + 'B3' }]}>
              <StepVisual step={step} theme={theme} />
            </View>
            <Text style={[styles.subtitle, compact && styles.subtitleCompact, { color: theme.iconInactive }]}>{t(current.bodyKey)}</Text>
            {current.hintKey && (
              <View style={[styles.hintRow, compact && styles.hintRowCompact]}>
                {/* Icon nested inline inside the Text (not a separate row below)
                    so "...in ⚙ Configuration" wraps and reads as one flowing
                    sentence instead of stranding the icon+label on its own line. */}
                <Text style={[styles.hint, { color: theme.iconInactive }]}>
                  {t(current.hintKey)}
                  {current.hintIcon && current.hintLabelKey && (
                    <>
                      {' '}
                      <Icon name={current.hintIcon} size={13} color={theme.iconInactive} />
                      {' '}
                      {t(current.hintLabelKey)}
                    </>
                  )}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.tapZones}>
            <Pressable style={styles.tapZoneLeft} onPress={back} />
            <Pressable style={styles.tapZoneRight} onPress={advance} />
          </View>

          <View style={[styles.footer, compact && styles.footerCompact]}>
            <Pressable onPress={close}>
              <Text style={[styles.skipText, { color: theme.iconInactive }]}>{t('howItWorksSkip')}</Text>
            </Pressable>
            <Pressable style={[styles.nextButton, { backgroundColor: theme.accent }]} onPress={advance}>
              <Text style={styles.nextButtonText}>
                {step >= STEPS.length - 1 ? t('howItWorksGotIt') : t('howItWorksNext')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
  },
  // Keeps the tutorial at the same phone-shaped proportions as the rest of
  // the app on wide screens (matches index.tsx's contentWrapper) instead of
  // stretching full-bleed across a desktop browser window.
  storyColumn: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  // Applied on short viewports (a mobile browser tab, where the address bar
  // and toolbar eat real height Expo Go doesn't have to give up) so the
  // footer never overlaps the text below — see the *Compact siblings below.
  storyColumnCompact: {
    paddingTop: 36,
    paddingBottom: 20,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 56,
    right: 20,
    padding: 8,
    zIndex: 2,
  },
  // top:56 is measured from storyColumn's own edge, independent of its
  // paddingTop — so it has to shrink in step with storyColumnCompact's
  // paddingTop or it drifts away from the progress bar it sits next to.
  closeButtonCompact: {
    top: 32,
  },
  // Top-anchored (not centered) so "Step N:" lands at the same height on
  // every step regardless of how much content sits above/below it — a
  // centered block shifts position whenever that content's total height
  // differs (e.g. the intro title, or a step's hint being present or not).
  body: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 78,
  },
  bodyCompact: {
    paddingTop: 40,
  },
  // A single shared frame around each step's whole mock-up (dice+words,
  // words+input, feedback) — reuses the app's established "example card"
  // look (see index.tsx's builderExampleCard) instead of inventing a new one,
  // kept subtle so it doesn't compete with the real UI pieces mocked inside
  // it (like Step 3's actual score card).
  visualWrap: {
    width: '100%',
    marginBottom: 10,
    // Pinned to the tallest step's natural height (Step 1's dice+chips) so
    // all 3 steps' frames match; justifyContent centers each step's shorter
    // content inside the shared height instead of leaving it top-heavy.
    minHeight: 185,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    // Soft/diffused edge instead of a hard-edged card — a faint blurred glow
    // rather than a crisp rectangle, so it frames the mock-up without
    // competing with it. (A linear-gradient edge fade was tried here too,
    // but with how different the light-theme background and card colors
    // are, it read as a visible gray ring rather than a blend — reverted.)
    boxShadow: '0px 0px 32px 6px rgba(0, 0, 0, 0.06)',
  },
  // minHeight only trims the box's own padding — the dice/chip/input mock-ups
  // inside aren't shrunk, so this never clips them, it just removes the
  // extra breathing room around content that's already there.
  visualWrapCompact: {
    minHeight: 150,
    paddingVertical: 12,
  },
  diceStage: {
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 2,
  },
  diceImage: {
    width: 54,
    height: 54,
  },
  installIconStage: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  installRipple: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
  },
  // A little iOS/Android-style rounded-square app icon, so the payoff of
  // this step is recognizably "the dice icon, now on your home screen".
  homeScreenIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)',
  },
  homeScreenIconImage: {
    width: 26,
    height: 26,
  },
  wordsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  miniChip: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  miniChipText: {
    fontSize: 14,
    color: '#0A0A0A',
    fontFamily: Fonts.bodyBold,
  },
  typedInputBox: {
    marginTop: 16,
    minWidth: 220,
    // Without this, the box is only as tall as its text — and an empty
    // string collapses to ~0 height, so the box visibly shrinks for the
    // instant between typing cycles when `displayed` resets to ''.
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  feedbackInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  sendIconStage: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendRipple: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
  },
  // Copied from the real result card (app/(tabs)/index.tsx's styles.scoreCard
  // and friends) so the tutorial shows the actual UI, not a stand-in.
  scoreCard: {
    borderWidth: 2,
    borderRadius: 14,
    padding: 14,
    minWidth: 220,
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
  introTitleWrap: {
    alignItems: 'center',
    marginBottom: 18,
  },
  introTitleWrapCompact: {
    marginBottom: 10,
  },
  introTitleLine1: {
    fontSize: 28,
    textAlign: 'center',
    fontFamily: Fonts.heading,
  },
  introDivider: {
    width: 36,
    height: 2,
    borderRadius: 1,
    marginVertical: 12,
    opacity: 0.6,
  },
  introDividerCompact: {
    marginVertical: 8,
  },
  introTitleLine2: {
    fontSize: 22,
    textAlign: 'center',
    opacity: 0.85,
    fontFamily: Fonts.bodyBold,
    marginTop: -6,
  },
  stepLabel: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 18,
  },
  stepLabelCompact: {
    marginBottom: 10,
  },
  stepLabelPrefix: {
    fontFamily: Fonts.heading,
  },
  stepLabelTitle: {
    fontFamily: Fonts.bodyBold,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 320,
    marginTop: 8,
    fontFamily: Fonts.bodyRegular,
  },
  subtitleCompact: {
    marginTop: 6,
  },
  hintRow: {
    alignItems: 'center',
    marginTop: 10,
  },
  hintRowCompact: {
    marginTop: 6,
  },
  hint: {
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 300,
    opacity: 0.8,
    fontFamily: Fonts.bodyRegular,
  },
  hintTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  tapZones: {
    position: 'absolute',
    top: 90,
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  tapZoneLeft: {
    flex: 35,
  },
  tapZoneRight: {
    flex: 65,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  footerCompact: {
    marginTop: 6,
  },
  skipText: {
    fontSize: 16,
    fontFamily: Fonts.bodyRegular,
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: Fonts.bodyBold,
  },
});
