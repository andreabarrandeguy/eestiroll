import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ScreenContainerProps {
  title?: string;
  children: ReactNode;
  showBackButton?: boolean;
  scrollable?: boolean;
}

export function ScreenContainer({ 
  title, 
  children, 
  showBackButton = false,
  scrollable = true 
}: ScreenContainerProps) {
  const router = useRouter();
  const { theme } = useTheme();

  const content = (
    <View style={styles.content}>
      {title && (
        <View style={styles.headerContainer}>
          {showBackButton && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
          )}
          <Text style={[
            styles.title,
            { color: theme.text },
            showBackButton && styles.titleWithBack
          ]}>
            {title}
          </Text>
          {showBackButton && <View style={styles.headerSpacer} />}
        </View>
      )}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {scrollable ? (
        <ScrollView style={styles.scrollView}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  backButton: {
    padding: 5,
    width: 40
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    flex: 1
  },
  titleWithBack: {
    // When back button exists, title is already centered by flex layout
  },
  headerSpacer: {
    width: 40
  }
});