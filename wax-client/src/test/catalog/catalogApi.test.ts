import { describe, it, expect, vi, beforeEach } from 'vitest';
import { catalogApi } from '@/features/catalog/api/catalogApi';
import { httpClient } from '@/services/httpClient';

vi.mock('@/services/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedGet = vi.mocked(httpClient.get);

describe('catalogApi.getProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('parses pagination header and returns structured data', async () => {
    const fakeProducts = [{ id: '1', name: 'Bolso Cloud' }];
    const paginationHeader = JSON.stringify({
      TotalCount: 20,
      PageSize: 4,
      CurrentPage: 2,
      TotalPages: 5,
    });

    mockedGet.mockResolvedValue({
      data: fakeProducts,
      headers: { pagination: paginationHeader },
    });

    const result = await catalogApi.getProducts({ pageNumber: 2, pageSize: 4 });

    expect(result.items).toEqual(fakeProducts);
    expect(result.currentPage).toBe(2);
    expect(result.totalPages).toBe(5);
    expect(result.pageSize).toBe(4);
    expect(result.totalCount).toBe(20);
  });

  it('falls back to data length when pagination header is missing', async () => {
    const fakeProducts = [{ id: '1' }, { id: '2' }];

    mockedGet.mockResolvedValue({
      data: fakeProducts,
      headers: {},
    });

    const result = await catalogApi.getProducts();

    expect(result.items).toEqual(fakeProducts);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.totalCount).toBe(2);
  });

  it('calls the correct endpoint with params', async () => {
    mockedGet.mockResolvedValue({ data: [], headers: {} });

    await catalogApi.getProducts({ searchTerm: 'bolso', pageNumber: 1 });

    expect(mockedGet).toHaveBeenCalledWith('/product', {
      params: { searchTerm: 'bolso', pageNumber: 1 },
    });
  });
});
