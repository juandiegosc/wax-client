import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useMyCustomProducts } from '@/features/customProducts/hooks/useMyCustomProducts';
import { useCustomProduct } from '@/features/customProducts/hooks/useCustomProduct';
import {
  useCounterOffer,
  useApproveCustomProduct,
} from '@/features/customProducts/hooks/useCustomProductMutations';

const { mockGetMine, mockGetById, mockCounter, mockApprove } = vi.hoisted(() => ({
  mockGetMine: vi.fn(),
  mockGetById: vi.fn(),
  mockCounter: vi.fn(),
  mockApprove: vi.fn(),
}));

vi.mock('@/features/customProducts/api/customProductApi', () => ({
  customProductApi: {
    getMine: mockGetMine,
    getById: mockGetById,
    counterOffer: mockCounter,
    approve: mockApprove,
  },
}));

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const wrapper = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe('useMyCustomProducts', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('llama a customProductApi.getMine y devuelve la lista', async () => {
    const list = [{ id: 'q1' }, { id: 'q2' }];
    mockGetMine.mockResolvedValue(list);

    const { result } = renderHook(() => useMyCustomProducts(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.data).toEqual(list));
    expect(mockGetMine).toHaveBeenCalled();
  });

  it('no fetcha si enabled=false', async () => {
    const { result } = renderHook(() => useMyCustomProducts(false), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(mockGetMine).not.toHaveBeenCalled();
  });
});

describe('useCustomProduct', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('llama a customProductApi.getById con el id', async () => {
    const product = { id: 'q1', name: 'Bag' };
    mockGetById.mockResolvedValue(product);

    const { result } = renderHook(() => useCustomProduct('q1'), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.data).toEqual(product));
    expect(mockGetById).toHaveBeenCalledWith('q1');
  });

  it('no fetcha cuando id es vacío', async () => {
    const { result } = renderHook(() => useCustomProduct(''), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(mockGetById).not.toHaveBeenCalled();
  });
});

describe('useCounterOffer', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('llama a customProductApi.counterOffer con los vars', async () => {
    mockCounter.mockResolvedValue({ id: 'q1' });
    const { result } = renderHook(() => useCounterOffer(), { wrapper: wrapper() });

    const vars = { id: 'q1', amount: 50000, comment: 'mejor precio' };
    await act(async () => { result.current.mutate(vars); });

    await waitFor(() => expect(mockCounter).toHaveBeenCalledWith(vars));
  });
});

describe('useApproveCustomProduct', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('llama a customProductApi.approve con el id', async () => {
    mockApprove.mockResolvedValue({ id: 'q1', status: 'Approved' });
    const { result } = renderHook(() => useApproveCustomProduct(), { wrapper: wrapper() });

    await act(async () => { result.current.mutate('q1'); });

    await waitFor(() => expect(mockApprove).toHaveBeenCalledWith('q1'));
  });
});
