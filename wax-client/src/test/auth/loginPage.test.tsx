import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { LoginPage } from '@/pages/LoginPage';

// ── Static asset mock ────────────────────────────────────────────────────────
vi.mock('@/assets/images/editorial/HOME_PAGE_MAIN.png', () => ({ default: '' }));

// ── Hook mocks ───────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
const mockMutateAsync = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null, pathname: '/login' }),
  };
});

vi.mock('@/features/auth/hooks', () => ({
  useCurrentUser: vi.fn(),
  useLogin: vi.fn(),
  useUserAddress: vi.fn(),
}));

import { useCurrentUser, useLogin, useUserAddress } from '@/features/auth/hooks';

const mockUseCurrentUser = vi.mocked(useCurrentUser);
const mockUseLogin = vi.mocked(useLogin);
const mockUseUserAddress = vi.mocked(useUserAddress);

// ── Helpers ──────────────────────────────────────────────────────────────────
const renderLogin = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

const setupGuest = () => {
  mockUseCurrentUser.mockReturnValue({ data: null, isLoading: false } as unknown as ReturnType<typeof useCurrentUser>);
  mockUseUserAddress.mockReturnValue({ data: null, isLoading: false } as unknown as ReturnType<typeof useUserAddress>);
  mockUseLogin.mockReturnValue({ mutateAsync: mockMutateAsync, isPending: false } as unknown as ReturnType<typeof useLogin>);
};

const setupLoggedIn = () => {
  mockUseCurrentUser.mockReturnValue({
    data: { email: 'dani@wax.mx', roles: [] },
    isLoading: false,
  } as unknown as ReturnType<typeof useCurrentUser>);
  mockUseUserAddress.mockReturnValue({ data: { street: 'Calle 1' }, isLoading: false } as unknown as ReturnType<typeof useUserAddress>);
  mockUseLogin.mockReturnValue({ mutateAsync: mockMutateAsync, isPending: false } as unknown as ReturnType<typeof useLogin>);
};

const fillForm = async (email: string, password: string) => {
  await userEvent.type(screen.getByPlaceholderText('tu@correo.com'), email);
  await userEvent.type(screen.getByPlaceholderText('Ingresa tu contrasena'), password);
};

// ── Tests ────────────────────────────────────────────────────────────────────
describe('LoginPage', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('when the user is not logged in', () => {
    it('renders the login form', () => {
      setupGuest();
      renderLogin();
      expect(screen.getByRole('heading', { name: /iniciar sesion/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('tu@correo.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ingresa tu contrasena')).toBeInTheDocument();
    });

    it('submit button is disabled when the form is empty', () => {
      setupGuest();
      renderLogin();
      expect(screen.getByRole('button', { name: /entrar/i })).toBeDisabled();
    });

    it('shows email validation error for invalid email', async () => {
      setupGuest();
      renderLogin();

      await userEvent.type(screen.getByPlaceholderText('tu@correo.com'), 'no-es-un-correo');
      await userEvent.tab();

      expect(await screen.findByText('Ingresa un correo valido.')).toBeInTheDocument();
    });

    it('shows password validation error when password is too short', async () => {
      setupGuest();
      renderLogin();

      await userEvent.type(screen.getByPlaceholderText('Ingresa tu contrasena'), '123');
      await userEvent.tab();

      expect(await screen.findByText('La contrasena debe tener al menos 6 caracteres.')).toBeInTheDocument();
    });

    it('enables the submit button when form is valid', async () => {
      setupGuest();
      renderLogin();

      await fillForm('dani@wax.mx', 'password123');

      expect(screen.getByRole('button', { name: /entrar/i })).toBeEnabled();
    });

    it('calls login and navigates on successful submit', async () => {
      setupGuest();
      mockMutateAsync.mockResolvedValue(undefined);
      renderLogin();

      await fillForm('dani@wax.mx', 'password123');
      await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledWith({
        email: 'dani@wax.mx',
        password: 'password123',
      }));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
    });

    it('shows error message on 401 invalid credentials', async () => {
      setupGuest();
      const error = new AxiosError('Unauthorized');
      Object.assign(error, { response: { status: 401 } });
      mockMutateAsync.mockRejectedValue(error);
      renderLogin();

      await fillForm('dani@wax.mx', 'wrongpass');
      await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

      expect(
        await screen.findByText(/el correo o la contrasena no coinciden/i),
      ).toBeInTheDocument();
    });
  });

  describe('when the user is already logged in', () => {
    it('shows the active session UI instead of the form', () => {
      setupLoggedIn();
      renderLogin();

      expect(screen.getByText(/ya estas dentro de WAX/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /entrar/i })).not.toBeInTheDocument();
    });

    it('shows the user email in the active session message', () => {
      setupLoggedIn();
      renderLogin();

      expect(screen.getByText(/dani@wax\.mx/i)).toBeInTheDocument();
    });
  });
});
