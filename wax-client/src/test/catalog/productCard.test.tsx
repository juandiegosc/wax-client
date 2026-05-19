import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { ProductCard } from '@/features/catalog/components/ProductCard';
import type { Product } from '@/features/catalog/types/catalog.types';

// ── Mocks ────────────────────────────────────────────────────────────────────
const mockRequireProfile = vi.fn();
const mockAddToBasket = vi.fn();

vi.mock('@/features/basket/hooks/useAddToBasket', () => ({
  useAddToBasket: vi.fn(),
}));

vi.mock('@/lib/hooks/useProfileGuard', () => ({
  useProfileGuard: vi.fn(),
}));

import { useAddToBasket } from '@/features/basket/hooks/useAddToBasket';
import { useProfileGuard } from '@/lib/hooks/useProfileGuard';

// ── Helpers ──────────────────────────────────────────────────────────────────
const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: '1',
  name: 'Bolso Cloud Blanc',
  description: 'Volumen nuboso en polímero blanco',
  price: 42000,
  pictureUrl: 'bolso.jpg',
  brand: 'WAX',
  type: 'Bolso',
  quantityInStock: 5,
  ...overrides,
});

const renderCard = (product: Product) =>
  render(
    <MemoryRouter>
      <ProductCard product={product} />
    </MemoryRouter>,
  );

// ── Tests ────────────────────────────────────────────────────────────────────
describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAddToBasket).mockReturnValue({
      mutate: mockAddToBasket,
      isPending: false,
    } as unknown as ReturnType<typeof useAddToBasket>);

    vi.mocked(useProfileGuard).mockReturnValue({
      requireProfile: mockRequireProfile,
      isAuthenticated: true,
      hasCompleteProfile: true,
    });
  });

  it('renders product name, price, type and brand', () => {
    renderCard(makeProduct());

    expect(screen.getByText('Bolso Cloud Blanc')).toBeInTheDocument();
    expect(screen.getByText('$420.00')).toBeInTheDocument();
    expect(screen.getByText('Bolso')).toBeInTheDocument();
    expect(screen.getByText('WAX')).toBeInTheDocument();
  });

  it('shows add to cart button when product is in stock', () => {
    renderCard(makeProduct({ quantityInStock: 3 }));

    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('+ Añadir al carrito');
    expect(btn).toBeEnabled();
  });

  it('shows "Sin stock" and disables button when product is out of stock', () => {
    renderCard(makeProduct({ quantityInStock: 0 }));

    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('Sin stock');
    expect(btn).toBeDisabled();
  });

  it('shows "Añadiendo..." and disables button while adding', () => {
    vi.mocked(useAddToBasket).mockReturnValue({
      mutate: mockAddToBasket,
      isPending: true,
    } as unknown as ReturnType<typeof useAddToBasket>);

    renderCard(makeProduct());

    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('Añadiendo...');
    expect(btn).toBeDisabled();
  });

  it('calls requireProfile when the add to cart button is clicked', async () => {
    renderCard(makeProduct());

    await userEvent.click(screen.getByRole('button'));

    expect(mockRequireProfile).toHaveBeenCalledOnce();
  });

  it('calls addToBasket with correct args when requireProfile executes the action', async () => {
    mockRequireProfile.mockImplementation((action: () => void) => action());
    renderCard(makeProduct());

    await userEvent.click(screen.getByRole('button'));

    expect(mockAddToBasket).toHaveBeenCalledWith({ productId: '1', quantity: 1 });
  });

  it('does not call requireProfile when button is disabled (out of stock)', async () => {
    renderCard(makeProduct({ quantityInStock: 0 }));

    await userEvent.click(screen.getByRole('button'));

    expect(mockRequireProfile).not.toHaveBeenCalled();
  });
});
