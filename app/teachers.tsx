import { FeedbackModal } from '@/components/FeedbackModal';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TeacherAccessModal } from '@/components/TeacherAccessModal';
import { Theme } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { EVENTS, track } from '@/services/analytics';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { ReactNode, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// English only, like the Privacy page. The audience is Estonian-language
// teachers, who read English; translating it three ways would add churn for
// readers it doesn't have.
const CONTACT_EMAIL = 'andreabarrandeguy@gmail.com';

function Section({ title, theme, children }: { title: string; theme: Theme; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>{children}</Text>
    </View>
  );
}

export default function TeachersScreen() {
  const { theme } = useTheme();
  const [accessVisible, setAccessVisible] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    track(EVENTS.TEACHERS_OPENED);
  }, []);

  // The daily AI limit is counted per IP address, so a class on one school
  // Wi-Fi shares a handful of checks between all of them. Until that is keyed
  // per person, a group only works if the limit is raised for their address by
  // hand, which is why the request form is the page's main action rather than
  // an afterthought under the contact line.
  const handleCopy = async () => {
    await Clipboard.setStringAsync(CONTACT_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenContainer title="For teachers" showBackButton>
        <Text style={[styles.lede, { color: theme.text }]}>
          EestiRoll is a free browser exercise for beginner Estonian. A learner rolls a
          handful of random Estonian words, writes one sentence using all of them, and
          gets immediate feedback on what is wrong and which rule explains it.
        </Text>

        <Section title="Who it is for" theme={theme}>
          A1–A2 learners who have some vocabulary but little practice putting the cases
          and verb forms together. One round takes under five minutes, so it fits a
          warm-up or the last few minutes of a lesson.
        </Section>

        <Section title="How a round works" theme={theme}>
          {'1. Roll: the learner gets a random set of words, one per grammatical category (a verb, a noun, a place, and so on).\n\n'}
          {'2. Write: they form a single sentence in Estonian using all of them, changing the word forms as needed. A learner who cannot get started can ask for a sentence in their own language to translate instead.\n\n'}
          {'3. Feedback: a score out of five, the one core issue, the rule behind it, and a corrected sentence.'}
        </Section>

        <Section title="Using it in class" theme={theme}>
          {'• Same roll, many answers. Project one roll and have the class write their own sentences, then compare. The same three words support very different correct sentences.\n\n'}
          {'• Target a grammar point. The categories in play are configurable, so a round can be weighted toward places for the locative cases, or toward time words.\n\n'}
          {'• A way in for a learner who freezes. On request the app supplies a sentence in the learner\u2019s own language to translate, which turns an open composition into a translation task. The same grammar, without the blank page.\n\n'}
          {'• Homework with a record. Each learner’s submissions and the notes they received stay in History on their own device.'}
        </Section>

        <Section title="Practical details" theme={theme}>
          {'• Free, and it runs in a browser on a phone or a computer. Nothing to install, and an account is optional.\n\n'}
          {'• Each learner gets three corrections and ten sentence suggestions a day.\n\n'}
          {'• The interface is available in English, Spanish and Russian. The practice itself is always Estonian.\n\n'}
          {'• Vocabulary is A1 by default, with an A2 setting.'}
        </Section>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Get in touch</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            The daily limits are what keep the app free to run. For a whole class they can
            be raised. Request access below, and say how many learners to expect.
          </Text>

          <Pressable
            onPress={() => { track(EVENTS.TEACHERS_ACCESS_OPENED); setAccessVisible(true); }}
            style={[styles.cta, { backgroundColor: theme.accent }]}
          >
            <Text style={[styles.ctaText, { color: theme.accentText }]}>Unlock teacher access</Text>
          </Pressable>

          <Text style={[styles.footnote, { color: theme.iconInactive }]}>
            Feedback from teachers is highly valued and appreciated. Feel free to use the{' '}
            <Text
              style={[styles.footnoteLink, { color: theme.text }]}
              onPress={() => setFeedbackVisible(true)}
            >
              feedback form
            </Text>
            {' '}or reach out via email.
          </Text>

          <Pressable onPress={handleCopy} style={styles.copyRow}>
            <Text style={[styles.copyEmail, { color: theme.iconInactive }]}>{CONTACT_EMAIL}</Text>
            <Text style={[styles.copyAction, { color: theme.text }]}>
              {copied ? 'Copied' : 'Copy'}
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 20 }} />
      </ScreenContainer>

      <TeacherAccessModal visible={accessVisible} onDismiss={() => setAccessVisible(false)} />

      <FeedbackModal
        visible={feedbackVisible}
        onDismiss={() => setFeedbackVisible(false)}
        source="teachers"
      />
    </>
  );
}

const styles = StyleSheet.create({
  lede: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
  },
  // The one thing this page is for, so it gets the full width and sits above
  // everything else in the section rather than trailing after a paragraph.
  cta: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 999,
    marginTop: 18,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
  },
  footnote: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 18,
  },
  footnoteLink: {
    textDecorationLine: 'underline',
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  copyEmail: {
    fontSize: 13,
  },
  copyAction: {
    fontSize: 13,
    fontWeight: '700',
  },
});
