import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReviewStep } from '@/features/checkout/components/ReviewStep';

const item = {
  productId: 'p1', productName: 'Bag', price: 4000, quantity: 2,
  pictureUrl: 'https://img.png', brand: 'WAX', type: 'BG',
};

const tokenWith = (overrides: Record<string, unknown> = {}) => ({
  payment_method_preview: {
    card: { brand: 'visa', last4: '4242', exp_month: 12, exp_year: 2030 },
  },
  shipping: {
    address: {
      city: 'Quito', country: 'EC', line1: 'Av X', line2: null,
      postal_code: '170150', state: 'Pichincha',
    },
    name: 'Ana Lopez',
    phone: '',
  },
  ...overrides,
});

const renderReview = (confirmationToken: Parameters<typeof ReviewStep>[0]['confirmationToken'], items = [item]) =>
  render(
    <ReviewStep
      confirmationToken={confirmationToken}
      basket={{ basketId: 'b1', items } as Parameters<typeof ReviewStep>[0]['basket']}
    />,
  );

describe('ReviewStep', () => {
  it('renderiza datos de envio y tarjeta', () => {
    renderReview(tokenWith() as unknown as Parameters<typeof ReviewStep>[0]['confirmationToken']);
    expect(screen.getByText(/Av X/)).toBeInTheDocument();
    expect(screen.getByText(/Quito/)).toBeInTheDocument();
    expect(screen.getByText(/visa/i)).toBeInTheDocument();
    expect(screen.getByText(/4242/)).toBeInTheDocument();
  });

  it('muestra "—" cuando no hay confirmationToken', () => {
    renderReview(null);
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it('renderiza el subtotal + IVA + total correctamente', () => {
    renderReview(tokenWith() as unknown as Parameters<typeof ReviewStep>[0]['confirmationToken']);
    // subtotal = 4000*2 = 8000 → $80.00 (aparece dos veces: por item y como subtotal)
    expect(screen.getAllByText('$80.00').length).toBeGreaterThanOrEqual(1);
    // IVA = trunc(8000*0.15) = 1200 → $12.00
    expect(screen.getByText('$12.00')).toBeInTheDocument();
    // total = $92.00
    expect(screen.getByText('$92.00')).toBeInTheDocument();
  });

  it('muestra placeholder 3D para items GLB en vez de imagen', () => {
    renderReview(
      tokenWith() as unknown as Parameters<typeof ReviewStep>[0]['confirmationToken'],
      [{ ...item, pictureUrl: 'https://meshy.ai/x.glb' }],
    );
    const placeholder = screen.getByLabelText('Bag');
    expect(placeholder.tagName).toBe('DIV');
    expect(placeholder.querySelector('svg')).toBeInTheDocument();
  });
});
