import { useCategories } from '@/contexts/CategoryContext';
import { useHistory } from '@/contexts/HistoryContext';
import { useRandom } from '@/contexts/RandomContext';
import { getRandomWords } from '@/utils/wordHelpers';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard } from 'react-native';

interface Word {
    word: string;
    category: string;
}

const MAX_RECENT_WORDS = 25; // Track last 25 words to avoid repetition

export function useRandomWords() {
    const [words, setWords] = useState<Word[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [sentence, setSentence] = useState('');
    const recentWords = useRef<string[]>([]);

    const { randomTrigger } = useRandom();
    const { selectedCategories } = useCategories();
    const { addEntry } = useHistory();

    const generateNewWords = () => {
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

    const handleSend = useCallback(() => {
        // Only save if there's a sentence
        if (sentence.trim().length > 0) {
            addEntry(words, sentence);
            setSentence('');
            Keyboard.dismiss();
        }
    }, [words, sentence, addEntry]);

    // Trigger generation when random button is pressed
    useEffect(() => {
        if (randomTrigger > 0) {
            generateNewWords();
        }
    }, [randomTrigger, selectedCategories]);

    return {
        words,
        refreshKey,
        sentence,
        setSentence,
        handleSend,
        generateNewWords
    };
}