import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { CustomProductCard } from '@/features/customProducts/components/CustomProductCard';
import type { CustomProductDto } from '@/features/customProducts/types/customProduct.types';

const makeProduct = (overrides: Partial<CustomProductDto> = {}): CustomProductDto => ({
  id: 'prod-001',
  name: 'Bolso personalizado',
  description: 'Diseño generado por IA',
  price: 3500000,
  taskId: 'task-001',
  glbUrl: 'https://cdn.meshy.ai/model.glb',
  ownerUserId: 'user-001',
  status: 'PendingQuotation',
  agreedPrice: null,
  design: { type: 'Bolsa', material: 'Cuero', color: 'Negro', shape: 'Rectangular', dimensions: '30x20cm', details: '' },
  proposals: [],
  createdAt: '2026-05-14T00:00:00Z',
  updatedAt: null,
  ...overrides,
});

const renderCard = (product: CustomProductDto) =>
  render(
    <MemoryRouter>
      <CustomProductCard product={product} />
    </MemoryRouter>,
  );

describe('CustomProductCard', () => {
  it('muestra el tipo de diseño y el estado', () => {
    renderCard(makeProduct());

    expect(screen.getByText('Bolsa')).toBeInTheDocument();
    expect(screen.getByText('Procesando')).toBeInTheDocument();
  });

  it('muestra material, color y dimensiones', () => {
    renderCard(makeProduct());

    expect(screen.getByText(/Cuero/)).toBeInTheDocument();
    expect(screen.getByText(/Negro/)).toBeInTheDocument();
    expect(screen.getByText(/30x20cm/)).toBeInTheDocument();
  });

  it('muestra el precio formateado', () => {
    renderCard(makeProduct({ price: 3500000 }));

    expect(screen.getByText(/35\.000|35,000/)).toBeInTheDocument();
  });

  it('usa la clase alert cuando el estado es AwaitingCustomerReview', () => {
    renderCard(makeProduct({ status: 'AwaitingCustomerReview' }));

    const article = screen.getByRole('article');
    expect(article.className).toContain('quote-card--alert');
  });

  it('no usa la clase alert para otros estados', () => {
    renderCard(makeProduct({ status: 'PendingQuotation' }));

    const article = screen.getByRole('article');
    expect(article.className).not.toContain('quote-card--alert');
  });

  it('muestra "Esperando tu respuesta" para AwaitingCustomerReview', () => {
    renderCard(makeProduct({ status: 'AwaitingCustomerReview' }));

    expect(screen.getByText('Esperando tu respuesta')).toBeInTheDocument();
  });

  it('enlaza al detalle del producto', () => {
    renderCard(makeProduct({ id: 'prod-999' }));

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/mis-cotizaciones/prod-999');
  });

  it('usa el nombre del producto si design.type está vacío', () => {
    renderCard(makeProduct({ design: { type: '', material: 'metal', color: 'plata', shape: 'circular', dimensions: '2x2cm', details: '' } }));

    expect(screen.getByText('Bolso personalizado')).toBeInTheDocument();
  });
});
