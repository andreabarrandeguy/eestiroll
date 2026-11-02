import { EVENTS, setLanguageSuperProperty, track } from '@/services/analytics';
import { Platform } from 'react-native';
import { fetchContent } from '@/services/api';
import { StorageService } from '@/services/storage';
import { Language, LanguageOption } from '@/types';
import React, { createContext, useContext, useEffect, useState } from 'react';

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
];

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  currentLanguageOption: LanguageOption;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// First visit only. The app ships in en/es/ru and a good share of its audience
// is in Estonia, where Russian is common — everyone used to land on English
// regardless, with the switch two taps deep behind an unlabelled gear.
function detectLanguage(): Language {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return 'en';
  const tags = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of tags) {
    const base = (tag || '').toLowerCase().split('-')[0];
    if (base === 'es' || base === 'ru') return base;
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [availableLanguages, setAvailableLanguages] = useState<LanguageOption[]>([]);
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  const loadContent = async () => {
    // Outside the try: a failed content fetch used to skip this entirely, so
    // the language the user had explicitly chosen was silently ignored.
    const saved = await StorageService.loadLanguage();
    const initial = saved ?? detectLanguage();
    setLanguageState(initial);
    setLanguageSuperProperty(initial);

    try {
      const content = await fetchContent();
      
      // Map languages from the API
      const languages = content.data.languages.map((l: any) => ({
        code: l.code,
        name: l.name,
        nativeName: l.native_name
      }));

      setAvailableLanguages(languages);
    } catch (error) {
      console.error('Error loading languages, using fallback:', error);
      // Use hardcoded fallback
      setAvailableLanguages(AVAILABLE_LANGUAGES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // One-time content fetch on mount, setting local state when it resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadContent();
  }, []);

  const setLanguage = async (newLanguage: Language) => {
    setLanguageState(newLanguage);
    setLanguageSuperProperty(newLanguage);
    track(EVENTS.LANGUAGE_CHANGED, { language: newLanguage });
    
    try {
      await StorageService.saveLanguage(newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  // availableLanguages starts empty and only fills in once loadContent()'s
  // fetch resolves — on a fresh/cold load (e.g. a backgrounded tab reloaded
  // by the OS) a screen can render before that happens. Falling back to the
  // hardcoded AVAILABLE_LANGUAGES list (instead of availableLanguages[0],
  // which is undefined on an empty array) keeps this always defined so
  // consumers like config.tsx reading `.nativeName` directly don't crash.
  const currentLanguageOption =
    availableLanguages.find(l => l.code === language) ||
    availableLanguages[0] ||
    AVAILABLE_LANGUAGES.find(l => l.code === language) ||
    AVAILABLE_LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, currentLanguageOption, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}