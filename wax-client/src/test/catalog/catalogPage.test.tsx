import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { CatalogPageContent } from '@/features/catalog/pages/CatalogPageContent';

// ── Mocks ────────────────────────────────────────────────────────────────────
vi.mock('@/features/catalog/hooks/useProducts', () => ({
  useProducts: vi.fn(),
}));

// Isolate CatalogPageContent from ProductCard's own hooks
vi.mock('@/features/catalog/components/ProductGrid', () => ({
  ProductGrid: ({ products }: { products: { id: string; name: string }[] }) => (
    <ul data-testid="product-grid">
      {products.map((p) => <li key={p.id}>{p.name}</li>)}
    </ul>
  ),
}));

import { useProducts } from '@/features/catalog/hooks/useProducts';

const mockUseProducts = vi.mocked(useProducts);

// ── Helpers ──────────────────────────────────────────────────────────────────
const renderCatalog = (search = '') =>
  render(
    <MemoryRouter initialEntries={[search ? `/catalog?q=${search}` : '/catalog']}>
      <CatalogPageContent />
    </MemoryRouter>,
  );

const fakeProducts = [
  { id: '1', name: 'Bolso Cloud Blanc' },
  { id: '2', name: 'Bolso Negro Mate' },
];

// ── Tests ────────────────────────────────────────────────────────────────────
describe('CatalogPageContent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows skeleton loaders while loading', () => {
    mockUseProducts.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
    } as unknown as ReturnType<typeof useProducts>);

    renderCatalog();

    expect(document.querySelectorAll('.catalog-skeleton')).toHaveLength(8);
  });

  it('renders the product grid when products load', () => {
    mockUseProducts.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { items: fakeProducts, totalPages: 1, totalCount: 2, currentPage: 1, pageSize: 12 },
    } as unknown as ReturnType<typeof useProducts>);

    renderCatalog();

    expect(screen.getByTestId('product-grid')).toBeInTheDocument();
    expect(screen.getByText('Bolso Cloud Blanc')).toBeInTheDocument();
    expect(screen.getByText('Bolso Negro Mate')).toBeInTheDocument();
  });

  it('renders the catalog heading', () => {
    mockUseProducts.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { items: fakeProducts, totalPages: 1, totalCount: 2, currentPage: 1, pageSize: 12 },
    } as unknown as ReturnType<typeof useProducts>);

    renderCatalog();

    expect(screen.getByRole('heading', { name: /catálogo/i })).toBeInTheDocument();
  });

  it('shows generic empty state when catalog has no products', () => {
    mockUseProducts.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { items: [], totalPages: 1, totalCount: 0, currentPage: 1, pageSize: 12 },
    } as unknown as ReturnType<typeof useProducts>);

    renderCatalog();

    expect(screen.getByText(/el catálogo está vacío/i)).toBeInTheDocument();
  });

  it('shows search-specific empty state when a search returns no results', async () => {
    mockUseProducts.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { items: [], totalPages: 1, totalCount: 0, currentPage: 1, pageSize: 12 },
    } as unknown as ReturnType<typeof useProducts>);

    renderCatalog();

    await userEvent.type(screen.getByPlaceholderText('Buscar...'), 'xyz');

    expect(await screen.findByText(/no hay piezas para esta búsqueda/i)).toBeInTheDocument();
  });

  it('shows an error message when the request fails', () => {
    mockUseProducts.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    } as unknown as ReturnType<typeof useProducts>);

    renderCatalog();

    expect(screen.getByText(/no se pudo cargar el catalogo/i)).toBeInTheDocument();
  });

  it('shows pagination when there are multiple pages', () => {
    mockUseProducts.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { items: fakeProducts, totalPages: 3, totalCount: 30, currentPage: 1, pageSize: 12 },
    } as unknown as ReturnType<typeof useProducts>);

    renderCatalog();

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
  });

  it('does not show pagination when there is only one page', () => {
    mockUseProducts.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { items: fakeProducts, totalPages: 1, totalCount: 2, currentPage: 1, pageSize: 12 },
    } as unknown as ReturnType<typeof useProducts>);

    renderCatalog();

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
