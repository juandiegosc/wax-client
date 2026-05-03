import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, mutationKeys } from '@/lib/queryKeys';
import { basketApi } from '@/features/basket/api/basketApi';

export const useRemoveFromBasket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.basket.removeItem,
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      basketApi.removeItem(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.basket.all });
    },
  });
};
