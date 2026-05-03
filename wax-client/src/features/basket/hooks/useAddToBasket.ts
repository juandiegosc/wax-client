import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryKeys, mutationKeys } from '@/lib/queryKeys';
import { basketApi } from '@/features/basket/api/basketApi';

export const useAddToBasket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.basket.addItem,
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      basketApi.addItem(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.basket.all });
      toast.success('Pieza añadida al carrito');
    },
    onError: () => {
      toast.error('No se pudo añadir al carrito');
    },
  });
};
