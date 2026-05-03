import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProfileGuard } from '@/lib/hooks/useProfileGuard';

const mockNavigate = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('react-toastify', () => ({
  toast: { info: vi.fn() },
}));

vi.mock('@/lib/hooks/useAccount', () => ({
  useCurrentUser: vi.fn(),
  useUserAddress: vi.fn(),
}));

vi.mock('@/routes/routePaths', () => ({
  routePaths: { login: '/login', profile: '/profile' },
}));

import { useCurrentUser, useUserAddress } from '@/lib/hooks/useAccount';
import { toast } from 'react-toastify';

const mockUseCurrentUser = vi.mocked(useCurrentUser);
const mockUseUserAddress = vi.mocked(useUserAddress);
const mockToast = vi.mocked(toast.info);

const setupUser = (roles: string[] = [], hasAddress = true) => {
  mockUseCurrentUser.mockReturnValue({
    data: { email: 'test@wax.mx', roles },
  } as ReturnType<typeof useCurrentUser>);

  mockUseUserAddress.mockReturnValue({
    data: hasAddress ? { street: 'Calle 1' } : undefined,
  } as ReturnType<typeof useUserAddress>);
};

const setupNoUser = () => {
  mockUseCurrentUser.mockReturnValue({ data: undefined } as ReturnType<typeof useCurrentUser>);
  mockUseUserAddress.mockReturnValue({ data: undefined } as ReturnType<typeof useUserAddress>);
};

describe('useProfileGuard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('redirects to login and shows toast when not authenticated', () => {
    setupNoUser();
    const { result } = renderHook(() => useProfileGuard());
    const action = vi.fn();

    act(() => result.current.requireProfile(action));

    expect(action).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(mockToast).toHaveBeenCalledWith('Inicia sesión para añadir piezas al carrito');
  });

  it('redirects to profile when user has Enrolled role', () => {
    setupUser(['Enrolled'], false);
    const { result } = renderHook(() => useProfileGuard());
    const action = vi.fn();

    act(() => result.current.requireProfile(action));

    expect(action).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
    expect(mockToast).toHaveBeenCalledWith('Completa tu perfil para continuar');
  });

  it('redirects to profile when authenticated but has no address', () => {
    setupUser([], false);
    const { result } = renderHook(() => useProfileGuard());
    const action = vi.fn();

    act(() => result.current.requireProfile(action));

    expect(action).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('executes the action when profile is complete', () => {
    setupUser([], true);
    const { result } = renderHook(() => useProfileGuard());
    const action = vi.fn();

    act(() => result.current.requireProfile(action));

    expect(action).toHaveBeenCalledOnce();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('returns isAuthenticated=false when no user', () => {
    setupNoUser();
    const { result } = renderHook(() => useProfileGuard());
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('returns isAuthenticated=true when user is logged in', () => {
    setupUser();
    const { result } = renderHook(() => useProfileGuard());
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('returns hasCompleteProfile=false for Enrolled user', () => {
    setupUser(['Enrolled'], true);
    const { result } = renderHook(() => useProfileGuard());
    expect(result.current.hasCompleteProfile).toBe(false);
  });

  it('returns hasCompleteProfile=true for user with address and no Enrolled role', () => {
    setupUser([], true);
    const { result } = renderHook(() => useProfileGuard());
    expect(result.current.hasCompleteProfile).toBe(true);
  });
});
