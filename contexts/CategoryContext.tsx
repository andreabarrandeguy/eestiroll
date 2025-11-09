import { StorageService } from '@/services/storage';
import { CategoryContextType } from '@/types';
import React, { createContext, useContext, useEffect, useState } from 'react';

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['PRONOUN', 'VERB', 'NOUN']);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const saved = await StorageService.loadCategories();
      if (saved) {
        setSelectedCategories(saved);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = async (category: string) => {
    setSelectedCategories(prev => {
      // If it's the only selected category, don't allow deselecting it
      if (prev.length === 1 && prev.includes(category)) {
        return prev;
      }

      const newCategories = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      
      // Save to storage using service
      StorageService.saveCategories(newCategories);
      
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