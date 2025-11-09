import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface WordCardProps {
  word: string;
  category: string;
  color: string;
  refreshKey: number;
}

export const WordCard = React.memo(({ word, category, color, refreshKey }: WordCardProps) => {
  const translateY = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

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

  return (
    <Animated.View 
      style={[
        styles.card, 
        { 
          backgroundColor: color,
          transform: [{ translateY }],
          opacity
        }
      ]}
    >
      <Text style={styles.categoryText}>{category}</Text>
      <Text style={styles.cardText}>{word}</Text>
    </Animated.View>
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
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});