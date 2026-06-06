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

vi.mock('@/utils/formData', () => ({
  toFormData: vi.fn((dto) => dto),
}));

const mockedGet = vi.mocked(httpClient.get);
const mockedPost = vi.mocked(httpClient.post);
const mockedPut = vi.mocked(httpClient.put);
const mockedDelete = vi.mocked(httpClient.delete);

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

describe('catalogApi.getProduct', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('llama a GET /product/:id y devuelve el producto', async () => {
    const product = { id: 'p1', name: 'Bag', price: 2000 };
    mockedGet.mockResolvedValue({ data: product });

    const result = await catalogApi.getProduct('p1');

    expect(mockedGet).toHaveBeenCalledWith('/product/p1');
    expect(result).toEqual(product);
  });
});

describe('catalogApi.createProduct', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('llama a POST /product con multipart/form-data', async () => {
    const dto = { name: 'New', price: 5000 } as never;
    const created = { id: 'p99', name: 'New', price: 5000 };
    mockedPost.mockResolvedValue({ data: created });

    const result = await catalogApi.createProduct(dto);

    expect(mockedPost).toHaveBeenCalledWith('/product', dto, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(result).toEqual(created);
  });
});

describe('catalogApi.updateProduct', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('llama a PUT /product con multipart/form-data', async () => {
    const dto = { id: 'p1', name: 'Updated' } as never;
    mockedPut.mockResolvedValue({ data: null });

    await catalogApi.updateProduct(dto);

    expect(mockedPut).toHaveBeenCalledWith('/product', dto, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  });
});

describe('catalogApi.deleteProduct', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('llama a DELETE /product/:id', async () => {
    mockedDelete.mockResolvedValue({ data: null });

    await catalogApi.deleteProduct('p1');

    expect(mockedDelete).toHaveBeenCalledWith('/product/p1');
  });
});
