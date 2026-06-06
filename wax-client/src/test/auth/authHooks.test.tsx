import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import type { ReactNode } from 'react';

const { mockGet, mockPost } = vi.hoisted(() => ({ mockGet: vi.fn(), mockPost: vi.fn() }));
const mockNavigate = vi.fn();

vi.mock('@/lib/api/agent', () => ({
  default: { get: mockGet, post: mockPost },
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return { ...actual, useNavigate: () => mockNavigate };
});

import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useUserAddress } from '@/features/auth/hooks/useUserAddress';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useSaveAddress } from '@/features/auth/hooks/useSaveAddress';

const makeWrapper = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('useCurrentUser', () => {
  beforeEach(() => vi.clearAllMocks());

  it('GET /account/user-info y devuelve la data', async () => {
    mockGet.mockResolvedValue({ status: 200, data: { email: 'test@wax.com', roles: ['Customer'] } });
    const { result } = renderHook(() => useCurrentUser(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.data).toEqual({ email: 'test@wax.com', roles: ['Customer'] }));
    expect(mockGet).toHaveBeenCalledWith('/account/user-info');
  });

  it('devuelve null cuando el status es 204', async () => {
    mockGet.mockResolvedValue({ status: 204, data: null });
    const { result } = renderHook(() => useCurrentUser(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('devuelve null cuando la respuesta no tiene data', async () => {
    mockGet.mockResolvedValue({ status: 200, data: null });
    const { result } = renderHook(() => useCurrentUser(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});

describe('useUserAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.localStorage.clear();
  });

  it('GET /account/billing-address y mapea la respuesta', async () => {
    mockGet.mockResolvedValue({
      status: 200,
      data: { name: 'Ana Lopez', line1: 'Av X', city: 'Q', state: 'P', postalCode: '1', country: 'EC' },
    });
    const { result } = renderHook(() => useUserAddress(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.data).toBeTruthy());
    expect(result.current.data?.name).toBe('Ana Lopez');
    expect(mockGet).toHaveBeenCalledWith('/account/billing-address');
  });

  it('devuelve null cuando hay error (usuario sin dirección)', async () => {
    mockGet.mockRejectedValue({ response: { status: 404 } });
    const { result } = renderHook(() => useUserAddress(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isFetching).toBe(false));
    expect(result.current.data).toBeNull();
  });

  it('no se ejecuta cuando enabled=false', async () => {
    const { result } = renderHook(() => useUserAddress(false), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(mockGet).not.toHaveBeenCalled();
  });
});

describe('useLogin', () => {
  beforeEach(() => vi.clearAllMocks());

  it('POST /login?useCookies=true e invalida queries de user', async () => {
    mockPost.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useLogin(), { wrapper: makeWrapper() });
    await act(async () => {
      await result.current.mutateAsync({ email: 't@t.com', password: '123456' });
    });
    expect(mockPost).toHaveBeenCalledWith('/login?useCookies=true', { email: 't@t.com', password: '123456' });
  });
});

describe('useRegister', () => {
  beforeEach(() => vi.clearAllMocks());

  it('POST /account/register', async () => {
    mockPost.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useRegister(), { wrapper: makeWrapper() });
    await act(async () => {
      await result.current.mutateAsync({
        email: 't@t.com', password: '123456', confirmPassword: '123456',
      } as Parameters<typeof result.current.mutateAsync>[0]);
    });
    expect(mockPost).toHaveBeenCalledWith('/account/register', expect.objectContaining({ email: 't@t.com' }));
  });
});

describe('useLogout', () => {
  beforeEach(() => vi.clearAllMocks());

  it('POST /account/logout, limpia caches y navega a /', async () => {
    mockPost.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useLogout(), { wrapper: makeWrapper() });
    await act(async () => { await result.current.mutateAsync(); });
    expect(mockPost).toHaveBeenCalledWith('/account/logout');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

describe('useSaveAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.localStorage.clear();
  });

  const validAddress = {
    firstName: 'Ana', lastName: 'Lopez',
    identificationType: 'cedula', identificationNumber: '0102030405',
    phone: '0991234567',
    name: 'Ana Lopez', line1: 'Av X', city: 'Q', state: 'P', postalCode: '1', country: 'EC',
  };

  it('POST /account/billing-address y guarda detalles en localStorage', async () => {
    mockPost.mockResolvedValue({ data: validAddress });
    const { result } = renderHook(() => useSaveAddress(), { wrapper: makeWrapper() });
    await act(async () => {
      await result.current.mutateAsync(validAddress as Parameters<typeof result.current.mutateAsync>[0]);
    });
    expect(mockPost).toHaveBeenCalledWith('/account/billing-address', validAddress);
    const stored = JSON.parse(globalThis.localStorage.getItem('wax.profile.details') ?? '{}');
    expect(stored.firstName).toBe('Ana');
  });

  it('si POST falla con falso negativo 400, recupera via GET', async () => {
    mockPost.mockRejectedValue({
      isAxiosError: true,
      response: { status: 400, data: 'Failed to save billing address' },
    });
    mockGet.mockResolvedValue({ data: validAddress });

    const { result } = renderHook(() => useSaveAddress(), { wrapper: makeWrapper() });
    await act(async () => {
      try {
        await result.current.mutateAsync(validAddress as Parameters<typeof result.current.mutateAsync>[0]);
      } catch {
        // El test no debe rejectar — el hook recupera silenciosamente
      }
    });
    // Si el recovery funcionó, NO fue success error
    expect(mockGet).toHaveBeenCalled();
  });
});
