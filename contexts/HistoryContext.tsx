import { StorageService } from '@/services/storage';
import { HistoryContextType, HistoryEntry, Word } from '@/types';
import React, { createContext, useContext, useEffect, useState } from 'react';

const MAX_HISTORY = 100;

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const saved = await StorageService.loadHistory();
      if (saved) {
        setHistory(saved);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const addEntry = async (words: Word[], sentence: string, aiResult?: any) => {
    const newEntry: HistoryEntry = {
      words,
      sentence,
      timestamp: Date.now(),
      ...(aiResult && {
        aiScore: aiResult.score,
        aiValidation: aiResult.validation,
        aiCoreIssue: aiResult.core_issue,
        aiRule: aiResult.rule,
        aiCorrectedSentence: aiResult.corrected_sentence,
        aiNotes: aiResult.notes,
      }),
    };

    const newHistory = [newEntry, ...history].slice(0, MAX_HISTORY);
    setHistory(newHistory);
    
    try {
      await StorageService.saveHistory(newHistory);
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const deleteEntry = async (timestamp: number) => {
    const newHistory = history.filter(entry => entry.timestamp !== timestamp);
    setHistory(newHistory);
    
    try {
      await StorageService.saveHistory(newHistory);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const deleteMultiple = async (timestamps: number[]) => {
    const newHistory = history.filter(entry => !timestamps.includes(entry.timestamp));
    setHistory(newHistory);
    
    try {
      await StorageService.saveHistory(newHistory);
    } catch (error) {
      console.error('Error deleting entries:', error);
    }
  };

  const updateNote = async (timestamp: number, note: string) => {
    const newHistory = history.map(entry => 
      entry.timestamp === timestamp 
        ? { ...entry, note: note.trim() || undefined }
        : entry
    );
    setHistory(newHistory);
    
    try {
      await StorageService.saveHistory(newHistory);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const getUsedWords = () => {
    return history.flatMap(entry => entry.words.map(w => w.word));
  };

  const updateEntryAI = async (timestamp: number, aiResult: any) => {
    const newHistory = history.map(entry =>
      entry.timestamp === timestamp
        ? {
            ...entry,
            aiScore: aiResult.score,
            aiValidation: aiResult.validation,
            aiCoreIssue: aiResult.core_issue,
            aiRule: aiResult.rule,
            aiCorrectedSentence: aiResult.corrected_sentence,
            aiNotes: aiResult.notes,
          }
        : entry
    );
    setHistory(newHistory);
    try {
      await StorageService.saveHistory(newHistory);
    } catch (error) {
      console.error('Error updating entry AI:', error);
    }
  };

  return (
    <HistoryContext.Provider value={{ history, addEntry, deleteEntry, deleteMultiple, updateNote, updateEntryAI, getUsedWords }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within HistoryProvider');
  }
  return context;
}