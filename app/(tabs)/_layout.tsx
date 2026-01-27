import { Icon } from '@/components/Icon';
import { useRandom } from '@/contexts/RandomContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BlurView } from 'expo-blur';
import { Tabs, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Animated, Image, Platform, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function TabLayout() {
  const router = useRouter();
  const { triggerRandom } = useRandom();
  const { theme, isDark } = useTheme();
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const handleDicePress = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    router.push('/(tabs)');
    triggerRandom();
  };

  const DiceImage = () => (
    <Animated.View 
      style={{
        transform: [{ 
          rotate: shakeAnim.interpolate({
            inputRange: [-10, 10],
            outputRange: ['-10deg', '10deg']
          })
        }]
      }}
    >
      <Image 
        source={require('@/assets/images/dice-static.png')}
        style={styles.diceImage}
        resizeMode="contain"
      />
    </Animated.View>
  );

  const TabIcon = ({ name, focused }: { name: 'settings-outline' | 'time-outline'; focused: boolean }) => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.webIconContainer}>
          <Icon 
            name={name}
            size={32}
            color={focused ? theme.yellow : theme.text}
          />
        </View>
      );
    }
    
    return (
      <BlurView
        intensity={60}
        tint={isDark ? 'dark' : 'light'}
        style={styles.blurContainer}
      >
        <View style={styles.iconContainer}>
          <Icon 
            name={name}
            size={40}
            color={focused ? theme.yellow : theme.text}
          />
        </View>
      </BlurView>
    );
  };

  return (
    <Tabs
      sceneContainerStyle={{ backgroundColor: theme.background }}
      screenOptions={{
        tabBarActiveTintColor: theme.yellow,
        tabBarInactiveTintColor: theme.text,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          paddingBottom: 90,
          elevation: 0,
          shadowOpacity: 0,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 0,
          ...(Platform.OS === 'web' && {
            maxWidth: 500,
            width: '100%',
            alignSelf: 'center',
            left: 0,
            right: 0,
            marginHorizontal: 'auto',
          }),
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
          tabBarIcon: ({ focused }) => <TabIcon name="settings-outline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={
          Platform.OS === 'web'
            ? {
                title: '',
                tabBarButton: () => (
                  <View style={styles.diceWrapperWeb}>
                    <TouchableOpacity 
                      onPress={handleDicePress}
                      activeOpacity={0.7}
                      style={styles.diceButtonWeb}
                    >
                      <DiceImage />
                    </TouchableOpacity>
                  </View>
                ),
              }
            : {
                title: '',
                tabBarIcon: () => (
                  <View style={styles.diceButtonMobile}>
                    <DiceImage />
                  </View>
                ),
                tabBarButton: (props) => (
                  <Pressable {...props} onPress={handleDicePress} />
                ),
              }
        }
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => <TabIcon name="time-outline" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    width: 39,
    height: 39,
    borderRadius: 30,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diceWrapperWeb: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diceButtonWeb: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  diceButtonMobile: {
    width: 80,
    height: 80,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  diceImage: {
    width: 100, 
    height: 100,
  },
});