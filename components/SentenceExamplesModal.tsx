import { Icon } from '@/components/Icon';
import { Fonts } from '@/constants/Fonts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Category, categoryColorMap } from '@/utils/wordData';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface SentenceExamplesModalProps {
  visible: boolean;
  onDismiss: () => void;
}

// One rolled-words scenario, shown once, then 3 different real sentences
// built from it — demonstrates that the *same* rolled words can be
// conjugated/declined into different sentences, rather than 3 disconnected
// one-off examples that each needed their own rolled words.
const ROLLED_WORDS: { category: Category; word: string }[] = [
  { category: 'VERB', word: 'Minema' },
  { category: 'PLACE', word: 'Park' },
  { category: 'NOUN', word: 'Sõber' },
];

const EXAMPLE_SENTENCES: { et: string; en: string; es: string; ru: string }[] = [
  {
    et: 'Ma lähen oma sõbra parki.',
    en: "I'm going to my friend's park.",
    es: 'Voy al parque de mi amigo.',
    ru: 'Я иду в парк моего друга.',
  },
  {
    et: 'Ma ei saa minna, olen sõbraga pargis.',
    en: "I can't go, I am at the park with a friend.",
    es: 'No puedo ir, estoy en el parque con un amigo.',
    ru: 'Я не могу пойти, я в парке с другом.',
  },
  {
    et: 'Park on nii ilus. Lähme, sõber!',
    en: "Park is so beautiful. Let's go, friend!",
    es: '¡El parque es tan lindo! ¡Vamos, amigo!',
    ru: 'Парк такой красивый. Пойдём, друг!',
  },
];

export function SentenceExamplesModal({ visible, onDismiss }: SentenceExamplesModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslations();
  const { language } = useLanguage();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable
          style={[styles.container, { backgroundColor: theme.background, borderColor: theme.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>{t('sentenceBuilderExampleLabel')}</Text>
            <Pressable onPress={onDismiss} hitSlop={8}>
              <Icon name="close" size={20} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.rolledWordsLabel, { color: theme.iconInactive }]}>
              {t('sentenceRolledWordsLabel')}
            </Text>
            <View style={styles.chipsRow}>
              {ROLLED_WORDS.map((w) => (
                <View key={w.word} style={[styles.chip, { backgroundColor: categoryColorMap[w.category] }]}>
                  <Text style={styles.chipCategory}>{t(w.category as any)}</Text>
                  <Text style={styles.chipWord}>{w.word}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.hint, { color: theme.iconInactive }]}>{t('sentenceBuilderFormHint')}</Text>

            {EXAMPLE_SENTENCES.map((example, i) => (
              <View
                key={example.et}
                style={[styles.sentenceBlock, i > 0 && { borderTopColor: theme.border, borderTopWidth: 1 }]}
              >
                <Text style={[styles.sentence, { color: theme.text }]}>{example.et}</Text>
                <Text style={[styles.translation, { color: theme.iconInactive }]}>{example[language]}</Text>
              </View>
            ))}
          </ScrollView>
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
    maxHeight: '80%',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.heading,
  },
  rolledWordsLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: Fonts.bodyBold,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  chipCategory: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    color: '#0A0A0A',
    opacity: 0.6,
    textAlign: 'center',
    fontFamily: Fonts.bodySemiBold,
  },
  chipWord: {
    fontSize: 13,
    color: '#0A0A0A',
    textAlign: 'center',
    fontFamily: Fonts.bodyBold,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 14,
    fontFamily: Fonts.bodyRegular,
  },
  sentenceBlock: {
    paddingVertical: 12,
  },
  sentence: {
    fontSize: 16,
    fontFamily: Fonts.bodyBold,
  },
  translation: {
    fontSize: 13,
    marginTop: 4,
    fontStyle: 'italic',
    fontFamily: Fonts.bodyRegular,
  },
});
