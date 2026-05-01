import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryKeys, mutationKeys } from '@/lib/queryKeys';
import { supportApi } from '@/features/support/api/supportApi';
import type { CreateSupportTicketDto } from '@/features/support/types/support.types';

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.tickets.create,
    mutationFn: (dto: CreateSupportTicketDto) => supportApi.createTicket(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      toast.success('Ticket de soporte enviado');
    },
    onError: () => {
      toast.error('No se pudo enviar el ticket');
    },
  });
};
