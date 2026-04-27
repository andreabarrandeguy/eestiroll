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
        vocabularyLevel: 'Vocabulary Level',
        levelHintA1: 'Showing beginner words only (A1)',
        levelHintA2: 'Showing beginner + elementary words (A1 & A2)',

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

        // AI
        yourSentence: 'Your sentence',
        dailyLimitReached: 'Daily corrections limit reached.',
        checkLeft: 'correction left',
        checksLeft: 'corrections left',
        savedToHistory: 'Answer saved to History.',
        getFeedback: 'Get feedback',
        continueLearning: 'Continue learning',
        correction: 'Corrected sentence',
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
        vocabularyLevel: 'Nivel de vocabulario',
        levelHintA1: 'Mostrando solo palabras para principiantes (A1)',
        levelHintA2: 'Mostrando palabras principiante + elemental (A1 y A2)',

        // History actions
        deleteEntry: 'Eliminar entrada',
        deleteConfirmation: '¿Estás seguro de que quieres eliminar esta entrada?',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        addNote: 'Agregar nota...',
        note: 'Nota',
        copied: 'Copiado',
        select: 'Seleccionar',
        selectAll: 'Seleccionar todo',
        deselectAll: 'Deseleccionar todo',
        deleteSelected: 'Eliminar seleccionados',
        deleteSelectedConfirmation: '¿Estás seguro de que quieres eliminar {count} entradas?',

        // AI
        yourSentence: 'Tu oracion',
        dailyLimitReached: 'Límite diario de correcciones alcanzado.',
        checkLeft: 'consulta restante',
        checksLeft: 'consultas restantes',
        savedToHistory: 'Respuesta guardada en Historial.',
        getFeedback: 'Corregir',
        continueLearning: 'Continuar aprendiendo',
        correction: 'Corrección',
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
        vocabularyLevel: 'Уровень словарного запаса',
        levelHintA1: 'Только слова для начинающих (A1)',
        levelHintA2: 'Слова начального уровня (A1 и A2)',

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

        // AI
        yourSentence: 'Ваше предложение',
        dailyLimitReached: 'Достигнут суточный лимит корректировок.',
        checkLeft: 'оставшаяся поправка',
        checksLeft: 'оставшиеся исправления',
        savedToHistory: 'Ответ сохранен в истории.',
        getFeedback: 'Коррексьон',
        continueLearning: 'Продолжайте обучение',
        correction: 'Исправленное предложение',
    },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function getTranslation(language: Language, key: TranslationKey): string {
    return translations[language][key] || translations.en[key];
}