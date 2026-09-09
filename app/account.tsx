import { Icon } from '@/components/Icon';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Theme } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from '@/hooks/useTranslations';
import { EVENTS, track } from '@/services/analytics';
import { InvalidCodeError, OtpRateLimitError } from '@/services/auth';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN_SECONDS = 30;

type Step = 'email' | 'code';

function Field({ label, theme, children }: { label: string; theme: Theme; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.iconInactive }]}>{label}</Text>
      {children}
    </View>
  );
}

export default function AccountScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useTranslations();
  const { status, email: sessionEmail, sendOtp, verifyOtp, signOut, deleteAccount } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const interval = setInterval(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [resendSeconds]);

  const handleSendCode = async () => {
    if (!EMAIL_REGEX.test(email.trim())) {
      setError(t('invalidEmail'));
      return;
    }

    setError('');
    setLoading(true);
    track(EVENTS.SIGN_IN_STARTED);

    try {
      await sendOtp(email);
      setStep('code');
      setResendSeconds(RESEND_COOLDOWN_SECONDS);
    } catch (e) {
      setError(e instanceof OtpRateLimitError ? t('tooManyRequests') : t('somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.trim().length !== 6) {
      setError(t('invalidCode'));
      return;
    }

    setError('');
    setLoading(true);

    try {
      await verifyOtp(email, code);
      track(EVENTS.SIGN_IN_COMPLETED);
      setCode('');
    } catch (e) {
      setError(e instanceof InvalidCodeError ? t('invalidCode') : t('somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setStep('email');
    setCode('');
    setError('');
  };

  const handleSignOut = async () => {
    await signOut();
    track(EVENTS.SIGN_OUT);
    setStep('email');
    setEmail('');
  };

  const performDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      track(EVENTS.ACCOUNT_DELETED);
      router.back();
    } catch {
      setError(t('somethingWentWrong'));
      setDeleting(false);
    }
  };

  const handleDeleteAccount = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(t('deleteAccountWarning'))) performDelete();
    } else {
      Alert.alert(t('deleteAccount'), t('deleteAccountWarning'), [
        { text: t('cancel'), style: 'cancel' },
        { text: t('deleteAccountConfirm'), style: 'destructive', onPress: performDelete },
      ]);
    }
  };

  const renderSignedIn = () => (
    <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
      <Icon name="person-circle-outline" size={48} color={theme.blue} />
      <Text style={[styles.signedInLabel, { color: theme.iconInactive }]}>{t('signedInAs')}</Text>
      <Text style={[styles.signedInEmail, { color: theme.text }]}>{sessionEmail}</Text>
      <View style={[styles.benefitPill, { backgroundColor: theme.blue + '20' }]}>
        <Icon name="checkmark-circle" size={16} color={theme.blue} />
        <Text style={[styles.benefitText, { color: theme.blue }]}>{t('signInBenefit')}</Text>
      </View>

      <TouchableOpacity style={[styles.secondaryButton, { borderColor: theme.border }]} onPress={handleSignOut}>
        <Text style={[styles.secondaryButtonText, { color: theme.text }]}>{t('signOut')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount} disabled={deleting}>
        {deleting ? (
          <ActivityIndicator color="#E95A35" />
        ) : (
          <Text style={styles.deleteButtonText}>{t('deleteAccount')}</Text>
        )}
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  const renderEmailStep = () => (
    <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
      <Text style={[styles.title, { color: theme.text }]}>{t('continueWithEmail')}</Text>
      <Text style={[styles.subtitle, { color: theme.iconInactive }]}>{t('signInBenefit')}</Text>

      <Field label={t('emailLabel')} theme={theme}>
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          placeholder={t('emailPlaceholder')}
          placeholderTextColor={theme.iconInactive}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          editable={!loading}
        />
      </Field>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: theme.blue }, loading && styles.disabled]}
        onPress={handleSendCode}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#F2F2F2" /> : <Text style={styles.primaryButtonText}>{t('sendCode')}</Text>}
      </TouchableOpacity>
    </View>
  );

  const renderCodeStep = () => (
    <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
      <Text style={[styles.title, { color: theme.text }]}>{t('enterCode')}</Text>
      <Text style={[styles.subtitle, { color: theme.iconInactive }]}>
        {t('codeSentTo').replace('{email}', email.trim())}
      </Text>

      <TextInput
        style={[styles.input, styles.codeInput, { color: theme.text, borderColor: theme.border }]}
        placeholder={t('codePlaceholder')}
        placeholderTextColor={theme.iconInactive}
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={6}
        editable={!loading}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: theme.blue }, loading && styles.disabled]}
        onPress={handleVerifyCode}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#F2F2F2" /> : <Text style={styles.primaryButtonText}>{t('verifyCode')}</Text>}
      </TouchableOpacity>

      <View style={styles.codeFooter}>
        <TouchableOpacity onPress={handleChangeEmail} disabled={loading}>
          <Text style={[styles.linkText, { color: theme.iconInactive }]}>{t('changeEmail')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSendCode} disabled={loading || resendSeconds > 0}>
          <Text style={[styles.linkText, { color: resendSeconds > 0 ? theme.iconInactive : theme.blue }]}>
            {resendSeconds > 0 ? t('resendIn').replace('{seconds}', String(resendSeconds)) : t('resendCode')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenContainer title={t('account')} showBackButton>
        {status === 'authenticated'
          ? renderSignedIn()
          : step === 'email'
            ? renderEmailStep()
            : renderCodeStep()}
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  field: {
    width: '100%',
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: '100%',
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
    marginBottom: 16,
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: '#F2F2F2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.6,
  },
  errorText: {
    color: '#E95A35',
    fontSize: 14,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  codeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  linkText: {
    fontSize: 14,
  },
  signedInLabel: {
    fontSize: 13,
    marginTop: 12,
  },
  signedInEmail: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  benefitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginBottom: 24,
  },
  benefitText: {
    fontSize: 13,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  deleteButton: {
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  deleteButtonText: {
    color: '#E95A35',
    fontSize: 14,
    fontWeight: '600',
  },
});
