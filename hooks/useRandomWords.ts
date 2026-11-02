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
        // The categories arrive from their own fetch, which lands *after* the
        // screen is interactive — and the dice is wiggling for attention that
        // whole time. Rolling in that window used to produce zero words but
        // still bump refreshKey, which permanently replaced the "tap the dice"
        // hint with "No categories selected" (untrue — nothing was deselected)
        // and took the tutorial link with it. Sit it out instead: this effect
        // already depends on availableCategories, so it re-runs by itself the
        // moment they land, and the roll happens then.
        if (availableCategories.length === 0) return;

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