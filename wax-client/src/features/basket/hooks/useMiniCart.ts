import { useContext } from 'react';
import { MiniCartContext, type MiniCartContextValue } from '@/features/basket/context/miniCartContext';

export const useMiniCart = (): MiniCartContextValue => {
  const ctx = useContext(MiniCartContext);
  if (!ctx) throw new Error('useMiniCart must be used within MiniCartProvider');
  return ctx;
};
