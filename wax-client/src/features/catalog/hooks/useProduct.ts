import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/features/catalog/api/catalogApi';
import { catalogKeys } from '@/features/catalog/hooks/useProducts';

export const useProduct = (id: string | undefined) => {
  return useQuery({
    queryKey: catalogKeys.detail(id ?? ''),
    queryFn: () => catalogApi.getProduct(id ?? ''),
    enabled: Boolean(id),
  });
};