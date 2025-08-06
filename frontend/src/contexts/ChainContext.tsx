import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Chain {
  name: string;
  color: string;
  dotColor: string;
}

export const chains: Chain[] = [
  { name: "Midnight Protocol", color: "var(--nyx-success)", dotColor: "var(--nyx-success)" },
  { name: "Sui", color: "#4DA2FF", dotColor: "#4DA2FF" },
  { name: "Sei", color: "#DC2626", dotColor: "#DC2626" },
  { name: "Ethereum", color: "#8B5CF6", dotColor: "#8B5CF6" },
  { name: "Base", color: "#0052FF", dotColor: "#0052FF" },
];

interface ChainContextType {
  selectedChain: Chain;
  setSelectedChain: (chain: Chain) => void;
}

const ChainContext = createContext<ChainContextType | undefined>(undefined);

export const useChain = () => {
  const context = useContext(ChainContext);
  if (!context) {
    throw new Error('useChain must be used within a ChainProvider');
  }
  return context;
};

interface ChainProviderProps {
  children: ReactNode;
}

export const ChainProvider: React.FC<ChainProviderProps> = ({ children }) => {
  const [selectedChain, setSelectedChain] = useState<Chain>(
    chains[0] || { name: "Default", color: "#000", dotColor: "#000" }
  );

  return (
    <ChainContext.Provider value={{ selectedChain, setSelectedChain }}>
      {children}
    </ChainContext.Provider>
  );
};