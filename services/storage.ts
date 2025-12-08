import { ThemeMode } from '@/constants/Colors';
import { HistoryEntry, Language } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    CATEGORIES: '@selected_categories',
    HISTORY: '@history_v1',
    THEME: '@theme_mode',
    LANGUAGE: '@language',
} as const;

// Default values for fallback
const DEFAULTS = {
    categories: ['PRONOUN', 'VERB', 'NOUN'] as string[],
    history: [] as HistoryEntry[],
    theme: 'dark' as ThemeMode,
    language: 'en' as Language,
};

// Retry helper
async function withRetry<T>(
    operation: () => Promise<T>,
    retries = 2,
    delay = 500
): Promise<T> {
    for (let i = 0; i <= retries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i === retries) throw error;
            await new Promise(r => setTimeout(r, delay));
        }
    }
    throw new Error('Retry failed');
}

export const StorageService = {
    // Categories
    async saveCategories(categories: string[]): Promise<boolean> {
        try {
            await withRetry(() =>
                AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories))
            );
            return true;
        } catch (error) {
            console.error('Error saving categories:', error);
            return false;
        }
    },

    async loadCategories(): Promise<string[]> {
        try {
            const saved = await withRetry(() => AsyncStorage.getItem(KEYS.CATEGORIES));
            return saved ? JSON.parse(saved) : DEFAULTS.categories;
        } catch (error) {
            console.error('Error loading categories:', error);
            return DEFAULTS.categories;
        }
    },

    // History
    async saveHistory(history: HistoryEntry[]): Promise<boolean> {
        try {
            await withRetry(() =>
                AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(history))
            );
            return true;
        } catch (error) {
            console.error('Error saving history:', error);
            return false;
        }
    },

    async loadHistory(): Promise<HistoryEntry[]> {
        try {
            const saved = await withRetry(() => AsyncStorage.getItem(KEYS.HISTORY));
            return saved ? JSON.parse(saved) : DEFAULTS.history;
        } catch (error) {
            console.error('Error loading history:', error);
            return DEFAULTS.history;
        }
    },

    // Theme
    async saveTheme(mode: ThemeMode): Promise<boolean> {
        try {
            await withRetry(() => AsyncStorage.setItem(KEYS.THEME, mode));
            return true;
        } catch (error) {
            console.error('Error saving theme:', error);
            return false;
        }
    },

    async loadTheme(): Promise<ThemeMode> {
        try {
            const saved = await withRetry(() => AsyncStorage.getItem(KEYS.THEME));
            return (saved as ThemeMode) || DEFAULTS.theme;
        } catch (error) {
            console.error('Error loading theme:', error);
            return DEFAULTS.theme;
        }
    },

    // Language
    async saveLanguage(language: Language): Promise<boolean> {
        try {
            await withRetry(() => AsyncStorage.setItem(KEYS.LANGUAGE, language));
            return true;
        } catch (error) {
            console.error('Error saving language:', error);
            return false;
        }
    },

    async loadLanguage(): Promise<Language> {
        try {
            const saved = await withRetry(() => AsyncStorage.getItem(KEYS.LANGUAGE));
            return (saved as Language) || DEFAULTS.language;
        } catch (error) {
            console.error('Error loading language:', error);
            return DEFAULTS.language;
        }
    },

    async clearAll(): Promise<boolean> {
        try {
            await withRetry(() =>
                AsyncStorage.multiRemove(Object.values(KEYS))
            );
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }
};