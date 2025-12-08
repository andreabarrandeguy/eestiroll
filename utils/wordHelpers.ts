import { fetchContent } from '@/services/api';
import { allWords as fallbackWords } from './wordData';

let cachedWords: Record<string, any[]> = {};
let isLoaded = false;

export async function loadWordsFromAPI() {
    try {
        const content = await fetchContent();
        cachedWords = content?.data?.words ?? fallbackWords;
        isLoaded = true;
    } catch (error) {
        console.error('Error loading words from API, using fallback:', error);
        cachedWords = fallbackWords;
        isLoaded = true;
    }
}

export function getRandomWords(
    selectedCategories: string[],
    usedWords: string[] = []
) {
    // Use fallback if not loaded yet
    const words = isLoaded ? cachedWords : fallbackWords;

    return selectedCategories.map(categoryCode => {
        const wordList = words[categoryCode] || [];

        const availableWords = wordList.filter(
            (wordObj: any) => !usedWords.includes(wordObj.word)
        );

        const finalList = availableWords.length > 0 ? availableWords : wordList;

        // Better fallback than showing "error"
        if (finalList.length === 0) {
            return { word: '—', category: categoryCode };
        }

        const randomIndex = Math.floor(Math.random() * finalList.length);
        return {
            word: finalList[randomIndex].word,
            category: categoryCode
        };
    });
}