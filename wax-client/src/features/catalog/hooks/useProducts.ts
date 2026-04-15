import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/features/catalog/api/catalogApi';
import type { ProductParams } from '@/features/catalog/types/catalog.types';

export const catalogKeys = {
  all: ['catalog'] as const,
  lists: () => [...catalogKeys.all, 'list'] as const,
  list: (params: ProductParams) => [...catalogKeys.lists(), params] as const,
  details: () => [...catalogKeys.all, 'detail'] as const,
  detail: (id: string) => [...catalogKeys.details(), id] as const,
};

export const useProducts = (params: ProductParams = {}) => {
  return useQuery({
    queryKey: catalogKeys.list(params),
    queryFn: () => catalogApi.getProducts(params),
    placeholderData: keepPreviousData,
  });
};