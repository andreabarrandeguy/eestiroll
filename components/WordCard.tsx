import { WordModal } from '@/components/WordModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchContent } from '@/services/api';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

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

// Cache global de traducciones
let cachedTranslations: Record<string, any[]> = {};

// Función para cargar traducciones desde la API
export async function loadTranslations() {
  try {
    const content = await fetchContent();
    cachedTranslations = content.data.words;
  } catch (error) {
    console.error('Error loading translations from API');
    // Fallback a wordData.ts
    const { allWords } = require('@/utils/wordData');
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
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
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
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
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
          <Text style={[
            styles.cardText,
            compact && styles.cardTextCompact
          ]}>
            {word}
          </Text>
        </Animated.View>
      </Pressable>

      <WordModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        estonianWord={word}
        translation={getTranslation()}
        category={displayText}
        cardColor={color}
      />
    </>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: 10,
    marginBottom: 5,
    borderRadius: 12
  },
  categoryText: {
    fontSize: 12,
    marginBottom: 2,
    textAlign: 'center'
  },
  categoryTextCompact: {
    fontSize: 10,
    marginBottom: 1,
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  cardTextCompact: {
    fontSize: 16,
  }
});