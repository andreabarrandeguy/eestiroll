import { allWords, categories } from './wordData';

export function getRandomWords(
    selectedCategories?: string[],
    usedWords: string[] = []
) {
    const categoriesToUse = selectedCategories && selectedCategories.length > 0
        ? selectedCategories
        : categories;

    return categoriesToUse.map(cat => {
        const wordList = allWords[cat];

        // Filter out already used words
        const availableWords = wordList.filter(word => !usedWords.includes(word));

        // If all words have been used, use the complete list
        const finalList = availableWords.length > 0 ? availableWords : wordList;

        const randomIndex = Math.floor(Math.random() * finalList.length);

        return {
            word: finalList[randomIndex],
            category: cat
        };
    });
}