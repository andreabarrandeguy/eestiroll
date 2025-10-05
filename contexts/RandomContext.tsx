import React, { createContext, useContext, useState } from 'react';

type RandomContextType = {
  triggerRandom: () => void;
  randomTrigger: number;
};

const RandomContext = createContext<RandomContextType | undefined>(undefined);

export function RandomProvider({ children }: { children: React.ReactNode }) {
  const [randomTrigger, setRandomTrigger] = useState(0);

  const triggerRandom = () => {
    setRandomTrigger(prev => prev + 1);
  };

  return (
    <RandomContext.Provider value={{ triggerRandom, randomTrigger }}>
      {children}
    </RandomContext.Provider>
  );
}

export function useRandom() {
  const context = useContext(RandomContext);
  if (!context) {
    throw new Error('useRandom must be used within RandomProvider');
  }
  return context;
}