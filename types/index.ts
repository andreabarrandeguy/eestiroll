// Word related types
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
    selectedCategories: string[];
    toggleCategory: (category: string) => void;
    isLoading: boolean;
}

export interface HistoryEntry {
    words: Word[];
    sentence: string;
    timestamp: number;
}

export interface HistoryContextType {
    history: HistoryEntry[];
    addEntry: (words: Word[], sentence: string) => void;
    getUsedWords: () => string[];
}

export interface RandomContextType {
    triggerRandom: () => void;
    randomTrigger: number;
}