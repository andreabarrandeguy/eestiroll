import { WordModal } from '@/components/WordModal';
import { Fonts } from '@/constants/Fonts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchContent } from '@/services/api';
import { allWords } from '@/utils/wordData';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

// The native animated module doesn't exist on web — requesting it there just
// prints a noisy fallback warning on every animation.
const NATIVE_DRIVER = Platform.OS !== 'web';

interface WordCardProps {
  word: string;
  category: string;
  color: string;
  refreshKey: number;
  uppercaseCategory?: boolean;
  compact?: boolean;
  onDoubleTap?: (word: string) => void;
  onLongPress?: () => void;
}

// Diagonal hatching on the empty cards. It is what keeps them reading as a
// drawing of a card rather than a card that failed to load — the trap a plain
// grey box falls into. React Native has no repeating gradient, but
// react-native-web passes backgroundImage straight through to CSS, so this is
// web-only and degrades to the plain bordered box everywhere else.
const STRIPES = Platform.OS === 'web'
  ? ({
      backgroundImage:
        'repeating-linear-gradient(135deg, rgba(128,128,128,0.16) 0 6px, transparent 6px 12px)',
    } as any)
  : undefined;

// How many characters fit across a card at full size, measured against the
// three-to-a-row layout. Kept a little under what actually fits, so a word
// right at the edge shrinks slightly rather than risking a clip.
const FITS_AT_FULL_SIZE = 11;
const MIN_WORD_FONT_SIZE = 11;

// `adjustsFontSizeToFit` is an iOS-only prop that react-native-web does not
// implement, so on the web a long word was simply cut off. The size is worked
// out instead from the longest run that cannot be broken: a space is a legal
// wrap point, so `mobiiltelefoni laadija` — the longest entry in the
// vocabulary at 22 characters — is sized by `mobiiltelefoni` and takes two
// lines, while a single long word like `videoprojektor` shrinks to fit one.
function fitWordFontSize(word: string, base: number) {
  const longestChunk = word
    .split(' ')
    .reduce((longest, part) => Math.max(longest, part.length), 0);

  if (longestChunk <= FITS_AT_FULL_SIZE) return base;
  return Math.max(MIN_WORD_FONT_SIZE, Math.round(base * (FITS_AT_FULL_SIZE / longestChunk)));
}

// Translations global cache
let cachedTranslations: Record<string, any[]> = {};

// Function to load translations from API
export async function loadTranslations() {
  try {
    const content = await fetchContent();
    cachedTranslations = content.data.words;
  } catch {
    console.error('Error loading translations from API');
    // Fallback to wordData.ts
    cachedTranslations = allWords;
  }
}

// Helper to get translation
export function getWordTranslation(word: string, category: string, language: string): string {
  const wordList = cachedTranslations[category] || [];
  const wordObj = wordList.find((w: any) => w.word === word);
  if (!wordObj) return word;
  return wordObj.translations?.[language] || word;
}

// Helper to get all translations
export function getAllWordTranslations(word: string, category: string): Record<string, string> {
  const wordList = cachedTranslations[category] || [];
  const wordObj = wordList.find((w: any) => w.word === word);
  if (!wordObj || !wordObj.translations) {
    return { en: word, es: word, ru: word };
  }
  return wordObj.translations;
}

export const WordCard = React.memo(({ 
  word, 
  category, 
  color, 
  refreshKey,
  uppercaseCategory = false,
  compact = false,
  onDoubleTap,
  onLongPress
}: WordCardProps) => {
  const { t } = useTranslations();
  const { language } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);
  const translateY = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const lastTap = useRef<number | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    translateY.setValue(-20);
    opacity.setValue(0);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: NATIVE_DRIVER,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: NATIVE_DRIVER,
      })
    ]).start();
  }, [refreshKey]);

  const categoryText = t(category as any);
  const displayText = uppercaseCategory ? categoryText.toUpperCase() : categoryText;

  const getTranslation = () => {
    const wordList = cachedTranslations[category] || [];
    const wordObj = wordList.find((w: any) => w.word === word);
    
    if (!wordObj) return word;
    
    return wordObj.translations?.[language] || word;
  };

  const getAllTranslations = () => {
    return getAllWordTranslations(word, category);
  };

  const handlePress = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (lastTap.current && (now - lastTap.current) < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (onDoubleTap) {
        onDoubleTap(word);
        // Visual feedback
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 100,
            useNativeDriver: NATIVE_DRIVER,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: NATIVE_DRIVER,
          })
        ]).start();
      }
      lastTap.current = null;
    } else {
      // Single tap - open modal
      lastTap.current = now;
      setTimeout(() => {
        if (lastTap.current === now) {
          setModalVisible(true);
          lastTap.current = null;
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  const handleLongPress = () => {
    if (onLongPress) {
      onLongPress();
    }
  };

  return (
    <>
      <Pressable 
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={500}
      >
        <Animated.View 
          style={[
            styles.card, 
            { 
              backgroundColor: color,
              transform: [
                { translateY },
                { scale: scaleAnim }
              ],
              opacity
            }
          ]}
        >
          <Text style={[
            styles.categoryText,
            compact && styles.categoryTextCompact
          ]}>
            {displayText}
          </Text>
          <Text 
            style={[
              styles.cardText,
              compact && styles.cardTextCompact,
              { fontSize: fitWordFontSize(word, compact ? 16 : 18) },
            ]}
            numberOfLines={2}
          >
            {word}
          </Text>
        </Animated.View>
      </Pressable>

      <WordModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        estonianWord={word}
        translation={getTranslation()}
        allTranslations={getAllTranslations()}
        currentLanguage={language}
        category={displayText}
        cardColor={color}
      />
    </>
  );
});

WordCard.displayName = 'WordCard';

// The empty slot shown on the home screen before the first roll. It is built
// from WordCard's own styles on purpose: eyeballing a height here is how the
// preview ends up a few pixels taller than the card that replaces it, which
// makes the words look like they shrank on arrival. Two invisible twins of the
// real card's lines set the height, the padding gives back the two pixels the
// border adds, and the "?" floats over the whole box — laid out in the flow it
// would sit under the category line rather than in the middle.
export const WordCardPlaceholder = ({
  borderColor,
  markColor,
}: {
  borderColor: string;
  markColor: string;
}) => (
  <Animated.View style={[styles.card, styles.placeholderCard, { borderColor }, STRIPES]}>
    <Text style={[styles.categoryText, styles.categoryTextCompact, { color: 'transparent' }]}>
      {' '}
    </Text>
    <Text style={[styles.cardText, styles.cardTextCompact, { color: 'transparent' }]}>{' '}</Text>
    <View style={styles.placeholderMark} pointerEvents="none">
      <Text style={[styles.cardText, styles.cardTextCompact, { color: markColor }]}>?</Text>
    </View>
  </Animated.View>
);

const styles = StyleSheet.create({
  card: {
    padding: 10,
    marginBottom: 5,
    borderRadius: 12
  },
  placeholderCard: {
    padding: 9,
    borderWidth: 1,
  },
  placeholderMark: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 12,
    marginBottom: 2,
    textAlign: 'center',
    fontFamily: Fonts.heading,
  },
  categoryTextCompact: {
    fontSize: 10,
    marginBottom: 1,
  },
  cardText: {
    fontSize: 18,
    textAlign: 'center',
    fontFamily: Fonts.bodyBold,
  },
  cardTextCompact: {
    fontSize: 16,
  }
});