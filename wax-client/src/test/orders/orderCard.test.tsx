import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderCard } from '@/features/orders/components/OrderCard';
import type { Order } from '@/lib/types/order';

const makeOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'abc12345-xxxx',
  buyerEmail: 'test@wax.com',
  billingAddress: { name: 'X', line1: 'Y', city: 'Z', state: 'S', postalCode: 'P', country: 'EC' },
  paymentSummary: { last4: 4242, brand: 'visa', expMonth: 12, expYear: 2030 },
  deliveryFee: 500,
  discount: 0,
  subtotal: 5000,
  total: 5500,
  orderStatus: 'Pending',
  orderItems: [{ productId: 'p1', name: 'Bag', price: 2500, quantity: 2 }],
  createdAt: '2026-05-01T00:00:00Z',
  updatedAt: null,
  ...overrides,
});

describe('OrderCard', () => {
  it('muestra la referencia del pedido en mayúsculas (primeros 8 caracteres)', () => {
    render(<OrderCard order={makeOrder()} />);
    expect(screen.getByText(/Pedido #ABC12345/)).toBeInTheDocument();
  });

  it('traduce el estado a label legible', () => {
    render(<OrderCard order={makeOrder({ orderStatus: 'Delivered' })} />);
    expect(screen.getByText('Entregado')).toBeInTheDocument();
  });

  it('cae al status crudo cuando no está en el mapa', () => {
    render(<OrderCard order={makeOrder({ orderStatus: 'WeirdStatus' })} />);
    expect(screen.getByText('WeirdStatus')).toBeInTheDocument();
  });

  it('muestra cada item con nombre y precio', () => {
    render(<OrderCard order={makeOrder()} />);
    expect(screen.getByText('Bag')).toBeInTheDocument();
    // formatCurrency(2500 * 2) = $50.00 (centavos → dólares)
    expect(screen.getByText('$50.00')).toBeInTheDocument();
  });

  it('muestra ×N solo cuando quantity > 1', () => {
    render(<OrderCard order={makeOrder({ orderItems: [
      { productId: 'p1', name: 'Bag', price: 2500, quantity: 2 },
      { productId: 'p2', name: 'Ring', price: 1500, quantity: 1 },
    ] })} />);
    expect(screen.getByText('×2')).toBeInTheDocument();
    expect(screen.queryByText('×1')).not.toBeInTheDocument();
  });

  it('singular "pieza" cuando es 1 item', () => {
    render(<OrderCard order={makeOrder({ orderItems: [{ productId: 'p1', name: 'Ring', price: 1500, quantity: 1 }] })} />);
    expect(screen.getByText(/1 pieza\b/)).toBeInTheDocument();
  });

  it('plural "piezas" cuando es más de 1', () => {
    render(<OrderCard order={makeOrder()} />);
    expect(screen.getByText(/2 piezas/)).toBeInTheDocument();
  });

  it('muestra el total formateado', () => {
    render(<OrderCard order={makeOrder({ total: 5500 })} />);
    expect(screen.getByText('$55.00')).toBeInTheDocument();
  });
});
