import { useMutation } from '@tanstack/react-query';
import { atelierApi } from '@/features/atelier/api/atelierApi';
import type { GenerateTextRequest, GenerateImageRequest } from '@/features/atelier/types/atelier.types';

export const useGenerateFromText = () => {
  return useMutation({
    mutationFn: (req: GenerateTextRequest) => atelierApi.generateFromText(req),
  });
};

export const useGenerateFromImage = () => {
  return useMutation({
    mutationFn: (req: GenerateImageRequest) => atelierApi.generateFromImage(req),
  });
};
