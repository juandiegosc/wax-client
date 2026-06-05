import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryKeys, mutationKeys } from '@/lib/queryKeys';
import { basketApi } from '@/features/basket/api/basketApi';
import { useMiniCart } from '@/features/basket/context/miniCartContext';

export const useAddToBasket = () => {
  const queryClient = useQueryClient();
  const { open: openMiniCart } = useMiniCart();

  return useMutation({
    mutationKey: mutationKeys.basket.addItem,
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      basketApi.addItem(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.basket.all });
      toast.success('Pieza añadida al carrito');
      openMiniCart();
    },
    onError: () => {
      toast.error('No se pudo añadir al carrito');
    },
  });
};
