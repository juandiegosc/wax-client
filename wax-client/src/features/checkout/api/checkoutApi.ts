import { httpClient } from '@/services/httpClient';
import type { Basket } from '@/features/basket/types/basket.types';
import type { CreateOrder, Order } from '@/lib/types/order';

export const checkoutApi = {
  createPaymentIntent: async (): Promise<Basket> => {
    const response = await httpClient.post<Basket>('/payment');
    return response.data;
  },

  createOrder: async (orderData: CreateOrder): Promise<Order> => {
    const response = await httpClient.post<Order>('/order', orderData);
    return response.data;
  },
};
