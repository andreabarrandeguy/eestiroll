// Word related types
export interface WordTranslations {
    et: string;  // Estonian
    es: string;  // Spanish
    en: string;  // English
    ru: string;  // Russian
}

export type Language = 'en' | 'es' | 'ru';

export type VocabLevel = 'A1' | 'A2';

export interface LanguageOption {
    code: Language;
    name: string;
    nativeName: string;
}

export interface Word {
    word: string;
    category: string;
}

// Component prop types
export interface WordCardProps {
    word: string;
    category: string;
    color: string;
    refreshKey: number;
}

export interface CategoryCardProps {
    category: string;
    color: string;
    isSelected: boolean;
    onPress: () => void;
}

// Context types
export interface CategoryContextType {
    categoryCount: number;
    excludedCategories: string[];
    setCategoryCount: (count: number) => void;
    toggleExcluded: (category: string) => void;
    availableCategories: string[];
    maxExclusions: number;
    isLoading: boolean;
    vocabLevel: VocabLevel;
    setVocabLevel: (level: VocabLevel) => void;
}

export interface HistoryEntry {
    words: Word[];
    sentence: string;
    timestamp: number;
    note?: string;
    aiScore?: number;
    aiValidation?: string;
    aiCoreIssue?: string;
    aiRule?: string;
    aiCorrectedSentence?: string;
    aiNotes?: string;
}

export interface HistoryContextType {
    history: HistoryEntry[];
    addEntry: (words: Word[], sentence: string, aiResult?: any) => void;
    deleteEntry: (timestamp: number) => void;
    deleteMultiple: (timestamps: number[]) => void;
    updateNote: (timestamp: number, note: string) => void;
    updateEntryAI: (timestamp: number, aiResult: any) => void;
    getUsedWords: () => string[];
}

export interface RandomContextType {
    triggerRandom: () => void;
    randomTrigger: number;
}