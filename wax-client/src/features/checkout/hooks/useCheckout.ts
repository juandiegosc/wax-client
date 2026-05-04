import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mutationKeys, queryKeys } from '@/lib/queryKeys';
import { checkoutApi } from '../api/checkoutApi';
import type { Basket } from '@/features/basket/types/basket.types';

export const useCreatePaymentIntent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.checkout.createPaymentIntent,
    mutationFn: checkoutApi.createPaymentIntent,
    // Note: Do not rely solely on this onSuccess if triggering on mount in React 18
    // Strict Mode, as the component might unmount and skip this callback.
    onSuccess: (updatedBasket) => {
      queryClient.setQueryData<Basket>(queryKeys.basket.all, updatedBasket);
    },
  });
};

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: checkoutApi.createOrder,
  });
};
