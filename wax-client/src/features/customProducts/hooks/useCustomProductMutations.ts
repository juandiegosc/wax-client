import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryKeys, mutationKeys } from '@/lib/queryKeys';
import { customProductApi } from '@/features/customProducts/api/customProductApi';
import type { ProposeAmountDto } from '@/features/customProducts/types/customProduct.types';

export const useCounterOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.customProducts.counterOffer,
    mutationFn: (vars: ProposeAmountDto & { id: string }) => customProductApi.counterOffer(vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customProducts.all });
      toast.success('Tu contraoferta fue enviada a WAX');
    },
    onError: () => {
      toast.error('No se pudo enviar la contraoferta');
    },
  });
};

export const useApproveCustomProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.customProducts.approve,
    mutationFn: (id: string) => customProductApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customProducts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.basket.all });
      toast.success('¡Aceptaste la propuesta! La pieza se añadió a tu carrito.');
    },
    onError: () => {
      toast.error('No se pudo aceptar la propuesta');
    },
  });
};
