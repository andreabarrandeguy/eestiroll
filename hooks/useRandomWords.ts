import { useCategories } from '@/contexts/CategoryContext';
import { useRandom } from '@/contexts/RandomContext';
import { Word } from '@/types';
import { getRandomWords } from '@/utils/wordHelpers';
import { useEffect, useRef, useState } from 'react';

const MAX_RECENT_WORDS = 25;

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function useRandomWords() {
    const [words, setWords] = useState<Word[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [sentence, setSentence] = useState('');
    const recentWords = useRef<string[]>([]);

    const { randomTrigger } = useRandom();
    const { categoryCount, availableCategories } = useCategories();

    const generateNewWords = () => {
        // Select random categories from available ones
        const shuffledCategories = shuffleArray(availableCategories);
        const selectedCategories = shuffledCategories.slice(0, categoryCount);

        // Generate new words avoiding recently used ones
        const newWords = getRandomWords(selectedCategories, recentWords.current);

        setWords(newWords);
        setRefreshKey(prev => prev + 1);

        // Track these words as recently used
        const newWordsList = newWords.map(w => w.word);
        recentWords.current = [...newWordsList, ...recentWords.current].slice(0, MAX_RECENT_WORDS);

        // Clear the sentence for the new round
        setSentence('');
    };

    // Trigger generation when random button is pressed
    useEffect(() => {
        if (randomTrigger > 0) {
            generateNewWords();
        }
    }, [randomTrigger, categoryCount, availableCategories]);

    return {
        words,
        refreshKey,
        sentence,
        setSentence,
    };
}