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

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [availableLanguages, setAvailableLanguages] = useState<LanguageOption[]>([]);
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const content = await fetchContent();
      
      // Mapear languages desde la API
      const languages = content.data.languages.map((l: any) => ({
        code: l.code,
        name: l.name,
        nativeName: l.native_name
      }));
      
      setAvailableLanguages(languages);
      
      // Cargar idioma guardado
      const saved = await StorageService.loadLanguage();
      if (saved) {
        setLanguageState(saved);
      }
    } catch (error) {
      console.error('Error loading languages, using fallback:', error);
      // Usar fallback hardcodeado
      setAvailableLanguages(AVAILABLE_LANGUAGES);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    setLanguageState(newLanguage);
    
    try {
      await StorageService.saveLanguage(newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const currentLanguageOption = availableLanguages.find(l => l.code === language) || availableLanguages[0];

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