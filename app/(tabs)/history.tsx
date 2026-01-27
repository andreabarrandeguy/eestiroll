import { Icon } from '@/components/Icon';
import { getAllWordTranslations, getWordTranslation } from '@/components/WordCard';
import { WordModal } from '@/components/WordModal';
import { useHistory } from '@/contexts/HistoryContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Word } from '@/types';
import { categoryColorMap } from '@/utils/wordData';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const { history, deleteEntry, deleteMultiple, updateNote } = useHistory();
  const { theme } = useTheme();
  const { t } = useTranslations();
  const { language } = useLanguage();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [editingNoteTimestamp, setEditingNoteTimestamp] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [showCopied, setShowCopied] = useState<number | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<number[]>([]);

  const handleWordPress = (word: Word) => {
    setSelectedWord(word);
    setModalVisible(true);
  };

  const handleCopy = async (sentence: string, timestamp: number) => {
    await Clipboard.setStringAsync(sentence);
    setShowCopied(timestamp);
    setTimeout(() => setShowCopied(null), 1500);
  };

  const handleDelete = (timestamp: number) => {
    if (Platform.OS === 'web') {
      if (window.confirm(t('deleteConfirmation'))) {
        deleteEntry(timestamp);
      }
    } else {
      Alert.alert(
        t('deleteEntry'),
        t('deleteConfirmation'),
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('delete'), style: 'destructive', onPress: () => deleteEntry(timestamp) }
        ]
      );
    }
  };

  const handleEditNote = (timestamp: number, currentNote?: string) => {
    setEditingNoteTimestamp(timestamp);
    setNoteText(currentNote || '');
  };

  const handleSaveNote = () => {
    if (editingNoteTimestamp) {
      updateNote(editingNoteTimestamp, noteText);
      setEditingNoteTimestamp(null);
      setNoteText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteTimestamp(null);
    setNoteText('');
  };

  const toggleSelectEntry = (timestamp: number) => {
    setSelectedEntries(prev => 
      prev.includes(timestamp) 
        ? prev.filter(t => t !== timestamp)
        : [...prev, timestamp]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEntries.length === history.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(history.map(e => e.timestamp));
    }
  };

  const handleDeleteSelected = () => {
    const message = t('deleteSelectedConfirmation').replace('{count}', String(selectedEntries.length));
    
    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        deleteMultiple(selectedEntries);
        setSelectedEntries([]);
        setSelectionMode(false);
      }
    } else {
      Alert.alert(
        t('deleteSelected'),
        message,
        [
          { text: t('cancel'), style: 'cancel' },
          { 
            text: t('delete'), 
            style: 'destructive', 
            onPress: () => {
              deleteMultiple(selectedEntries);
              setSelectedEntries([]);
              setSelectionMode(false);
            }
          }
        ]
      );
    }
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedEntries([]);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.contentWrapper}>
        {/* Fixed Header */}
        <View style={styles.fixedHeader}>
          <Text style={[styles.title, { color: theme.text }]}>
            {`${t('history')} (${history.length}/100)`}
          </Text>

          {history.length > 0 && (
            <View style={styles.selectionBar}>
              {selectionMode ? (
                <>
                  <TouchableOpacity onPress={toggleSelectAll} style={styles.selectionButton}>
                    <Icon 
                      name={selectedEntries.length === history.length ? "checkbox" : "square-outline"} 
                      size={20} 
                      color={theme.text} 
                    />
                    <Text style={[styles.selectionButtonText, { color: theme.text }]}>
                      {selectedEntries.length === history.length ? t('deselectAll') : t('selectAll')}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.selectionActions}>
                    {selectedEntries.length > 0 && (
                      <TouchableOpacity onPress={handleDeleteSelected} style={styles.deleteButton}>
                        <Icon name="trash" size={18} color="#E95A35" />
                        <Text style={styles.deleteButtonText}>{t('delete')} ({selectedEntries.length})</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={exitSelectionMode} style={styles.cancelButton}>
                      <Text style={[styles.cancelButtonText, { color: theme.iconInactive }]}>{t('cancel')}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <TouchableOpacity onPress={() => setSelectionMode(true)} style={styles.selectionButton}>
                  <Icon name="checkmark-circle-outline" size={20} color={theme.iconInactive} />
                  <Text style={[styles.selectionButtonText, { color: theme.iconInactive }]}>{t('select')}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Scrollable Content */}
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {history.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.text }]}>
                {t('noHistoryYet')}
              </Text>
            ) : (
              history.map((entry) => (
                <View 
                  key={entry.timestamp} 
                  style={[styles.entryContainer, { backgroundColor: theme.cardBackground }]}
                >
                  {showCopied === entry.timestamp && (
                    <View style={styles.copiedOverlay}>
                      <Text style={styles.copiedText}>{t('copied')}</Text>
                    </View>
                  )}

                  <View style={styles.entryHeader}>
                    {selectionMode && (
                      <TouchableOpacity 
                        onPress={() => toggleSelectEntry(entry.timestamp)}
                        style={styles.checkbox}
                      >
                        <Icon 
                          name={selectedEntries.includes(entry.timestamp) ? "checkbox" : "square-outline"} 
                          size={22} 
                          color={selectedEntries.includes(entry.timestamp) ? theme.yellow : theme.iconInactive} 
                        />
                      </TouchableOpacity>
                    )}
                    <Text style={[
                      styles.sentenceText,
                      { 
                        color: theme.text,
                        fontStyle: entry.sentence ? 'normal' : 'italic', 
                        opacity: entry.sentence ? 1 : 0.5,
                        flex: 1
                      }
                    ]}>
                      {entry.sentence || '(no sentence)'}
                    </Text>
                    
                    {!selectionMode && (
                      <View style={styles.actionButtons}>
                        {entry.sentence && (
                          <TouchableOpacity 
                            onPress={() => handleCopy(entry.sentence, entry.timestamp)}
                            style={styles.actionButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Icon name="copy-outline" size={18} color={theme.iconInactive} />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                          onPress={() => handleDelete(entry.timestamp)}
                          style={styles.actionButton}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Icon name="trash-outline" size={18} color={theme.iconInactive} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  <View style={styles.wordsGrid}>
                    {entry.words.map((item, i) => (
                      <Pressable 
                        key={i} 
                        onPress={() => handleWordPress(item)}
                        style={[styles.wordChip, { backgroundColor: categoryColorMap[item.category] }]}
                      >
                        <Text style={styles.wordChipText}>{item.word}</Text>
                      </Pressable>
                    ))}
                  </View>

                  <View style={[styles.noteSection, { borderTopColor: theme.border }]}>
                    {editingNoteTimestamp === entry.timestamp ? (
                      <View style={styles.noteEditContainer}>
                        <TextInput
                          style={[styles.noteInput, { color: theme.text, borderColor: theme.border }]}
                          placeholder={t('addNote')}
                          placeholderTextColor={theme.iconInactive}
                          value={noteText}
                          onChangeText={setNoteText}
                          multiline
                          autoFocus
                        />
                        <View style={styles.noteEditActions}>
                          <TouchableOpacity onPress={handleCancelEdit} style={styles.noteEditButton}>
                            <Icon name="close" size={20} color={theme.iconInactive} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={handleSaveNote} style={styles.noteEditButton}>
                            <Icon name="checkmark" size={20} color={theme.yellow} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        onPress={() => handleEditNote(entry.timestamp, entry.note)}
                        style={styles.noteDisplay}
                      >
                        {entry.note ? (
                          <Text style={[styles.noteText, { color: theme.text }]}>
                            <Text style={{ fontWeight: '600' }}>{t('note')}: </Text>
                            {entry.note}
                          </Text>
                        ) : (
                          <View style={styles.addNoteRow}>
                            <Icon name="add-circle-outline" size={14} color={theme.iconInactive} />
                            <Text style={[styles.addNoteText, { color: theme.iconInactive }]}>
                              {' '}{t('addNote')}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {selectedWord && (
        <WordModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          estonianWord={selectedWord.word}
          translation={getWordTranslation(selectedWord.word, selectedWord.category, language)}
          allTranslations={getAllWordTranslations(selectedWord.word, selectedWord.category)}
          currentLanguage={language}
          category={t(selectedWord.category as any).toUpperCase()}
          cardColor={categoryColorMap[selectedWord.category]}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  fixedHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectionButtonText: {
    fontSize: 14,
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deleteButtonText: {
    color: '#E95A35',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    padding: 4,
  },
  cancelButtonText: {
    fontSize: 14,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 40,
  },
  checkbox: {
    marginRight: 12,
  },
  entryContainer: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  sentenceText: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    marginRight: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  wordChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  wordChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  noteSection: {
    borderTopWidth: 1,
    marginHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  noteDisplay: {
    minHeight: 24,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
  },
  addNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addNoteText: {
    fontSize: 14,
  },
  noteEditContainer: {
    gap: 8,
  },
  noteInput: {
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  noteEditActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  noteEditButton: {
    padding: 4,
  },
  copiedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    zIndex: 10,
  },
  copiedText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
});