import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import { mutationKeys, queryKeys } from "../queryKeys";
import type {
  CreateSupportTicket,
  SupportTicket,
  SupportTicketParams,
} from "../types/support";
import type { PagedList } from "../types/pagination";

/**
 * Hook for fetching paginated support tickets
 */
export const useTickets = (params: SupportTicketParams = {}) => {
  return useQuery({
    queryKey: queryKeys.tickets.list(params),
    queryFn: async () => {
      const response = await agent.get<PagedList<SupportTicket>>("/support/my", { params });
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook for fetching a single support ticket by ID
 */
export const useTicket = (id: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.tickets.detail(id!),
    queryFn: async () => {
      const response = await agent.get<SupportTicket>(`/support/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook for creating a new support ticket
 */
export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.tickets.create,
    mutationFn: async (dto: CreateSupportTicket) => {
      const response = await agent.post<CreateSupportTicket>("/support", dto);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
    onError: (error) => {
      console.error("Failed to create support ticket:", error);
    },
  });
};

/**
 * Composite hook that combines all support functionality
 * Maintains backward compatibility with existing code
 */
export const useSupport = (id?: string, params?: SupportTicketParams) => {
  const queryClient = useQueryClient();

  const { data: ticketsData, isLoading: isLoadingTickets } = useQuery({
    queryKey: queryKeys.tickets.list(params ?? {}),
    queryFn: async () => {
      const response = await agent.get<PagedList<SupportTicket>>("/support/my", { params });
      return response.data;
    },
    placeholderData: keepPreviousData,
    enabled: !id,
  });

  const { data: ticket, isLoading: isLoadingTicket } = useQuery({
    queryKey: queryKeys.tickets.detail(id!),
    queryFn: async () => {
      const response = await agent.get<SupportTicket>(`/support/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const createTicket = useMutation({
    mutationKey: mutationKeys.tickets.create,
    mutationFn: async (dto: CreateSupportTicket) => {
      const response = await agent.post<CreateSupportTicket>("/support", dto);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
    onError: (error) => {
      console.error("Failed to create support ticket:", error);
    },
  });

  return {
    ticketsData,
    isLoadingTickets,
    ticket,
    isLoadingTicket,
    createTicket,
  };
};
