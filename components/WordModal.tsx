import { Icon } from '@/components/Icon';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from '@/hooks/useTranslations';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface WordModalProps {
  visible: boolean;
  onClose: () => void;
  estonianWord: string;
  translation: string;
  allTranslations: Record<string, string>;
  currentLanguage: string;
  category: string;
  cardColor: string;
}

// Order of secondary langs depending on current lang
const SECONDARY_LANGUAGES: Record<string, string[]> = {
  en: ['es', 'ru'],
  es: ['en', 'ru'],
  ru: ['en', 'es'],
};

// Names of langs to show
const LANGUAGE_NAMES: Record<string, Record<string, string>> = {
  en: { en: 'English', es: 'Spanish', ru: 'Russian' },
  es: { en: 'Inglés', es: 'Español', ru: 'Ruso' },
  ru: { en: 'Английский', es: 'Испанский', ru: 'Русский' },
};

export function WordModal({ 
  visible, 
  onClose, 
  estonianWord, 
  translation, 
  allTranslations,
  currentLanguage,
  category,
  cardColor 
}: WordModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslations();

  const secondaryLanguages = SECONDARY_LANGUAGES[currentLanguage] || ['en', 'es'];
  const languageNames = LANGUAGE_NAMES[currentLanguage] || LANGUAGE_NAMES.en;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.overlay}
        onPress={onClose}
      >
        <Pressable 
          style={[
            styles.modalContent,
            { 
              backgroundColor: theme.cardBackground,
              borderColor: cardColor,
            }
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <Pressable 
            style={styles.closeButton}
            onPress={onClose}
          >
            <Icon name="close" size={24} color={theme.text} />
          </Pressable>

          <Text style={[styles.category, { color: cardColor }]}>
            {category}
          </Text>

          <Text style={[styles.estonianWord, { color: theme.text }]}>
            {estonianWord}
          </Text>

          <View style={[styles.divider, { backgroundColor: cardColor }]} />

          {/* Main translation */}
          <Text style={[styles.translationLabel, { color: theme.text }]}>
            {t('translation')}:
          </Text>
          <Text style={[styles.translation, { color: theme.text }]}>
            {translation}
          </Text>

          {/* Secondary translations */}
          <View style={styles.secondaryTranslations}>
            {secondaryLanguages.map((lang) => (
              <View key={lang} style={styles.secondaryItem}>
                <Text style={[styles.secondaryLabel, { color: theme.iconInactive }]}>
                  {languageNames[lang]}:
                </Text>
                <Text style={[styles.secondaryText, { color: theme.text }]}>
                  {allTranslations[lang] || estonianWord}
                </Text>
              </View>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 3,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 1,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  estonianWord: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  divider: {
    height: 2,
    width: 60,
    marginBottom: 16,
    borderRadius: 1,
  },
  translationLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.6,
    marginBottom: 4,
  },
  translation: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 20,
  },
  secondaryTranslations: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
    gap: 8,
  },
  secondaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 70,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.8,
  },
});