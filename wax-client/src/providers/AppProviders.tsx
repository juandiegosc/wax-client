import type { PropsWithChildren } from 'react';
import { ToastProvider } from '@/providers/ToastProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/services/queryClient';
import { MiniCartProvider } from '@/features/basket/context/MiniCartProvider';

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MiniCartProvider>{children}</MiniCartProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};