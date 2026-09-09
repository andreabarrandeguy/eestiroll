import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from '@/hooks/useTranslations';
import { EVENTS, track } from '@/services/analytics';
import { useRouter } from 'expo-router';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface SignInPromptModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSignIn: () => void;
}

export function SignInPromptModal({ visible, onDismiss, onSignIn }: SignInPromptModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslations();
  const router = useRouter();

  const handleDismiss = () => {
    track(EVENTS.SIGN_IN_PROMPT_DISMISSED);
    onDismiss();
  };

  const handleSignIn = () => {
    onSignIn();
    router.push('/account');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleDismiss}>
      <Pressable style={styles.backdrop} onPress={handleDismiss}>
        <Pressable style={[styles.container, { backgroundColor: theme.background, borderColor: theme.text }]} onPress={(e) => e.stopPropagation()}>
          <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
            <Text style={[styles.closeText, { color: theme.text }]}>✕</Text>
          </TouchableOpacity>

          <Text style={[styles.title, { color: theme.text }]}>{t('signInPromptTitle')}</Text>
          <Text style={[styles.subtitle, { color: theme.text }]}>{t('signInPromptBody')}</Text>

          <TouchableOpacity style={[styles.button, { backgroundColor: theme.blue }]} onPress={handleSignIn}>
            <Text style={styles.buttonText}>{t('continueWithEmail')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.notNowButton} onPress={handleDismiss}>
            <Text style={[styles.notNowText, { color: theme.iconInactive }]}>{t('notNow')}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 1,
  },
  closeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#F2F2F2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notNowButton: {
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 4,
  },
  notNowText: {
    fontSize: 14,
  },
});
