import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { customProductApi } from '@/features/customProducts/api/customProductApi';

export const useCustomProduct = (id: string) => {
  return useQuery({
    queryKey: queryKeys.customProducts.detail(id),
    queryFn: () => customProductApi.getById(id),
    enabled: Boolean(id),
  });
};
