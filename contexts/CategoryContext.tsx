import { fetchContent } from '@/services/api';
import { StorageService } from '@/services/storage';
import { CategoryContextType } from '@/types';
import { categories as fallbackCategories } from '@/utils/wordData';
import React, { createContext, useContext, useEffect, useState } from 'react';

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [categoryCount, setCategoryCountState] = useState(3);
  const [excludedCategories, setExcludedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const content = await fetchContent();
      const categoryList = content?.data?.categories?.map((c: any) => c.code) ?? fallbackCategories;
      setAllCategories(categoryList);
      
      // Load saved settings
      const savedCount = await StorageService.loadCategoryCount();
      const savedExcluded = await StorageService.loadExcludedCategories();
      
      // Validate saved count doesn't exceed available categories
      const maxCount = categoryList.length - savedExcluded.length;
      setCategoryCountState(Math.min(savedCount, maxCount));
      setExcludedCategories(savedExcluded.filter((cat: string) => categoryList.includes(cat)));
    } catch (error) {
      console.error('Error loading content, using fallback:', error);
      setAllCategories([...fallbackCategories]);
    } finally {
      setIsLoading(false);
    }
  };

  const availableCategories = allCategories.filter(cat => !excludedCategories.includes(cat));
  const maxExclusions = allCategories.length - categoryCount;

  const setCategoryCount = async (count: number) => {
    const validCount = Math.max(1, Math.min(count, availableCategories.length));
    setCategoryCountState(validCount);
    await StorageService.saveCategoryCount(validCount);
  };

  const toggleExcluded = async (category: string) => {
    let newExcluded: string[];
    
    if (excludedCategories.includes(category)) {
      // Remove from excluded
      newExcluded = excludedCategories.filter(c => c !== category);
    } else {
      // Add to excluded (if allowed)
      if (excludedCategories.length >= maxExclusions) {
        return; // Can't exclude more
      }
      newExcluded = [...excludedCategories, category];
    }
    
    setExcludedCategories(newExcluded);
    await StorageService.saveExcludedCategories(newExcluded);
    
    // Adjust count if necessary
    const newAvailable = allCategories.length - newExcluded.length;
    if (categoryCount > newAvailable) {
      setCategoryCount(newAvailable);
    }
  };

  return (
    <CategoryContext.Provider value={{ 
      categoryCount, 
      excludedCategories, 
      setCategoryCount, 
      toggleExcluded,
      availableCategories,
      maxExclusions,
      isLoading 
    }}>
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