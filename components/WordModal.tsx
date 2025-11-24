import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface WordModalProps {
  visible: boolean;
  onClose: () => void;
  estonianWord: string;
  translation: string;
  category: string;
  cardColor: string;
}

export function WordModal({ 
  visible, 
  onClose, 
  estonianWord, 
  translation, 
  category,
  cardColor 
}: WordModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslations();

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
            <Ionicons name="close" size={24} color={theme.text} />
          </Pressable>

          <Text style={[styles.category, { color: cardColor }]}>
            {category}
          </Text>

          <Text style={[styles.estonianWord, { color: theme.text }]}>
            {estonianWord}
          </Text>

          <View style={[styles.divider, { backgroundColor: cardColor }]} />

          <Text style={[styles.translationLabel, { color: theme.text }]}>
            {t('translation')}:
          </Text>
          <Text style={[styles.translation, { color: theme.text }]}>
            {translation}
          </Text>
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
  },
});