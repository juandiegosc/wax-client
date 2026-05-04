import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import Cookies from "js-cookie";
import { mutationKeys, queryKeys } from "../queryKeys";
import type { Basket } from "../types/basket";

/**
 * Hook for fetching the current basket
 */
export const useBasketQuery = () => {
  return useQuery({
    queryKey: queryKeys.basket.all,
    queryFn: async () => {
      const response = await agent.get<Basket>("/basket");
      return response.data;
    },
  });
};

/**
 * Hook for adding an item to the basket with optimistic updates
 */
export const useAddToBasket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.basket.addItem,
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const response = await agent.post<Basket>(
        `/basket?productId=${productId}&quantity=${quantity}`
      );
      return response.data;
    },
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.basket.all });

      const prevBasket = queryClient.getQueryData<Basket>(queryKeys.basket.all);

      // If no basket exists yet, skip optimistic update — server will create it
      if (!prevBasket?.basketId) return { prevBasket };

      queryClient.setQueryData<Basket>(queryKeys.basket.all, (old) => {
        if (!old) return old;
        const existingItem = old.items.find((item) => item.productId === productId);
        return {
          ...old,
          items: existingItem
            ? old.items.map((item) =>
                item.productId === productId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            : [
                ...old.items,
                {
                  productId,
                  name: "",
                  price: 0,
                  pictureUrl: "",
                  brand: "",
                  type: "",
                  quantity,
                },
              ],
        };
      });

      return { prevBasket };
    },
    onError: (_error, _vars, context) => {
      if (context?.prevBasket !== undefined) {
        queryClient.setQueryData(queryKeys.basket.all, context.prevBasket);
      }
      console.error("Failed to add item to basket:", _error);
    },
    onSuccess: (newBasket, _vars, context) => {
      // If it was a new basket, replace optimistic data with real server response
      if (!context?.prevBasket?.basketId) {
        queryClient.setQueryData(queryKeys.basket.all, newBasket);
      }
    },
  });
};

/**
 * Hook for removing an item from the basket with optimistic updates
 */
export const useRemoveFromBasket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.basket.removeItem,
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      await agent.delete(`/basket?productId=${productId}&quantity=${quantity}`);
    },
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.basket.all });

      const prevBasket = queryClient.getQueryData<Basket>(queryKeys.basket.all);

      queryClient.setQueryData<Basket>(queryKeys.basket.all, (old) => {
        if (!old) return old;
        const itemIndex = old.items.findIndex((item) => item.productId === productId);
        if (itemIndex < 0) return old;

        const updatedItems = [...old.items];
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          quantity: updatedItems[itemIndex].quantity - quantity,
        };

        return {
          ...old,
          items:
            updatedItems[itemIndex].quantity <= 0
              ? updatedItems.filter((item) => item.productId !== productId)
              : updatedItems,
        };
      });

      return { prevBasket };
    },
    onError: (_error, _vars, context) => {
      if (context?.prevBasket !== undefined) {
        queryClient.setQueryData(queryKeys.basket.all, context.prevBasket);
      }
      console.error("Failed to remove item from basket:", _error);
    },
  });
};

/**
 * Hook for clearing the basket
 */
export const useClearBasket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.basket.clearBasket,
    mutationFn: async () => {
      return { data: undefined };
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.basket.all });
    },
    onSuccess: () => {
      queryClient.setQueryData<Basket | null>(queryKeys.basket.all, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: [],
          basketId: "",
        };
      });
      Cookies.remove("basketId");
    },
  });
};

/**
 * Composite hook that combines all basket functionality
 * Maintains backward compatibility with existing code
 */
export const useBasket = () => {
  const queryClient = useQueryClient();

  const { data: basket, isLoading: isLoadingBasket } = useQuery({
    queryKey: queryKeys.basket.all,
    queryFn: async () => {
      const response = await agent.get<Basket>("/basket");
      return response.data;
    },
  });

  const addItem = useMutation({
    mutationKey: mutationKeys.basket.addItem,
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      const response = await agent.post<Basket>(
        `/basket?productId=${productId}&quantity=${quantity}`
      );
      return response.data;
    },
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.basket.all });

      const prevBasket = queryClient.getQueryData<Basket>(queryKeys.basket.all);

      // If no basket exists yet, skip optimistic update — server will create it
      if (!prevBasket?.basketId) return { prevBasket };

      queryClient.setQueryData<Basket>(queryKeys.basket.all, (old) => {
        if (!old) return old;
        const existingItem = old.items.find(
          (item) => item.productId === productId
        );
        return {
          ...old,
          items: existingItem
            ? old.items.map((item) =>
                item.productId === productId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            : [
                ...old.items,
                {
                  productId,
                  name: "",
                  price: 0,
                  pictureUrl: "",
                  brand: "",
                  type: "",
                  quantity,
                },
              ],
        };
      });

      return { prevBasket };
    },
    onError: (_error, _vars, context) => {
      if (context?.prevBasket !== undefined) {
        queryClient.setQueryData(queryKeys.basket.all, context.prevBasket);
      }
      console.error("Failed to add item to basket:", _error);
    },
    onSuccess: (newBasket, _vars, context) => {
      // If it was a new basket, replace optimistic data with real server response
      if (!context?.prevBasket?.basketId) {
        queryClient.setQueryData(queryKeys.basket.all, newBasket);
      }
    },
  });

  const removeItem = useMutation({
    mutationKey: mutationKeys.basket.removeItem,
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      await agent.delete(`/basket?productId=${productId}&quantity=${quantity}`);
    },
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.basket.all });

      const prevBasket = queryClient.getQueryData<Basket>(queryKeys.basket.all);

      queryClient.setQueryData<Basket>(queryKeys.basket.all, (old) => {
        if (!old) return old;
        const itemIndex = old.items.findIndex(
          (item) => item.productId === productId
        );
        if (itemIndex < 0) return old;

        const updatedItems = [...old.items];
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          quantity: updatedItems[itemIndex].quantity - quantity,
        };

        return {
          ...old,
          items:
            updatedItems[itemIndex].quantity <= 0
              ? updatedItems.filter((item) => item.productId !== productId)
              : updatedItems,
        };
      });

      return { prevBasket };
    },
    onError: (_error, _vars, context) => {
      if (context?.prevBasket !== undefined) {
        queryClient.setQueryData(queryKeys.basket.all, context.prevBasket);
      }
      console.error("Failed to remove item from basket:", _error);
    },
  });

  const clearBasket = useMutation({
    mutationKey: mutationKeys.basket.clearBasket,
    mutationFn: async () => {
      // In a real application, you might want to optionally call an endpoint here
      // return await agent.delete("/basket"); 
      return { data: undefined };
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.basket.all });
    },
    onSuccess: () => {
      queryClient.setQueryData<Basket | null>(queryKeys.basket.all, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: [],
          basketId: "",
        };
      });
      // Optionally remove cookie logic depending on how auth/cookies are maintained
      Cookies.remove("basketId");
    },
  });

  return {
    basket,
    isLoadingBasket,
    addItem,
    removeItem,
    clearBasket,
  };
};
