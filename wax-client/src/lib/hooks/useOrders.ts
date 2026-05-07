import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import agent from "../api/agent";
import { mutationKeys, queryKeys } from "../queryKeys";
import type { CreateOrder, Order, OrderParams } from "../types/order";
import type { InfinityPagedList } from "../types/pagination";

/**
 * Hook for fetching paginated orders with infinite scroll
 */
export const useOrdersInfinite = (params: OrderParams = {}) => {
  const { filter, startDate } = params;

  return useInfiniteQuery<InfinityPagedList<Order, string | null>>({
    queryKey: queryKeys.orders.list(params),
    queryFn: async ({ pageParam }) => {
      const response = await agent.get("/order/my", {
        params: {
          cursor: pageParam,
          filter,
          startDate,
        },
      });
      if (Array.isArray(response.data)) {
        return { items: response.data, nextCursor: null };
      }
      return response.data as InfinityPagedList<Order, string | null>;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
};

/**
 * Hook for fetching a single order by ID
 */
export const useOrder = (id: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.orders.detail(id!),
    queryFn: async () => {
      const response = await agent.get<Order>(`/order/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook for creating a new order
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.orders.create,
    mutationFn: async (orderData: CreateOrder) => {
      const response = await agent.post<Order>("/order", orderData);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
    onError: (error) => {
      console.error("Failed to create order:", error);
    },
  });
};

/**
 * Composite hook that combines all orders functionality
 * Maintains backward compatibility with existing code
 */
export const useOrders = (id?: string, params?: OrderParams) => {
  const queryClient = useQueryClient();
  const { filter, startDate } = params ?? {};

  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<InfinityPagedList<Order, string | null>>({
    queryKey: queryKeys.orders.list(params ?? {}),
    queryFn: async ({ pageParam }) => {
      const response = await agent.get("/order/my", {
        params: {
          cursor: pageParam,
          filter,
          startDate,
        },
      });
      if (Array.isArray(response.data)) {
        return { items: response.data, nextCursor: null } as InfinityPagedList<Order, string | null>;
      }
      return response.data as InfinityPagedList<Order, string | null>;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !id,
  });

  const { data: order, isLoading: isLoadingOrder } = useQuery({
    queryKey: queryKeys.orders.detail(id!),
    queryFn: async () => {
      const response = await agent.get<Order>(`/order/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const createOrder = useMutation({
    mutationKey: mutationKeys.orders.create,
    mutationFn: async (orderData: CreateOrder) => {
      const response = await agent.post<Order>("/order", orderData);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
    onError: (error) => {
      console.error("Failed to create order:", error);
    },
  });

  return {
    ordersData,
    isLoadingOrders,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    order,
    isLoadingOrder,
    createOrder,
  };
};
