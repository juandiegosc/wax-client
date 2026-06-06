import { createContext } from 'react';

export type MiniCartContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const MiniCartContext = createContext<MiniCartContextValue | null>(null);
