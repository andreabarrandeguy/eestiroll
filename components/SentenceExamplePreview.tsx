import { Fonts } from '@/constants/Fonts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from '@/hooks/useTranslations';
import { EXAMPLE_ROLLED_WORDS, EXAMPLE_SENTENCES } from '@/utils/sentenceExamples';
import { categoryColorMap } from '@/utils/wordData';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * The worked example, shown in place rather than behind a tap.
 *
 * Used on the hint that appears when someone sends the rolled words back
 * unchanged. That person has just demonstrated they haven't got the shape of
 * the game, so asking them to go open something and read it is the wrong ask:
 * the answer has to be on screen already. One sentence here, with the rest
 * behind the link at the bottom.
 *
 * Headed "Example" in so many words. These are not the words that were just
 * rolled, and on a screen that has only told someone they did something wrong,
 * a box of unfamiliar words with no label invites exactly the wrong reading —
 * that these were their words, or that something else has gone astray.
 */
export function SentenceExamplePreview({ onMore }: { onMore: () => void }) {
  const { theme } = useTheme();
  const { t } = useTranslations();
  const { language } = useLanguage();

  const example = EXAMPLE_SENTENCES[0];

  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <Text style={[styles.heading, { color: theme.accent }]}>
        {t('sentenceBuilderExampleLabel')}
      </Text>
      {/* Both halves named in full sentences. The box has to say two things —
          that these stand in for the words someone rolled, and that the
          sentence is what gets submitted — and a bare arrow between them left
          the second to be inferred. */}
      <Text style={[styles.caption, { color: theme.iconInactive }]}>
        {t('wordsNotAdjustedIfYourWords')}
      </Text>
      <View style={styles.chipsRow}>
        {EXAMPLE_ROLLED_WORDS.map(w => (
          <View key={w.word} style={[styles.chip, { backgroundColor: categoryColorMap[w.category] }]}>
            <Text style={styles.chipWord}>{w.word}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.caption, styles.captionAfterChips, { color: theme.iconInactive }]}>
        {t('wordsNotAdjustedYouCouldWrite')}
      </Text>
      <Text style={[styles.sentence, { color: theme.text }]}>{example.et}</Text>
      <Text style={[styles.translation, { color: theme.iconInactive }]}>{example[language]}</Text>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <TouchableOpacity onPress={onMore} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={[styles.more, { color: theme.iconInactive }]}>
          {t('wordsNotAdjustedSeeExample')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  heading: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    fontFamily: Fonts.bodyBold,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 9,
  },
  chipWord: {
    fontSize: 13,
    color: '#0A0A0A',
    textAlign: 'center',
    fontFamily: Fonts.bodyBold,
  },
  caption: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: Fonts.bodyRegular,
  },
  captionAfterChips: {
    marginTop: 12,
  },
  sentence: {
    fontSize: 15,
    textAlign: 'center',
    fontFamily: Fonts.bodyBold,
  },
  translation: {
    fontSize: 12,
    marginTop: 3,
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: Fonts.bodyRegular,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginTop: 14,
    marginBottom: 12,
    opacity: 0.6,
  },
  more: {
    fontSize: 13,
    fontFamily: Fonts.bodyRegular,
    textDecorationLine: 'underline',
  },
});
