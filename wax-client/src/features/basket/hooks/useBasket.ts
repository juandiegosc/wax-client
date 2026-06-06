import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { queryKeys } from '@/lib/queryKeys';
import { basketApi } from '@/features/basket/api/basketApi';
import type { Basket } from '@/features/basket/types/basket.types';

const EMPTY_BASKET: Basket = { basketId: '', items: [] };

export const useBasket = (enabled = true) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.basket.all,
    queryFn: async () => {
      let basket: Basket;
      try {
        basket = await basketApi.getBasket();
      } catch (e) {
        // Backend retorna 400/404 cuando el carrito esta vacio: lo tratamos
        // como exito con basket vacio para que la UI muestre el empty state
        // y el badge del header se actualice correctamente.
        if (isAxiosError(e) && (e.response?.status === 400 || e.response?.status === 404)) {
          return EMPTY_BASKET;
        }
        throw e;
      }
      const cached = queryClient.getQueryData<Basket>(queryKeys.basket.all);
      // GET /basket never returns clientSecret — only POST /payment does.
      // Preserve it from the previous cache so background refetches don't wipe it.
      if (!basket.clientSecret && cached?.clientSecret) {
        return {
          ...basket,
          clientSecret: cached.clientSecret,
          paymentIntentId: cached.paymentIntentId,
        };
      }
      return basket;
    },
    enabled,
    retry: false,
  });
};
