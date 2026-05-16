import { describe, it, expect, vi, beforeEach } from 'vitest';
import { customProductApi } from '@/features/customProducts/api/customProductApi';
import { httpClient } from '@/services/httpClient';

vi.mock('@/services/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedGet  = vi.mocked(httpClient.get);
const mockedPost = vi.mocked(httpClient.post);

const makeProduct = (overrides = {}) => ({
  id: 'prod-001',
  name: 'Bolso personalizado',
  description: 'Diseño generado por IA',
  price: 35000,
  taskId: 'task-001',
  glbUrl: 'https://cdn.meshy.ai/model.glb',
  ownerUserId: 'user-001',
  status: 'PendingQuotation',
  agreedPrice: null,
  design: { type: 'bolsa', material: 'cuero', color: 'negro', shape: 'rectangular', dimensions: '30x20cm', details: '' },
  proposals: [],
  createdAt: '2026-05-14T00:00:00Z',
  updatedAt: null,
  ...overrides,
});

describe('customProductApi (cliente)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('getMine', () => {
    it('llama a GET /CustomProduct/me y devuelve la lista', async () => {
      const fakeList = [makeProduct(), makeProduct({ id: 'prod-002' })];
      mockedGet.mockResolvedValue({ data: fakeList });

      const result = await customProductApi.getMine();

      expect(mockedGet).toHaveBeenCalledWith('/CustomProduct/me');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('prod-001');
    });

    it('devuelve lista vacía si no hay cotizaciones', async () => {
      mockedGet.mockResolvedValue({ data: [] });

      const result = await customProductApi.getMine();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('llama a GET /CustomProduct/:id y devuelve el producto', async () => {
      const fakeProduct = makeProduct({ status: 'AwaitingCustomerReview' });
      mockedGet.mockResolvedValue({ data: fakeProduct });

      const result = await customProductApi.getById('prod-001');

      expect(mockedGet).toHaveBeenCalledWith('/CustomProduct/prod-001');
      expect(result.status).toBe('AwaitingCustomerReview');
    });
  });

  describe('counterOffer', () => {
    it('llama a POST /CustomProduct/:id/proposals con el monto y comentario', async () => {
      const updated = makeProduct({ status: 'AwaitingAdminReview' });
      mockedPost.mockResolvedValue({ data: updated });

      const result = await customProductApi.counterOffer({ id: 'prod-001', amount: 42000, comment: 'Ofrezco este precio' });

      expect(mockedPost).toHaveBeenCalledWith('/CustomProduct/prod-001/proposals', { amount: 42000, comment: 'Ofrezco este precio' });
      expect(result.status).toBe('AwaitingAdminReview');
    });

    it('funciona sin comentario (campo opcional)', async () => {
      mockedPost.mockResolvedValue({ data: makeProduct() });

      await customProductApi.counterOffer({ id: 'prod-001', amount: 30000 });

      expect(mockedPost).toHaveBeenCalledWith('/CustomProduct/prod-001/proposals', { amount: 30000 });
    });
  });

  describe('approve', () => {
    it('llama a POST /CustomProduct/:id/approve y devuelve el producto actualizado', async () => {
      const approved = makeProduct({ status: 'Approved', agreedPrice: 35000 });
      mockedPost.mockResolvedValue({ data: approved });

      const result = await customProductApi.approve('prod-001');

      expect(mockedPost).toHaveBeenCalledWith('/CustomProduct/prod-001/approve');
      expect(result.status).toBe('Approved');
      expect(result.agreedPrice).toBe(35000);
    });
  });
});
