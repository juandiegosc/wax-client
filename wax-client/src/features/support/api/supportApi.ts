import { httpClient } from '@/services/httpClient';
import type { PagedList } from '@/types/pagination';
import type { CreateSupportTicketDto, SupportTicket, SupportTicketParams } from '@/features/support/types/support.types';

export const supportApi = {
  getTickets: async (params: SupportTicketParams = {}) => {
    const response = await httpClient.get<PagedList<SupportTicket>>('/support', { params });
    return response.data;
  },

  getTicket: async (id: string) => {
    const response = await httpClient.get<SupportTicket>(`/support/${id}`);
    return response.data;
  },

  createTicket: async (dto: CreateSupportTicketDto) => {
    const response = await httpClient.post<string>('/support', dto);
    return response.data;
  },
};
