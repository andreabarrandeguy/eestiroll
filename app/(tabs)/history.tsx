import { Icon } from '@/components/Icon';
import { getAllWordTranslations, getWordTranslation } from '@/components/WordCard';
import { WordModal } from '@/components/WordModal';
import { useHistory } from '@/contexts/HistoryContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from '@/hooks/useTranslations';
import { checkSentenceWithAI } from '@/services/aiService';
import { Word } from '@/types';
import { categoryColorMap } from '@/utils/wordData';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const languageMap: Record<string, string> = {
  es: "Spanish",
  en: "English",
  ru: "Russian",
};

const getScoreColor = (score: number) => {
  if (score >= 4) return '#3C8D5F';
  if (score >= 3) return '#EFC320';
  return '#E95A35';
};

const SkeletonLine = ({ width = '100%' as any, height = 16, style = {} }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[{
        width,
        height,
        borderRadius: 6,
        backgroundColor: '#888',
        opacity,
        marginVertical: 4,
      }, style]}
    />
  );
};

export default function HistoryScreen() {
  const { history, deleteEntry, deleteMultiple, updateNote, updateEntryAI } = useHistory();
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
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());
  const [loadingFeedback, setLoadingFeedback] = useState<number | null>(null);
  const [aiLimitReached, setAiLimitReached] = useState(false);

  const toggleExpand = useCallback((timestamp: number) => {
    setExpandedEntries(prev => {
      const next = new Set(prev);
      if (next.has(timestamp)) next.delete(timestamp);
      else next.add(timestamp);
      return next;
    });
  }, []);

  const handleWordPress = (word: Word) => {
    setSelectedWord(word);
    setModalVisible(true);
  };

  const handleDelete = (timestamp: number) => {
    if (Platform.OS === 'web') {
      if (window.confirm(t('deleteConfirmation'))) deleteEntry(timestamp);
    } else {
      Alert.alert(t('deleteEntry'), t('deleteConfirmation'), [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), style: 'destructive', onPress: () => deleteEntry(timestamp) }
      ]);
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
      prev.includes(timestamp) ? prev.filter(t => t !== timestamp) : [...prev, timestamp]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEntries.length === history.length) setSelectedEntries([]);
    else setSelectedEntries(history.map(e => e.timestamp));
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
      Alert.alert(t('deleteSelected'), message, [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'), style: 'destructive',
          onPress: () => { deleteMultiple(selectedEntries); setSelectedEntries([]); setSelectionMode(false); }
        }
      ]);
    }
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedEntries([]);
  };

  const handleGetFeedback = useCallback(async (entry: typeof history[0]) => {
    if (loadingFeedback || aiLimitReached) return;

    const aiWords = entry.words.map(w => ({
      estonian: w.word,
      translation: getWordTranslation(w.word, w.category, language),
    }));

    setLoadingFeedback(entry.timestamp);

    try {
      const result = await checkSentenceWithAI({
        words: aiWords,
        sentence: entry.sentence,
        language: languageMap[language] || "English",
      });
      updateEntryAI(entry.timestamp, result);
      if (result.remaining === 0) setAiLimitReached(true);
    } catch (e) {
      if (e instanceof Error && e.message === "daily_limit") {
        setAiLimitReached(true);
      } else {
        console.error("AI check failed:", e);
      }
    } finally {
      setLoadingFeedback(null);
    }
  }, [loadingFeedback, aiLimitReached, language, updateEntryAI]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.contentWrapper}>
        <View style={styles.fixedHeader}>
          <Text style={[styles.title, { color: theme.text }]}>
            {`${t('history')} (${history.length}/100)`}
          </Text>
          {history.length > 0 && (
            <View style={styles.selectionBar}>
              {selectionMode ? (
                <>
                  <TouchableOpacity onPress={toggleSelectAll} style={styles.selectionButton}>
                    <Icon name={selectedEntries.length === history.length ? "checkbox" : "square-outline"} size={20} color={theme.text} />
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

        <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {history.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.text }]}>{t('noHistoryYet')}</Text>
            ) : (
              history.map((entry) => {
                const isExpanded = expandedEntries.has(entry.timestamp);
                const hasAI = entry.aiScore !== undefined;
                const isLoadingThis = loadingFeedback === entry.timestamp;
                const scoreColor = hasAI ? getScoreColor(entry.aiScore!) : theme.border;

                return (
                  <View key={entry.timestamp} style={[styles.entryContainer, { backgroundColor: theme.cardBackground }]}>
                    {showCopied === entry.timestamp && (
                      <View style={styles.copiedOverlay}>
                        <Text style={styles.copiedText}>{t('copied')}</Text>
                      </View>
                    )}

                    {/* Preview row: color bar + sentence + actions */}
                    <View style={styles.previewRow}>
                      <View style={[styles.colorBar, { backgroundColor: scoreColor }]}>
                        {hasAI && (
                          <Text style={styles.colorBarScore}>{entry.aiScore}/5</Text>
                        )}
                      </View>

                      <View style={styles.previewContent}>
                        <View style={styles.entryHeader}>
                          {selectionMode && (
                            <TouchableOpacity onPress={() => toggleSelectEntry(entry.timestamp)} style={styles.checkbox}>
                              <Icon
                                name={selectedEntries.includes(entry.timestamp) ? "checkbox" : "square-outline"}
                                size={22}
                                color={selectedEntries.includes(entry.timestamp) ? theme.yellow : theme.iconInactive}
                              />
                            </TouchableOpacity>
                          )}
                          <Text style={[
                            styles.sentenceText,
                            { color: theme.text, fontStyle: entry.sentence ? 'normal' : 'italic', opacity: entry.sentence ? 1 : 0.5 }
                          ]}>
                            {entry.sentence || '(no sentence)'}
                          </Text>
                          {!selectionMode && (
                            <View style={styles.actionButtons}>
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

                        <TouchableOpacity onPress={() => toggleExpand(entry.timestamp)} style={styles.expandButton}>
                          <Icon name={isExpanded ? "chevron-up" : "chevron-down"} size={18} color={theme.iconInactive} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Expanded content: full width, no color bar */}
                    {isExpanded && (
                      <View style={[styles.expandedContent, { borderTopColor: theme.border }]}>
                        {/* Word chips */}
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

                        {/* AI feedback or Get Feedback button */}
                        {hasAI ? (
                          <View style={[styles.aiSection, { borderTopColor: theme.border }]}>
                            {entry.aiValidation && (
                              <View style={styles.aiField}>
                                <Text style={[styles.aiFieldValue, { color: theme.text }]}>{entry.aiValidation}</Text>
                              </View>
                            )}
                            {entry.aiScore! < 5 && (
                              <>
                                {entry.aiCoreIssue ? (
                                  <View style={styles.aiField}>
                                    <Text style={[styles.aiFieldValue, { color: theme.text, fontWeight: '600' }]}>{entry.aiCoreIssue}</Text>
                                  </View>
                                ) : null}
                                {entry.aiRule ? (
                                  <View style={styles.aiField}>
                                    <Text style={[styles.aiFieldValue, { color: theme.text, fontWeight: '600', fontSize: 18 }]}>{entry.aiRule}</Text>
                                  </View>
                                ) : null}
                                {entry.aiCorrectedSentence ? (
                                  <View style={styles.aiField}>
                                    <Text style={[styles.aiFieldValue, { color: theme.text, fontStyle: 'italic' }]}>{t('correction')}: {entry.aiCorrectedSentence}</Text>
                                  </View>
                                ) : null}

                                {entry.aiNotes ? (
                                  <View style={styles.aiField}>
                                    <Text style={[styles.aiFieldValue, { color: theme.text, fontStyle: 'italic' }]}>{entry.aiNotes}</Text>
                                  </View>
                                ) : null}
                              </>
                            )}
                          </View>
                        ) : isLoadingThis ? (
                          <View style={[styles.aiSection, { borderTopColor: theme.border }]}>
                            <SkeletonLine width={60} height={24} />
                            <SkeletonLine width="90%" style={{ marginTop: 10 }} />
                            <SkeletonLine width="75%" />
                            <SkeletonLine width="60%" style={{ marginTop: 10 }} />
                            <SkeletonLine width="95%" style={{ marginTop: 10 }} />
                          </View>
                        ) : (
                          <View style={[styles.feedbackButtonContainer, { borderTopColor: theme.border }]}>
                            <TouchableOpacity
                              onPress={() => handleGetFeedback(entry)}
                              disabled={aiLimitReached}
                              style={[
                                styles.feedbackButton,
                                aiLimitReached && { opacity: 0.4 }
                              ]}
                            >
                              <Icon name="sparkles-outline" size={16} color="#3B82F6" />
                              <Text style={styles.feedbackButtonText}>
                                {aiLimitReached ? t('dailyLimitReached') : t('getFeedback')}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}

                        {/* Notes */}
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
                            <TouchableOpacity onPress={() => handleEditNote(entry.timestamp, entry.note)} style={styles.noteDisplay}>
                              {entry.note ? (
                                <Text style={[styles.noteText, { color: theme.text }]}>
                                  <Text style={{ fontWeight: '600' }}>{t('note')}: </Text>
                                  {entry.note}
                                </Text>
                              ) : (
                                <View style={styles.addNoteRow}>
                                  <Icon name="add-circle-outline" size={14} color={theme.iconInactive} />
                                  <Text style={[styles.addNoteText, { color: theme.iconInactive }]}>{' '}{t('addNote')}</Text>
                                </View>
                              )}
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                );
              })
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
  container: { flex: 1 },
  contentWrapper: { flex: 1, maxWidth: 500, width: '100%', alignSelf: 'center' },
  fixedHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 16 },
  selectionBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectionButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  selectionButtonText: { fontSize: 14 },
  selectionActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deleteButtonText: { color: '#E95A35', fontSize: 14, fontWeight: '500' },
  cancelButton: { padding: 4 },
  cancelButtonText: { fontSize: 14 },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  emptyText: { fontSize: 16, textAlign: 'center', opacity: 0.6, marginTop: 40 },
  entryContainer: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  previewRow: {
    flexDirection: 'row',
  },
  colorBar: {
    width: 32,
    borderTopLeftRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorBarScore: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  previewContent: {
    flex: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 8,
  },
  checkbox: { marginRight: 12 },
  sentenceText: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    flex: 1,
    marginRight: 8,
  },
  actionButtons: { flexDirection: 'row', gap: 12 },
  actionButton: { padding: 4 },
  expandButton: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingBottom: 10,
  },
  expandedContent: {
    borderTopWidth: 1,
    paddingBottom: 4,
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  wordChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  wordChipText: { fontSize: 14, fontWeight: '600', color: '#000' },
  aiSection: { borderTopWidth: 1, marginHorizontal: 16, paddingTop: 10, paddingBottom: 10 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiLabel: {
    fontSize: 12, fontWeight: '700', color: '#3B82F6',
    backgroundColor: '#EFF6FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden',
  },
  aiScore: { fontSize: 20, fontWeight: '700' },
  aiField: { marginTop: 8 },
  aiFieldLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  aiFieldValue: { fontSize: 13, lineHeight: 19 },
  feedbackButtonContainer: {
    borderTopWidth: 1,
    marginHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: 'center',
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  feedbackButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  noteSection: { borderTopWidth: 1, marginHorizontal: 16, paddingTop: 12, paddingBottom: 12 },
  noteDisplay: { minHeight: 24 },
  noteText: { fontSize: 14, lineHeight: 20 },
  addNoteRow: { flexDirection: 'row', alignItems: 'center' },
  addNoteText: { fontSize: 14 },
  noteEditContainer: { gap: 8 },
  noteInput: { fontSize: 14, borderWidth: 1, borderRadius: 8, padding: 10, minHeight: 60, textAlignVertical: 'top' },
  noteEditActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  noteEditButton: { padding: 4 },
  copiedOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center',
    borderRadius: 12, zIndex: 10,
  },
  copiedText: { fontSize: 20, fontWeight: '600', color: '#fff' },
});