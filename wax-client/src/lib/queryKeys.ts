import type { OrderParams } from "./types/order";
import type { ProductParams } from "./types/product";
import type { SupportTicketParams } from "./types/support";

/**
 * Centralized Query Key Factory
 * 
 * This pattern provides:
 * - Type-safe query keys
 * - Hierarchical invalidation (invalidate all products, or just a specific product)
 * - Single source of truth for cache keys
 * - Better IDE autocomplete and refactoring support
 * 
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
 */
export const queryKeys = {
  // Products
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
    list: (params: ProductParams) => [...queryKeys.products.lists(), params] as const,
    details: () => [...queryKeys.products.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },

  // Basket
  basket: {
    all: ["basket"] as const,
  },

  // Orders
  orders: {
    all: ["orders"] as const,
    lists: () => [...queryKeys.orders.all, "list"] as const,
    list: (params: OrderParams) => [...queryKeys.orders.lists(), params] as const,
    details: () => [...queryKeys.orders.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },

  // Support Tickets
  tickets: {
    all: ["tickets"] as const,
    lists: () => [...queryKeys.tickets.all, "list"] as const,
    list: (params: SupportTicketParams) => [...queryKeys.tickets.lists(), params] as const,
    details: () => [...queryKeys.tickets.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.tickets.details(), id] as const,
  },

  // User Account
  user: {
    all: ["user"] as const,
    current: () => [...queryKeys.user.all, "current"] as const,
    address: () => [...queryKeys.user.all, "address"] as const,
  },

  // Custom Products (cotizaciones)
  customProducts: {
    all: ["customProducts"] as const,
    lists: () => [...queryKeys.customProducts.all, "list"] as const,
    list: () => [...queryKeys.customProducts.lists(), "mine"] as const,
    details: () => [...queryKeys.customProducts.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.customProducts.details(), id] as const,
  },
} as const;

/**
 * Mutation Key Factory
 * 
 * Useful for:
 * - Setting mutation defaults with queryClient.setMutationDefaults
 * - Debugging mutations in DevTools
 * - Filtering mutations with useMutationState
 */
export const mutationKeys = {
  products: {
    create: ["products", "create"] as const,
    update: ["products", "update"] as const,
    delete: ["products", "delete"] as const,
  },
  basket: {
    addItem: ["basket", "add"] as const,
    removeItem: ["basket", "remove"] as const,
    clearBasket: ["basket", "clear"] as const,
  },
  orders: {
    create: ["orders", "create"] as const,
  },
  tickets: {
    create: ["tickets", "create"] as const,
  },
  user: {
    login: ["user", "login"] as const,
    register: ["user", "register"] as const,
    logout: ["user", "logout"] as const,
    saveAddress: ["user", "saveAddress"] as const,
  },
  checkout: {
    createPaymentIntent: ["checkout", "paymentIntent"] as const,
  },
  customProducts: {
    counterOffer: ["customProducts", "counterOffer"] as const,
    approve: ["customProducts", "approve"] as const,
  },
} as const;
