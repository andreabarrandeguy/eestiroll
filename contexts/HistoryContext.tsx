import { StorageService } from '@/services/storage';
import { HistoryContextType, HistoryEntry, Word } from '@/types';
import React, { createContext, useContext, useEffect, useState } from 'react';

const MAX_HISTORY = 27;

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

  const addEntry = async (words: Word[], sentence: string) => {
    const newEntry: HistoryEntry = {
      words,
      sentence,
      timestamp: Date.now(),
    };

    const newHistory = [newEntry, ...history].slice(0, MAX_HISTORY);
    setHistory(newHistory);
    
    try {
      await StorageService.saveHistory(newHistory);
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const getUsedWords = () => {
    return history.flatMap(entry => entry.words.map(w => w.word));
  };

  return (
    <HistoryContext.Provider value={{ history, addEntry, getUsedWords }}>
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