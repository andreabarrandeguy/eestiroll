import { useCategories } from '@/contexts/CategoryContext';
import { useHistory } from '@/contexts/HistoryContext';
import { useRandom } from '@/contexts/RandomContext';
import { getRandomWords } from '@/utils/wordHelpers';
import { useCallback, useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

interface Word {
    word: string;
    category: string;
}

export function useRandomWords() {
    const [words, setWords] = useState<Word[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [sentence, setSentence] = useState('');

    const { randomTrigger } = useRandom();
    const { selectedCategories } = useCategories();
    const { addEntry, getUsedWords } = useHistory();

    const generateNewWords = () => {
        // Save current words to history before generating new ones
        if (words.length > 0) {
            addEntry(words, sentence);
        }

        // Generate new words avoiding recently used ones
        const usedWords = getUsedWords();
        const newWords = getRandomWords(selectedCategories, usedWords);
        setWords(newWords);
        setRefreshKey(prev => prev + 1);

        // Clear the sentence for the new round
        setSentence('');
    };

    const handleSend = useCallback(() => {
        // Save current words with sentence
        addEntry(words, sentence);
        setSentence('');
        Keyboard.dismiss();
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