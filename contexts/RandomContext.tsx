import React, { createContext, useContext, useState } from 'react';

type RandomContextType = {
  triggerRandom: () => void;
  randomTrigger: number;
  // True while the AI feedback view is up — both the wait and the answer.
  // Lives here because the tab bar is rendered by the layout, not by the screen
  // that knows: the feedback view carries its own actions, and the dice behind
  // it either abandoned the request mid-flight or just read as ambiguous.
  feedbackOpen: boolean;
  setFeedbackOpen: (open: boolean) => void;
};

const RandomContext = createContext<RandomContextType | undefined>(undefined);

export function RandomProvider({ children }: { children: React.ReactNode }) {
  const [randomTrigger, setRandomTrigger] = useState(0);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const triggerRandom = () => {
    setRandomTrigger(prev => prev + 1);
  };

  return (
    <RandomContext.Provider value={{ triggerRandom, randomTrigger, feedbackOpen, setFeedbackOpen }}>
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