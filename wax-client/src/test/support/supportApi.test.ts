import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supportApi } from '@/features/support/api/supportApi';

const { mockGet, mockPost, mockPut, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(), mockPost: vi.fn(), mockPut: vi.fn(), mockDelete: vi.fn(),
}));

vi.mock('@/services/httpClient', () => ({
  httpClient: { get: mockGet, post: mockPost, put: mockPut, delete: mockDelete },
}));

describe('supportApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('getTickets', () => {
    it('parsea respuesta array + header de paginación', async () => {
      mockGet.mockResolvedValue({
        data: [{ id: 't1' }, { id: 't2' }],
        headers: { pagination: JSON.stringify({ TotalCount: 2, PageSize: 10, CurrentPage: 1, TotalPages: 1 }) },
      });
      const result = await supportApi.getTickets({ pageNumber: 1 });
      expect(result).toEqual({
        items: [{ id: 't1' }, { id: 't2' }],
        currentPage: 1, totalPages: 1, pageSize: 10, totalCount: 2,
      });
      expect(mockGet).toHaveBeenCalledWith('/support/my', { params: { pageNumber: 1 } });
    });

    it('parsea respuesta tipo PagedList del backend (no array)', async () => {
      mockGet.mockResolvedValue({
        data: { items: [{ id: 't1' }], currentPage: 2, totalPages: 5, pageSize: 8, totalCount: 40 },
        headers: {},
      });
      const result = await supportApi.getTickets();
      expect(result.items).toEqual([{ id: 't1' }]);
      expect(result.currentPage).toBe(2);
      expect(result.totalPages).toBe(5);
    });

    it('arma defaults cuando no hay header ni items', async () => {
      mockGet.mockResolvedValue({ data: [], headers: {} });
      const result = await supportApi.getTickets();
      expect(result).toEqual({
        items: [], currentPage: 1, totalPages: 1, pageSize: 0, totalCount: 0,
      });
    });

    it('tolera header con JSON inválido (no rompe la llamada)', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockGet.mockResolvedValue({ data: [{ id: 't1' }], headers: { pagination: 'not-json' } });
      const result = await supportApi.getTickets();
      expect(result.items).toEqual([{ id: 't1' }]);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('getTicket', () => {
    it('GET /support/{id}', async () => {
      mockGet.mockResolvedValue({ data: { id: 't1', subject: 'X' } });
      const result = await supportApi.getTicket('t1');
      expect(result).toEqual({ id: 't1', subject: 'X' });
      expect(mockGet).toHaveBeenCalledWith('/support/t1');
    });
  });

  describe('createTicket', () => {
    it('POST /support con el dto y devuelve el id creado', async () => {
      mockPost.mockResolvedValue({ data: 'new-id-123' });
      const dto = { subject: 'Test', description: 'Desc', category: 1, orderId: 'o1', status: 1 };
      const result = await supportApi.createTicket(dto);
      expect(result).toBe('new-id-123');
      expect(mockPost).toHaveBeenCalledWith('/support', dto);
    });
  });

  describe('updateTicket', () => {
    it('PUT /support/{id} con el dto', async () => {
      mockPut.mockResolvedValue({ data: { ok: true } });
      const dto = { status: 2 };
      await supportApi.updateTicket('t1', dto);
      expect(mockPut).toHaveBeenCalledWith('/support/t1', dto);
    });
  });

  describe('deleteTicket', () => {
    it('DELETE /support/{id}', async () => {
      mockDelete.mockResolvedValue({ data: {} });
      await supportApi.deleteTicket('t1');
      expect(mockDelete).toHaveBeenCalledWith('/support/t1');
    });
  });
});
