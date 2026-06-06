import { useMemo, useState, type PropsWithChildren } from 'react';
import { MiniCartContext, type MiniCartContextValue } from '@/features/basket/context/miniCartContext';

export const MiniCartProvider = ({ children }: PropsWithChildren) => {
  const [isOpen, setIsOpen] = useState(false);
  const value = useMemo<MiniCartContextValue>(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [isOpen],
  );
  return <MiniCartContext.Provider value={value}>{children}</MiniCartContext.Provider>;
};
