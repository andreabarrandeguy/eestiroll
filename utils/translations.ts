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
        categoriesPerRound: 'Categories per round',
        minMax: 'min {min}, max {max}',
        excludeCategories: 'Exclude categories',
        maxExclusions: '{current}/{max} exclusions',

        // History actions
        deleteEntry: 'Delete Entry',
        deleteConfirmation: 'Are you sure you want to delete this entry?',
        cancel: 'Cancel',
        delete: 'Delete',
        addNote: 'Add note...',
        note: 'Note',
        copied: 'Copied',
        select: 'Select',
        selectAll: 'Select all',
        deselectAll: 'Deselect all',
        deleteSelected: 'Delete selected',
        deleteSelectedConfirmation: 'Are you sure you want to delete {count} entries?',
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
        categoriesPerRound: 'Categorías por ronda',
        minMax: 'mín {min}, máx {max}',
        excludeCategories: 'Excluir categorías',
        maxExclusions: '{current}/{max} exclusiones',

        // History actions
        deleteEntry: 'Eliminar entrada',
        deleteConfirmation: '¿Estás seguro de que quieres eliminar esta entrada?',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        addNote: 'Agregar nota...',
        note: 'Nota',
        copied: 'Copiado',
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
        categoriesPerRound: 'Категорий за раунд',
        minMax: 'мин {min}, макс {max}',
        excludeCategories: 'Исключить категории',
        maxExclusions: '{current}/{max} исключений',

        // History actions
        deleteEntry: 'Удалить запись',
        deleteConfirmation: 'Вы уверены, что хотите удалить эту запись?',
        cancel: 'Отмена',
        delete: 'Удалить',
        addNote: 'Добавить заметку...',
        note: 'Заметка',
        copied: 'Скопировано',
        select: 'Выбрать',
        selectAll: 'Выбрать все',
        deselectAll: 'Снять выделение',
        deleteSelected: 'Удалить выбранные',
        deleteSelectedConfirmation: 'Вы уверены, что хотите удалить {count} записей?',
    },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function getTranslation(language: Language, key: TranslationKey): string {
    return translations[language][key] || translations.en[key];
}