import { useInfiniteQuery } from '@tanstack/react-query';
import agent from '@/lib/api/agent';
import { queryKeys } from '@/lib/queryKeys';
import type { Order, OrderParams } from '@/lib/types/order';
import type { InfinityPagedList } from '@/lib/types/pagination';

type OrdersInfinitePage = InfinityPagedList<Order, string | null>;

export const useOrders = (params: OrderParams = {}) => {
  const { filter, startDate } = params;

  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<OrdersInfinitePage>({
    queryKey: queryKeys.orders.list(params),
    queryFn: async ({ pageParam }) => {
      const response = await agent.get('/order/my', {
        params: { cursor: pageParam, filter, startDate },
      });
      if (Array.isArray(response.data)) {
        return { items: response.data, nextCursor: null } as OrdersInfinitePage;
      }
      return response.data as OrdersInfinitePage;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  return { ordersData, isLoadingOrders, isFetchingNextPage, fetchNextPage, hasNextPage };
};
