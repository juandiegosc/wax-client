import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const { mockGetTickets, mockGetTicket, mockCreateTicket } = vi.hoisted(() => ({
  mockGetTickets: vi.fn(), mockGetTicket: vi.fn(), mockCreateTicket: vi.fn(),
}));

vi.mock('@/features/support/api/supportApi', () => ({
  supportApi: { getTickets: mockGetTickets, getTicket: mockGetTicket, createTicket: mockCreateTicket },
}));

vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { useTickets } from '@/features/support/hooks/useTickets';
import { useTicket } from '@/features/support/hooks/useTicket';
import { useCreateTicket } from '@/features/support/hooks/useCreateTicket';

const makeWrapper = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe('useTickets', () => {
  beforeEach(() => vi.clearAllMocks());

  it('llama supportApi.getTickets con params y expone la data', async () => {
    const payload = { items: [{ id: 't1' }], currentPage: 1, totalPages: 1, pageSize: 10, totalCount: 1 };
    mockGetTickets.mockResolvedValue(payload);
    const { result } = renderHook(() => useTickets({ pageNumber: 1 }), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.data).toEqual(payload));
    expect(mockGetTickets).toHaveBeenCalledWith({ pageNumber: 1 });
  });

  it('funciona sin params (default vacio)', async () => {
    mockGetTickets.mockResolvedValue({ items: [], currentPage: 1, totalPages: 1, pageSize: 0, totalCount: 0 });
    const { result } = renderHook(() => useTickets(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGetTickets).toHaveBeenCalledWith({});
  });
});

describe('useTicket', () => {
  beforeEach(() => vi.clearAllMocks());

  it('GET ticket por id', async () => {
    mockGetTicket.mockResolvedValue({ id: 't1', subject: 'X' });
    const { result } = renderHook(() => useTicket('t1'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.data).toEqual({ id: 't1', subject: 'X' }));
    expect(mockGetTicket).toHaveBeenCalledWith('t1');
  });

  it('no fetcha si el id esta vacio', async () => {
    const { result } = renderHook(() => useTicket(''), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(mockGetTicket).not.toHaveBeenCalled();
  });
});

describe('useCreateTicket', () => {
  beforeEach(() => vi.clearAllMocks());

  it('llama supportApi.createTicket con el dto', async () => {
    mockCreateTicket.mockResolvedValue('new-ticket-id');
    const { result } = renderHook(() => useCreateTicket(), { wrapper: makeWrapper() });
    const dto = { subject: 'X', description: 'D', category: 1, orderId: 'o1', status: 1 };
    await act(async () => { await result.current.mutateAsync(dto); });
    expect(mockCreateTicket).toHaveBeenCalledWith(dto);
  });
});
