import { useMutation } from '@tanstack/react-query';
import { atelierApi } from '@/features/atelier/api/atelierApi';
import type { ChatRequest } from '@/features/atelier/types/atelier.types';

export const useChat = () => {
  return useMutation({
    mutationFn: (req: ChatRequest) => atelierApi.chat(req),
  });
};
