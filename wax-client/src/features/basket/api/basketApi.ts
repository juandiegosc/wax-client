import { httpClient } from '@/services/httpClient';
import type { Basket } from '@/features/basket/types/basket.types';

export const basketApi = {
  getBasket: async () => {
    const response = await httpClient.get<Basket>('/basket');
    return response.data;
  },

  addItem: async (productId: string, quantity: number) => {
    const response = await httpClient.post<Basket>('/basket', null, {
      params: { productId, quantity },
    });
    return response.data;
  },

  removeItem: async (productId: string, quantity: number) => {
    await httpClient.delete('/basket', { params: { productId, quantity } });
  },
};
