import { describe, it, expect, vi, beforeEach } from 'vitest';
import { basketApi } from '@/features/basket/api/basketApi';

const { mockGet, mockPost, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock('@/services/httpClient', () => ({
  httpClient: { get: mockGet, post: mockPost, delete: mockDelete },
}));

describe('basketApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBasket', () => {
    it('llama a GET /basket y devuelve la data', async () => {
      const basket = { id: 'b1', items: [], paymentIntentId: null, clientSecret: null };
      mockGet.mockResolvedValue({ data: basket });

      const result = await basketApi.getBasket();

      expect(mockGet).toHaveBeenCalledWith('/basket');
      expect(result).toEqual(basket);
    });
  });

  describe('addItem', () => {
    it('llama a POST /basket con productId y quantity como params', async () => {
      const updated = { id: 'b1', items: [{ productId: 'p1', quantity: 2 }] };
      mockPost.mockResolvedValue({ data: updated });

      const result = await basketApi.addItem('p1', 2);

      expect(mockPost).toHaveBeenCalledWith('/basket', null, {
        params: { productId: 'p1', quantity: 2 },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('removeItem', () => {
    it('llama a DELETE /basket con productId y quantity como params', async () => {
      mockDelete.mockResolvedValue({ data: null });

      await basketApi.removeItem('p1', 1);

      expect(mockDelete).toHaveBeenCalledWith('/basket', {
        params: { productId: 'p1', quantity: 1 },
      });
    });
  });
});
