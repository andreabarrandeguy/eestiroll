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

        // Filter out already used words (comparing Estonian word)
        const availableWords = wordList.filter(wordObj => !usedWords.includes(wordObj.et));

        // If all words have been used, use the complete list
        const finalList = availableWords.length > 0 ? availableWords : wordList;

        const randomIndex = Math.floor(Math.random() * finalList.length);
        const selectedWord = finalList[randomIndex];

        return {
            word: selectedWord.et,  // Extract only the Estonian word for display
            category: cat
        };
    });
}