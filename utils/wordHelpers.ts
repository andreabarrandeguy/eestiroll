import { allWords, categories } from './wordData';

export function getRandomWords(selectedCategories?: string[]) {
    const categoriesToUse = selectedCategories && selectedCategories.length > 0
        ? selectedCategories
        : categories;

    return categoriesToUse.map(cat => {
        const wordList = allWords[cat];
        const randomIndex = Math.floor(Math.random() * wordList.length);

        return {
            word: wordList[randomIndex],
            category: cat
        };
    });
}