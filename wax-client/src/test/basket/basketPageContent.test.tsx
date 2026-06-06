import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BasketPageContent } from '@/features/basket/pages/BasketPageContent';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/features/basket/hooks/useBasket', () => ({ useBasket: vi.fn() }));
vi.mock('@/features/basket/components/BasketItem', () => ({
  BasketItem: ({ item }: { item: { productId: string; productName: string } }) => (
    <li data-testid={`basket-item-${item.productId}`}>{item.productName}</li>
  ),
}));

import { useBasket } from '@/features/basket/hooks/useBasket';
const mockUseBasket = vi.mocked(useBasket);

const renderPage = () => {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <BasketPageContent />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('BasketPageContent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra "Cargando carrito" mientras isLoading', () => {
    mockUseBasket.mockReturnValue({ isLoading: true } as unknown as ReturnType<typeof useBasket>);
    renderPage();
    expect(screen.getByText(/Cargando carrito/i)).toBeInTheDocument();
  });

  it('muestra "No se pudo cargar" en error', () => {
    mockUseBasket.mockReturnValue({ isLoading: false, isError: true } as unknown as ReturnType<typeof useBasket>);
    renderPage();
    expect(screen.getByText(/No se pudo cargar/i)).toBeInTheDocument();
  });

  it('muestra empty state cuando el carrito esta vacio', () => {
    mockUseBasket.mockReturnValue({
      isLoading: false, isError: false, data: { basketId: '', items: [] },
    } as unknown as ReturnType<typeof useBasket>);
    renderPage();
    expect(screen.getByText(/Sin piezas seleccionadas/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ir al catalogo/i })).toBeInTheDocument();
  });

  it('renderiza items, total y boton de pago', () => {
    mockUseBasket.mockReturnValue({
      isLoading: false, isError: false,
      data: {
        basketId: 'b1',
        items: [
          { productId: 'p1', productName: 'Bag', price: 5000, quantity: 2, pictureUrl: '', brand: 'WAX', type: 'BG' },
          { productId: 'p2', productName: 'Ring', price: 3000, quantity: 1, pictureUrl: '', brand: 'WAX', type: 'RG' },
        ],
      },
    } as unknown as ReturnType<typeof useBasket>);
    renderPage();
    expect(screen.getByTestId('basket-item-p1')).toBeInTheDocument();
    expect(screen.getByTestId('basket-item-p2')).toBeInTheDocument();
    // subtotal = 5000*2 + 3000*1 = 13000 → $130.00
    expect(screen.getAllByText(/\$130\.00/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/3 piezas/)).toBeInTheDocument();
  });

  it('boton "Continuar al pago" navega a /checkout', async () => {
    mockUseBasket.mockReturnValue({
      isLoading: false, isError: false,
      data: { basketId: 'b1', items: [
        { productId: 'p1', productName: 'Bag', price: 5000, quantity: 1, pictureUrl: '', brand: 'WAX', type: 'BG' },
      ] },
    } as unknown as ReturnType<typeof useBasket>);
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /Continuar al pago/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/checkout');
  });
});
