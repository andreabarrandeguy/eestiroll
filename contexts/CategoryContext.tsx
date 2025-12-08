import { fetchContent } from '@/services/api';
import { StorageService } from '@/services/storage';
import { CategoryContextType } from '@/types';
import { categories as fallbackCategories } from '@/utils/wordData';
import React, { createContext, useContext, useEffect, useState } from 'react';

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['PRONOUN', 'VERB', 'NOUN']);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

const loadContent = async () => {
  try {
    const content = await fetchContent();
    
    // Safe access with fallback
    const categoryList = content?.data?.categories?.map((c: any) => c.code) ?? fallbackCategories;
    setCategories(categoryList);
    
    // Load saved categories and validate they still exist
    const saved = await StorageService.loadCategories();
    if (saved && saved.length > 0) {
      // Filter out categories that no longer exist
      const validSaved = saved.filter(cat => categoryList.includes(cat));
      setSelectedCategories(validSaved.length > 0 ? validSaved : ['VERB', 'NOUN']);
    }
  } catch (error) {
    console.error('Error loading content, using fallback:', error);
    setCategories([...fallbackCategories]);
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