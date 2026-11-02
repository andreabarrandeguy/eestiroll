import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useKeyboardOffset } from '@/hooks/useKeyboardOffset';
import { EVENTS, track } from '@/services/analytics';
import { submitFeedback } from '@/services/feedback';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

interface TeacherAccessModalProps {
  visible: boolean;
  onDismiss: () => void;
}

// A form, not a mailto. Handing someone a half-written email is a dead end on
// a phone, and it leaves them to compose the message — the part they are least
// sure about. These five fields are everything needed to raise the daily limit
// for a school and write back.
//
// English only, like the page it opens from. Impersonal throughout, like the
// rest of the product copy: the first person belongs to the About bio, not to
// a form, and a form cannot promise what a person has to decide by hand.
export function TeacherAccessModal({ visible, onDismiss }: TeacherAccessModalProps) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const keyboardOffset = useKeyboardOffset();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('');
  const [group, setGroup] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Enough to catch a mistyped address, not enough to reject a valid oddity.
  const canSubmit = name.trim().length > 0 && /.+@.+\..+/.test(email.trim());

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setStatus('loading');

    const message = `Teacher access request

Name: ${name.trim()}
Email: ${email.trim()}
Where they teach: ${school.trim() || '(not given)'}
Group and timing: ${group.trim() || '(not given)'}

${notes.trim() || '(no extra notes)'}`;

    try {
      await submitFeedback({ message, source: 'teacher_access', language });
      track(EVENTS.TEACHERS_ACCESS_SUBMITTED);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setSchool('');
    setGroup('');
    setNotes('');
    setStatus('idle');
    onDismiss();
  };

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
    extra?: { multiline?: boolean; isEmail?: boolean },
  ) => (
    <>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          extra?.multiline && styles.inputMultiline,
          { color: theme.text, borderColor: theme.border },
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.iconInactive}
        value={value}
        onChangeText={onChange}
        editable={status !== 'loading'}
        autoCapitalize={extra?.isEmail ? 'none' : 'sentences'}
        keyboardType={extra?.isEmail ? 'email-address' : 'default'}
        multiline={extra?.multiline}
      />
    </>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable
        style={[
          styles.backdrop,
          keyboardOffset > 0
            ? { justifyContent: 'flex-end', paddingBottom: keyboardOffset + 16 }
            : { justifyContent: 'center' },
        ]}
        onPress={handleClose}
      >
        <Pressable
          style={[styles.container, { backgroundColor: theme.background, borderColor: theme.text }]}
          onPress={(e) => e.stopPropagation()}
        >
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={[styles.closeText, { color: theme.text }]}>✕</Text>
          </TouchableOpacity>

          {status === 'success' ? (
            <>
              {/* Promises a reply and nothing else: whether the limit can
                  actually be raised for a given group is decided by hand, and
                  this screen is in no position to commit to it. */}
              <Text style={[styles.title, { color: theme.text }]}>Thanks — request sent</Text>
              <Text style={[styles.subtitle, { color: theme.text }]}>
                You will be receiving updates via email soon.
              </Text>
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleClose}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </>
          ) : (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.title, { color: theme.text }]}>Teacher access</Text>
              <Text style={[styles.subtitle, { color: theme.text }]}>
                A few details about your group, so the daily feedback limit can be raised
                for it and the exercise does not stop halfway through a lesson.
              </Text>

              {field('Your name', name, setName, 'Mari Tamm')}
              {field('Email', email, setEmail, 'mari@school.ee', { isEmail: true })}
              {field('Where you teach', school, setSchool, 'School, language centre, private lessons…')}
              {field('Group and timing', group, setGroup, 'About 20 learners, A2, starting in March')}
              {field('Anything else', notes, setNotes, 'Optional', { multiline: true })}

              {status === 'error' ? (
                <Text style={styles.errorText}>Something went wrong. Please try again.</Text>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: theme.accent },
                  (status === 'loading' || !canSubmit) && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={status === 'loading' || !canSubmit}
              >
                {status === 'loading' ? (
                  <ActivityIndicator color="#F2F2F2" />
                ) : (
                  <Text style={styles.buttonText}>Send request</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
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
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: 4,
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 14,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
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
