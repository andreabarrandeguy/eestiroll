import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationKey, translations } from '@/utils/translations';

export function useTranslations() {
    const { language } = useLanguage();

    const t = (key: TranslationKey): string => {
        return translations[language][key] || translations.en[key];
    };

    return { t, language };
}