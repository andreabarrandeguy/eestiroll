import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = '@selected_categories';

interface CategoryContextType {
  selectedCategories: string[];
  toggleCategory: (category: string) => void;
  isLoading: boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['PRONOUN', 'VERB', 'NOUN']); // ← Cambiar aquí
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSelectedCategories(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = async (category: string) => {
    setSelectedCategories(prev => {
      // Si es la única categoría seleccionada, no permitir deseleccionarla
      if (prev.length === 1 && prev.includes(category)) {
        return prev;
      }

      const newCategories = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      
      // Guardar en AsyncStorage
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newCategories));
      
      return newCategories;
    });
  };

  return (
    <CategoryContext.Provider value={{ selectedCategories, toggleCategory, isLoading }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within CategoryProvider');
  }
  return context;
}