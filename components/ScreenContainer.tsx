import { Icon } from '@/components/Icon';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
              <Icon name="arrow-back" size={24} color={theme.text} />
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
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.contentWrapper}>
          {scrollable ? (
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {content}
            </ScrollView>
          ) : (
            content
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  keyboardView: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
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