import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { basketApi } from '@/features/basket/api/basketApi';

export const useBasket = () => {
  return useQuery({
    queryKey: queryKeys.basket.all,
    queryFn: basketApi.getBasket,
  });
};
