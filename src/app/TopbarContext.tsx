// src/context/TopbarContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TopbarContextType {
  title: string;
  setTitle: (title: string) => void;
  isHidden: boolean;
  setIsHidden: (hidden: boolean) => void;
}

const TopbarContext = createContext<TopbarContextType | undefined>(undefined);

export const TopbarProvider = ({ children }: { children: ReactNode }) => {
  const [title, setTitle] = useState('');
  const [isHidden, setIsHidden] = useState(false);

  return (
    <TopbarContext.Provider value={{ title, setTitle, isHidden, setIsHidden }}>
      {children}
    </TopbarContext.Provider>
  );
};

export const useTopbar = (): TopbarContextType => {
  const context = useContext(TopbarContext);
  if (!context) {
    throw new Error('useTopbar must be used within a TopbarProvider');
  }
  return context;
};
