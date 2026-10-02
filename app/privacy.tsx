import { ScreenContainer } from '@/components/ScreenContainer';
import { Theme } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Stack } from 'expo-router';
import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const LAST_UPDATED = 'October 2, 2026';
const CONTACT_EMAIL = 'andreabarrandeguy@gmail.com';

function Section({ title, theme, children }: { title: string; theme: Theme; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>{children}</Text>
    </View>
  );
}

export default function PrivacyScreen() {
  const { theme } = useTheme();
  const { t } = useTranslations();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenContainer title={t('privacyPolicy')} showBackButton>
        <Text style={[styles.updated, { color: theme.iconInactive }]}>Last updated: {LAST_UPDATED}</Text>

        <Section title="Overview" theme={theme}>
          EestiRoll (&quot;the app&quot;) is a small, independently-made app for practicing Estonian
          vocabulary. This page explains what information is collected, why, and how it can be
          controlled.
        </Section>

        <Section title="Information Collected" theme={theme}>
          {'• Account information: if you choose to sign in, your email address is used to send a one-time login code and identify your account. The app works fully without an account.\n\n'}
          {'• Practice content: the words and sentences you submit to get AI feedback are sent to the app’s server and, from there, to OpenAI to generate a correction. Feedback saved to your local history stays on your device.\n\n'}
          {'• Usage data: PostHog is used to understand how the app is used (e.g. which screens are opened, how often people practice) so it can be improved. This is tied to an anonymous device ID, not your name or email. Precise or IP-based location is not collected.\n\n'}
          {'• Newsletter: if you subscribe to updates, the email address you provide is stored for that purpose only.'}
        </Section>

        <Section title="How This Information Is Used" theme={theme}>
          To provide the core feature of the app (AI feedback on your sentences), to let you sign
          in and keep an account, to understand usage in order to fix bugs and improve the app,
          and to send updates if you asked to be notified. Your information is not sold, and it
          is not used for advertising.
        </Section>

        <Section title="Who This Is Shared With" theme={theme}>
          {'• OpenAI — processes the words/sentence you submit to generate feedback. It does not receive your email or identity.\n\n'}
          {'• Supabase — stores account and subscriber data securely.\n\n'}
          {'• Resend — sends the one-time login code and newsletter emails on our behalf.\n\n'}
          {'• PostHog — processes anonymous usage analytics.\n\n'}
          None of these services are permitted to use this data for their own purposes beyond providing the service to the app.
        </Section>

        <Section title="Data Retention" theme={theme}>
          Local history and preferences stay on your device until cleared or the app is
          uninstalled. Records used only to enforce the daily usage limit are automatically
          deleted after 7 days. Deleting your account (available in Settings → Account) removes
          your account and subscriber records immediately.
        </Section>

        <Section title="Your Rights" theme={theme}>
          Your account can be deleted at any time from Settings → Account inside the app. Any
          information held about you can also be accessed, corrected, or deleted by emailing the
          address below.
        </Section>

        <Section title="Children's Privacy" theme={theme}>
          EestiRoll is not directed at children under 13, and information is not knowingly
          collected from them.
        </Section>

        <Section title="Changes to This Policy" theme={theme}>
          If this policy changes in a meaningful way, the date at the top of this page will be
          updated.
        </Section>

        <Section title="Contact" theme={theme}>
          Questions about this policy or your data: {CONTACT_EMAIL}
        </Section>

        <View style={{ height: 20 }} />
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  updated: {
    fontSize: 13,
    marginBottom: 20,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 21,
  },
});
