import { httpClient } from '@/services/httpClient';
import type { PagedList } from '@/types/pagination';
import type {
  CreateSupportTicketDto,
  SupportTicket,
  SupportTicketParams,
  UpdateSupportTicketDto,
} from '@/features/support/types/support.types';

type PaginationHeader = {
  TotalCount: number;
  PageSize: number;
  CurrentPage: number;
  TotalPages: number;
};

export const supportApi = {
  getTickets: async (params: SupportTicketParams = {}): Promise<PagedList<SupportTicket>> => {
    const response = await httpClient.get('/support/my', { params });

    // El endpoint puede devolver array+header (como /product) o body paginado (como OpenAPI spec)
    if (Array.isArray(response.data)) {
      let header: PaginationHeader | null = null;
      try {
        const raw = response.headers['pagination'] as string | undefined;
        if (raw) header = JSON.parse(raw);
      } catch (e) {
        console.warn('Failed to parse pagination header', e);
      }
      return {
        items: response.data as SupportTicket[],
        currentPage: header?.CurrentPage ?? 1,
        totalPages: header?.TotalPages ?? 1,
        pageSize: header?.PageSize ?? (response.data as SupportTicket[]).length,
        totalCount: header?.TotalCount ?? (response.data as SupportTicket[]).length,
      };
    }

    const data = response.data as Partial<PagedList<SupportTicket>> & { pageNumber?: number };
    return {
      items: data.items ?? [],
      currentPage: data.currentPage ?? data.pageNumber ?? 1,
      totalPages: data.totalPages ?? 1,
      pageSize: data.pageSize ?? data.items?.length ?? 0,
      totalCount: data.totalCount ?? data.items?.length ?? 0,
    };
  },

  getTicket: async (id: string) => {
    const response = await httpClient.get<SupportTicket>(`/support/${id}`);
    return response.data;
  },

  createTicket: async (dto: CreateSupportTicketDto) => {
    const response = await httpClient.post<string>('/support', dto);
    return response.data;
  },

  updateTicket: async (id: string, dto: UpdateSupportTicketDto) => {
    const response = await httpClient.put(`/support/${id}`, dto);
    return response.data;
  },

  deleteTicket: async (id: string) => {
    const response = await httpClient.delete(`/support/${id}`);
    return response.data;
  },
};
