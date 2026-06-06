import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { MyOrdersPageContent } from '@/features/orders/pages/MyOrdersPageContent';

vi.mock('@/features/orders/hooks/useOrders', () => ({ useOrders: vi.fn() }));
vi.mock('@/features/orders/components/OrderCard', () => ({
  OrderCard: ({ order }: { order: { id: string; total: number } }) => (
    <article data-testid={`order-${order.id}`}>{order.id}</article>
  ),
}));
import { useOrders } from '@/features/orders/hooks/useOrders';
const mockUseOrders = vi.mocked(useOrders);

const renderPage = () => render(<MemoryRouter><MyOrdersPageContent /></MemoryRouter>);

describe('MyOrdersPageContent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra "Cargando" mientras isLoadingOrders', () => {
    mockUseOrders.mockReturnValue({ isLoadingOrders: true, ordersData: undefined } as unknown as ReturnType<typeof useOrders>);
    renderPage();
    expect(screen.getByText(/Cargando/i)).toBeInTheDocument();
  });

  it('muestra empty state cuando no hay pedidos', () => {
    mockUseOrders.mockReturnValue({
      isLoadingOrders: false,
      ordersData: { pages: [{ items: [], nextCursor: null }] },
    } as unknown as ReturnType<typeof useOrders>);
    renderPage();
    expect(screen.getByText(/Todavía no tienes pedidos|Todavia no tienes pedidos/i)).toBeInTheDocument();
  });

  it('renderiza la lista de pedidos cuando hay items', () => {
    mockUseOrders.mockReturnValue({
      isLoadingOrders: false,
      ordersData: { pages: [{
        items: [
          { id: 'o1', total: 5000 },
          { id: 'o2', total: 3000 },
        ],
        nextCursor: null,
      }] },
    } as unknown as ReturnType<typeof useOrders>);
    renderPage();
    expect(screen.getByTestId('order-o1')).toBeInTheDocument();
    expect(screen.getByTestId('order-o2')).toBeInTheDocument();
  });
});
