import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));

vi.mock('@/lib/api/agent', () => ({ default: { get: mockGet } }));

import { useOrders } from '@/features/orders/hooks/useOrders';

const makeWrapper = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe('useOrders', () => {
  beforeEach(() => vi.clearAllMocks());

  it('llama GET /order/my y expone los items en la primera pagina', async () => {
    mockGet.mockResolvedValue({
      data: { items: [{ id: 'o1' }, { id: 'o2' }], nextCursor: 'cursor-2' },
    });
    const { result } = renderHook(() => useOrders(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.ordersData).toBeTruthy());
    expect(result.current.ordersData?.pages[0].items).toHaveLength(2);
    expect(result.current.hasNextPage).toBe(true);
    expect(mockGet).toHaveBeenCalledWith('/order/my', expect.objectContaining({ params: expect.any(Object) }));
  });

  it('cuando el backend retorna array (no PagedList) lo envuelve y marca nextCursor null', async () => {
    mockGet.mockResolvedValue({ data: [{ id: 'o1' }] });
    const { result } = renderHook(() => useOrders(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.ordersData).toBeTruthy());
    expect(result.current.ordersData?.pages[0]).toEqual({ items: [{ id: 'o1' }], nextCursor: null });
    expect(result.current.hasNextPage).toBe(false);
  });

  it('pasa filter y startDate como query params', async () => {
    mockGet.mockResolvedValue({ data: { items: [], nextCursor: null } });
    renderHook(() => useOrders({ filter: 'Delivered', startDate: '2026-01-01' }), { wrapper: makeWrapper() });
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    expect(mockGet).toHaveBeenCalledWith('/order/my', {
      params: expect.objectContaining({ filter: 'Delivered', startDate: '2026-01-01' }),
    });
  });
});
