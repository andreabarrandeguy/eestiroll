// utils/wordData.ts - MINIMAL FALLBACK
import { CategoryColors } from '@/constants/Colors';
import { WordTranslations } from '@/types';

export const categories = ['VERB', 'NOUN', 'ADJECTIVE', 'PLACE', 'ADVERB', 'TIME', 'CONNECTOR', 'QUESTION', 'PRONOUN'] as const;

export type Category = typeof categories[number];

// Fallback mínimo - solo 2 palabras por categoría
export const allWords: Record<Category, WordTranslations[]> = {
    VERB: [
        { et: 'olema', es: 'ser/estar', en: 'to be', ru: 'быть' },
        { et: 'tegema', es: 'hacer', en: 'to do', ru: 'делать' },
    ],
    NOUN: [
        { et: 'kodu', es: 'casa', en: 'home', ru: 'дом' },
        { et: 'vesi', es: 'agua', en: 'water', ru: 'вода' },
    ],
    ADJECTIVE: [
        { et: 'suur', es: 'grande', en: 'big', ru: 'большой' },
        { et: 'hea', es: 'bueno', en: 'good', ru: 'хороший' },
    ],
    PLACE: [
        { et: 'Tallinn', es: 'Tallin', en: 'Tallinn', ru: 'Таллин' },
        { et: 'kool', es: 'escuela', en: 'school', ru: 'школа' },
    ],
    ADVERB: [
        { et: 'hästi', es: 'bien', en: 'well', ru: 'хорошо' },
        { et: 'praegu', es: 'ahora', en: 'now', ru: 'сейчас' },
    ],
    TIME: [
        { et: 'täna', es: 'hoy', en: 'today', ru: 'сегодня' },
        { et: 'homme', es: 'mañana', en: 'tomorrow', ru: 'завтра' },
    ],
    CONNECTOR: [
        { et: 'ja', es: 'y', en: 'and', ru: 'и' },
        { et: 'aga', es: 'pero', en: 'but', ru: 'но' },
    ],
    QUESTION: [
        { et: 'mis', es: 'qué', en: 'what', ru: 'что' },
        { et: 'kuidas', es: 'cómo', en: 'how', ru: 'как' },
    ],
    PRONOUN: [
        { et: 'mina', es: 'yo', en: 'I', ru: 'я' },
        { et: 'sina', es: 'tú', en: 'you', ru: 'ты' },
    ],
};

export const categoryColorMap: Record<Category, string> = {
    VERB: CategoryColors.yellow,
    NOUN: CategoryColors.lightgreen,
    ADJECTIVE: CategoryColors.lightpurple,
    PLACE: CategoryColors.blue,
    ADVERB: CategoryColors.red,
    TIME: CategoryColors.lightpink,
    CONNECTOR: CategoryColors.pink,
    QUESTION: CategoryColors.green,
    PRONOUN: CategoryColors.lightblue,
};