import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useProducts } from '@/features/catalog/hooks/useProducts';
import { useProduct } from '@/features/catalog/hooks/useProduct';

const { mockGetProducts, mockGetProduct } = vi.hoisted(() => ({
  mockGetProducts: vi.fn(),
  mockGetProduct: vi.fn(),
}));

vi.mock('@/features/catalog/api/catalogApi', () => ({
  catalogApi: { getProducts: mockGetProducts, getProduct: mockGetProduct },
}));

const wrapper = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe('useProducts', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('llama a catalogApi.getProducts y devuelve la data paginada', async () => {
    const payload = { items: [{ id: 'p1' }], currentPage: 1, totalPages: 1, pageSize: 12, totalCount: 1 };
    mockGetProducts.mockResolvedValue(payload);

    const { result } = renderHook(() => useProducts({ pageNumber: 1 }), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.data).toEqual(payload));
    expect(mockGetProducts).toHaveBeenCalledWith({ pageNumber: 1 });
  });

  it('no fetcha cuando enabled=false', async () => {
    const { result } = renderHook(() => useProducts({}, { enabled: false }), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(mockGetProducts).not.toHaveBeenCalled();
  });
});

describe('useProduct', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('llama a catalogApi.getProduct con el id', async () => {
    const product = { id: 'p1', name: 'Bag' };
    mockGetProduct.mockResolvedValue(product);

    const { result } = renderHook(() => useProduct('p1'), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.data).toEqual(product));
    expect(mockGetProduct).toHaveBeenCalledWith('p1');
  });

  it('no fetcha si id es undefined', async () => {
    const { result } = renderHook(() => useProduct(undefined), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(mockGetProduct).not.toHaveBeenCalled();
  });
});
