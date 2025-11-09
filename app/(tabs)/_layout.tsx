import { useRandom } from '@/contexts/RandomContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, View } from 'react-native';

export default function TabLayout() {
  const router = useRouter();
  const { triggerRandom } = useRandom();
  const { theme } = useTheme();
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const handleDicePress = () => {
    // Shake animation sequence
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();

    router.push('/(tabs)');
    setTimeout(() => {
      triggerRandom();
    }, 100);
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.yellow,
        tabBarInactiveTintColor: theme.text,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.background,
          borderTopWidth: 0,
          paddingBottom: 90,
          elevation: 0,
          shadowOpacity: 0,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 0,
        },
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        headerShown: false,
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="config"
        options={{
          title: 'Config',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons 
                name="settings-outline" 
                size={40}
                color={focused ? theme.yellow : theme.text} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: () => (
            <Animated.View 
              style={[
                styles.diceButton,
                {
                  transform: [{ rotate: shakeAnim.interpolate({
                    inputRange: [-10, 10],
                    outputRange: ['-10deg', '10deg']
                  })}]
                }
              ]}
            >
              <Image 
                source={require('@/assets/images/dice.png')}
                style={styles.diceImage}
                resizeMode="contain"
              />
            </Animated.View>
          ),
          tabBarButton: (props) => (
            <Pressable
              {...props}
              onPress={handleDicePress}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons 
                name="time-outline" 
                size={40}
                color={focused ? theme.yellow : theme.text} 
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diceButton: {
    width: 80,
    height: 80,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  diceImage: {
    width: 80, 
    height: 80,
  },
});