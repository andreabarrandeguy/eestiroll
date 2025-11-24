import { Language } from '@/types';

export const translations = {
    en: {
        // Categories
        VERB: 'Verb',
        NOUN: 'Noun',
        ADJECTIVE: 'Adjective',
        PLACE: 'Place',
        ADVERB: 'Adverb',
        TIME: 'Time',
        CONNECTOR: 'Connector',
        QUESTION: 'Question',
        PRONOUN: 'Pronoun',

        // Screens
        randomize: 'Randomize',
        configuration: 'Configuration',
        categories: 'Categories',
        history: 'History',
        language: 'Language',

        // Actions
        enterSentence: 'Enter your sentence...',
        darkMode: 'Dark Mode',
        translation: 'Translation',

        // Messages
        noCategoriesSelected: 'NB!',
        customizeCategories: 'Customize categories in',
        noHistoryYet: 'No history yet',
        loading: 'Loading...',
    },
    es: {
        // Categories
        VERB: 'Verbo',
        NOUN: 'Sustantivo',
        ADJECTIVE: 'Adjetivo',
        PLACE: 'Lugar',
        ADVERB: 'Adverbio',
        TIME: 'Tiempo',
        CONNECTOR: 'Conector',
        QUESTION: 'Pregunta',
        PRONOUN: 'Pronombre',

        // Screens
        randomize: 'Aleatorizar',
        configuration: 'Configuración',
        categories: 'Categorías',
        history: 'Historial',
        language: 'Idioma',

        // Actions
        enterSentence: 'Escribe tu oración...',
        darkMode: 'Modo Oscuro',
        translation: 'Traducción',

        // Messages
        noCategoriesSelected: '¡NB!',
        customizeCategories: 'Personaliza categorías en',
        noHistoryYet: 'Sin historial aún',
        loading: 'Cargando...',
    },
    ru: {
        // Categories
        VERB: 'Глагол',
        NOUN: 'Существительное',
        ADJECTIVE: 'Прилагательное',
        PLACE: 'Место',
        ADVERB: 'Наречие',
        TIME: 'Время',
        CONNECTOR: 'Союз',
        QUESTION: 'Вопрос',
        PRONOUN: 'Местоимение',

        // Screens
        randomize: 'Рандомизировать',
        configuration: 'Настройки',
        categories: 'Категории',
        history: 'История',
        language: 'Язык',

        // Actions
        enterSentence: 'Введите предложение...',
        darkMode: 'Тёмная тема',
        translation: 'Перевод',

        // Messages
        noCategoriesSelected: 'Внимание!',
        customizeCategories: 'Настройте категории в',
        noHistoryYet: 'История пуста',
        loading: 'Загрузка...',
    },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function getTranslation(language: Language, key: TranslationKey): string {
    return translations[language][key] || translations.en[key];
}