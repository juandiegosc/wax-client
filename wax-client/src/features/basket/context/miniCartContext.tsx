import { createContext, useContext, useState, type PropsWithChildren } from 'react';

type MiniCartContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const MiniCartContext = createContext<MiniCartContextValue | null>(null);

export const MiniCartProvider = ({ children }: PropsWithChildren) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <MiniCartContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </MiniCartContext.Provider>
  );
};

export const useMiniCart = (): MiniCartContextValue => {
  const ctx = useContext(MiniCartContext);
  if (!ctx) throw new Error('useMiniCart must be used within MiniCartProvider');
  return ctx;
};
