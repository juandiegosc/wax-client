import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useBasket } from '@/features/basket/hooks/useBasket';
import { useAddToBasket } from '@/features/basket/hooks/useAddToBasket';
import { useRemoveFromBasket } from '@/features/basket/hooks/useRemoveFromBasket';
import { MiniCartProvider } from '@/features/basket/context/miniCartContext';

const { mockGetBasket, mockAddItem, mockRemoveItem } = vi.hoisted(() => ({
  mockGetBasket: vi.fn(),
  mockAddItem: vi.fn(),
  mockRemoveItem: vi.fn(),
}));

vi.mock('@/features/basket/api/basketApi', () => ({
  basketApi: {
    getBasket: mockGetBasket,
    addItem: mockAddItem,
    removeItem: mockRemoveItem,
  },
}));

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const makeWrapper = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MiniCartProvider>{children}</MiniCartProvider>
    </QueryClientProvider>
  );
};

describe('useBasket', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('llama a basketApi.getBasket y expone la data', async () => {
    const basket = { id: 'b1', items: [], paymentIntentId: null, clientSecret: null };
    mockGetBasket.mockResolvedValue(basket);

    const { result } = renderHook(() => useBasket(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.data).toEqual(basket));
    expect(mockGetBasket).toHaveBeenCalled();
  });

  it('no hace fetch cuando enabled=false', async () => {
    const { result } = renderHook(() => useBasket(false), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(mockGetBasket).not.toHaveBeenCalled();
  });

  it('preserva el clientSecret cuando la nueva basket no lo trae', async () => {
    const wrapper = makeWrapper();
    mockGetBasket.mockResolvedValueOnce({ id: 'b1', items: [], paymentIntentId: 'pi_1', clientSecret: 'secret_1' });
    const { result, rerender } = renderHook(() => useBasket(), { wrapper });

    await waitFor(() => expect(result.current.data?.clientSecret).toBe('secret_1'));

    // Segundo fetch sin clientSecret → debe preservar el viejo
    mockGetBasket.mockResolvedValueOnce({ id: 'b1', items: [{}], paymentIntentId: null, clientSecret: null });
    await act(async () => { await result.current.refetch(); });
    rerender();

    expect(result.current.data?.clientSecret).toBe('secret_1');
    expect(result.current.data?.paymentIntentId).toBe('pi_1');
  });
});

describe('useAddToBasket', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('llama a basketApi.addItem con productId y quantity', async () => {
    mockAddItem.mockResolvedValue({ id: 'b1', items: [{ productId: 'p1', quantity: 2 }] });
    const { result } = renderHook(() => useAddToBasket(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ productId: 'p1', quantity: 2 });
    });

    await waitFor(() => expect(mockAddItem).toHaveBeenCalledWith('p1', 2));
  });
});

describe('useRemoveFromBasket', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('llama a basketApi.removeItem con productId y quantity', async () => {
    mockRemoveItem.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRemoveFromBasket(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ productId: 'p1', quantity: 1 });
    });

    await waitFor(() => expect(mockRemoveItem).toHaveBeenCalledWith('p1', 1));
  });
});
