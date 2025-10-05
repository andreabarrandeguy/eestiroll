import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

export function WordCard({ word, category, color, refreshKey }) {
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
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginBottom: 10,
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