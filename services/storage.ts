import { ThemeMode } from '@/constants/Colors';
import { HistoryEntry } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const KEYS = {
    CATEGORIES: '@selected_categories',
    HISTORY: '@history_v1',
    THEME: '@theme_mode',
} as const;

/**
 * Service for handling all AsyncStorage operations
 */
export const StorageService = {
    // Category operations
    async saveCategories(categories: string[]): Promise<void> {
        try {
            await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
        } catch (error) {
            console.error('Error saving categories:', error);
            throw error;
        }
    },

    async loadCategories(): Promise<string[] | null> {
        try {
            const saved = await AsyncStorage.getItem(KEYS.CATEGORIES);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Error loading categories:', error);
            return null;
        }
    },

    // History operations
    async saveHistory(history: HistoryEntry[]): Promise<void> {
        try {
            await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
        } catch (error) {
            console.error('Error saving history:', error);
            throw error;
        }
    },

    async loadHistory(): Promise<HistoryEntry[] | null> {
        try {
            const saved = await AsyncStorage.getItem(KEYS.HISTORY);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Error loading history:', error);
            return null;
        }
    },

    // Theme operations
    async saveTheme(mode: ThemeMode): Promise<void> {
        try {
            await AsyncStorage.setItem(KEYS.THEME, mode);
        } catch (error) {
            console.error('Error saving theme:', error);
            throw error;
        }
    },

    async loadTheme(): Promise<ThemeMode | null> {
        try {
            const saved = await AsyncStorage.getItem(KEYS.THEME);
            return saved as ThemeMode | null;
        } catch (error) {
            console.error('Error loading theme:', error);
            return null;
        }
    },

    // Clear all data (useful for debugging or user logout)
    async clearAll(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([KEYS.CATEGORIES, KEYS.HISTORY, KEYS.THEME]);
        } catch (error) {
            console.error('Error clearing storage:', error);
            throw error;
        }
    }
};