import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCreatePaymentIntent, useCreateOrder } from '@/features/checkout/hooks/useCheckout';
import { queryKeys } from '@/lib/queryKeys';

const { mockCreatePaymentIntent, mockCreateOrder } = vi.hoisted(() => ({
  mockCreatePaymentIntent: vi.fn(),
  mockCreateOrder: vi.fn(),
}));

vi.mock('@/features/checkout/api/checkoutApi', () => ({
  checkoutApi: {
    createPaymentIntent: mockCreatePaymentIntent,
    createOrder: mockCreateOrder,
  },
}));

const makeClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

const wrap = (client: QueryClient) =>
  ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

describe('useCreatePaymentIntent', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('llama a checkoutApi.createPaymentIntent y guarda el basket en cache', async () => {
    const client = makeClient();
    const basket = { id: 'b1', items: [], paymentIntentId: 'pi_1', clientSecret: 'sec_1' };
    mockCreatePaymentIntent.mockResolvedValue(basket);

    const { result } = renderHook(() => useCreatePaymentIntent(), { wrapper: wrap(client) });

    await act(async () => { await result.current.mutateAsync(); });

    expect(mockCreatePaymentIntent).toHaveBeenCalled();
    expect(client.getQueryData(queryKeys.basket.all)).toEqual(basket);
  });
});

describe('useCreateOrder', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('llama a checkoutApi.createOrder con el dto', async () => {
    const order = { id: 'o1', total: 2500, orderStatus: 'Pending' };
    mockCreateOrder.mockResolvedValue(order);

    const { result } = renderHook(() => useCreateOrder(), { wrapper: wrap(makeClient()) });

    const dto = { paymentSummary: { last4: 4242, brand: 'visa', exp_month: 12, exp_year: 2030 } };
    await act(async () => {
      result.current.mutate(dto);
    });

    // TanStack Query v5 pasa (variables, context) al mutationFn
    await waitFor(() => expect(mockCreateOrder).toHaveBeenCalledWith(dto, expect.anything()));
    await waitFor(() => expect(result.current.data).toEqual(order));
  });
});
