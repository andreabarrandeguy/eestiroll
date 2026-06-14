import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from '@/hooks/useTranslations';
import { EVENTS, track } from '@/services/analytics';
import { AlreadySubscribedError, subscribeEmail } from '@/services/subscribers';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

interface SubscribeModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubscribed: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SubscribeModal({ visible, onDismiss, onSubscribed }: SubscribeModalProps) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { t } = useTranslations();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (!EMAIL_REGEX.test(email.trim())) {
      setErrorMsg('Please enter a valid email');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      await subscribeEmail({ email, source: 'modal', language });
      track(EVENTS.SUBSCRIBED, { source: 'modal' });
      setStatus('success');
      onSubscribed();
    } catch (e) {
      if (e instanceof AlreadySubscribedError) {
        // Treat as success — don't make the user feel bad about it
        setStatus('success');
        onSubscribed();
        return;
      }
      setErrorMsg('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  const handleClose = () => {
    if (status !== 'success') {
      track(EVENTS.SUBSCRIBE_DISMISSED, { source: 'modal' });
    }
    setEmail('');
    setStatus('idle');
    setErrorMsg('');
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={[styles.container, { backgroundColor: theme.background, borderColor: theme.text }]} onPress={(e) => e.stopPropagation()}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={[styles.closeText, { color: theme.text }]}>✕</Text>
          </TouchableOpacity>

          {status === 'success' ? (
            <>
              <Text style={[styles.title, { color: theme.text }]}>{t('thanks')}! 🎉</Text>
              <Text style={[styles.subtitle, { color: theme.text }]}>{t('weWillEmailYou')}</Text>
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.yellow }]} onPress={handleClose}>
                <Text style={styles.buttonText}>{t('close')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: theme.text }]}>{t('suscribeToList')}</Text>
              <Text style={[styles.subtitle, { color: theme.text }]}>{t('suscribeInfo')}</Text>

              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.text }]}
                placeholder="your@email.com"
                placeholderTextColor={theme.text + '80'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={status !== 'loading'}
              />

              {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.blue }, status === 'loading' && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <ActivityIndicator color="#0A0A0A" />
                ) : (
                  <Text style={styles.buttonText}>{t('notifyMe')}</Text>
                )}
              </TouchableOpacity>
            </>
          )}
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
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  errorText: {
    color: '#E95A35',
    fontSize: 14,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#F2F2F2',
    fontSize: 16,
    fontWeight: 'bold',
  },
});