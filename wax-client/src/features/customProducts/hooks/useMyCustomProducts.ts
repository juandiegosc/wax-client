import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { customProductApi } from '@/features/customProducts/api/customProductApi';

export const useMyCustomProducts = () => {
  return useQuery({
    queryKey: queryKeys.customProducts.list(),
    queryFn: () => customProductApi.getMine(),
  });
};
