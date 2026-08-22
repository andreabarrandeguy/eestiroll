import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from '@/hooks/useTranslations';
import { EVENTS, track } from '@/services/analytics';
import { FeedbackSource, submitFeedback } from '@/services/feedback';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

interface FeedbackModalProps {
  visible: boolean;
  onDismiss: () => void;
  source: FeedbackSource;
  word?: string;
  category?: string;
}

export function FeedbackModal({ visible, onDismiss, source, word, category }: FeedbackModalProps) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { t } = useTranslations();

  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setStatus('loading');

    try {
      await submitFeedback({ message, source, word, category, language });
      track(EVENTS.FEEDBACK_SUBMITTED, { source });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const handleClose = () => {
    setMessage('');
    setStatus('idle');
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
              <Text style={[styles.title, { color: theme.text }]}>{t('feedbackThanks')}</Text>
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.yellow }]} onPress={handleClose}>
                <Text style={styles.buttonText}>{t('close')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: theme.text }]}>{t('feedbackTitle')}</Text>
              <Text style={[styles.subtitle, { color: theme.text }]}>{t('feedbackInfo')}</Text>

              {word ? (
                <Text style={[styles.context, { color: theme.iconInactive, borderColor: theme.border }]}>
                  {t('reportingOn')} “{word}”
                </Text>
              ) : null}

              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.text }]}
                placeholder={t('feedbackPlaceholder')}
                placeholderTextColor={theme.text + '80'}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                editable={status !== 'loading'}
              />

              {status === 'error' ? (
                <Text style={styles.errorText}>Something went wrong. Please try again.</Text>
              ) : null}

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.blue }, (status === 'loading' || !message.trim()) && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={status === 'loading' || !message.trim()}
              >
                {status === 'loading' ? (
                  <ActivityIndicator color="#0A0A0A" />
                ) : (
                  <Text style={styles.buttonText}>{t('send')}</Text>
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
    marginBottom: 16,
    lineHeight: 22,
  },
  context: {
    fontSize: 13,
    fontStyle: 'italic',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 90,
    textAlignVertical: 'top',
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
