import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CheckoutOrderSummary } from '@/features/checkout/components/CheckoutOrderSummary';

const baseItem = {
  productId: 'p1', productName: 'Bag', price: 5000, quantity: 1,
  pictureUrl: 'https://img.png', brand: 'WAX', type: 'BG',
};

const renderSummary = (items = [baseItem]) =>
  render(
    <CheckoutOrderSummary basket={{ basketId: 'b1', items } as Parameters<typeof CheckoutOrderSummary>[0]['basket']} />,
  );

describe('CheckoutOrderSummary', () => {
  it('renderiza cada item con su nombre y subtotal por linea', () => {
    renderSummary([
      { ...baseItem, productId: 'p1', productName: 'Bag', price: 5000, quantity: 2 },
      { ...baseItem, productId: 'p2', productName: 'Ring', price: 3000, quantity: 1 },
    ]);
    expect(screen.getByText('Bag')).toBeInTheDocument();
    expect(screen.getByText('Ring')).toBeInTheDocument();
    // Bag: 5000 * 2 = 10000 → $100.00
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    // Ring: 3000 * 1 = 3000 → $30.00
    expect(screen.getByText('$30.00')).toBeInTheDocument();
  });

  it('calcula subtotal, IVA 15% y total', () => {
    renderSummary([{ ...baseItem, price: 10000, quantity: 1 }]);
    // subtotal = 10000 → $100.00
    // IVA = trunc(10000*0.15) = 1500 → $15.00
    // total = $115.00
    expect(screen.getByText('$15.00')).toBeInTheDocument();
    expect(screen.getByText('$115.00')).toBeInTheDocument();
  });

  it('muestra placeholder 3D cuando el pictureUrl es un .glb (en vez de imagen rota)', () => {
    renderSummary([{ ...baseItem, pictureUrl: 'https://meshy.ai/abc.glb' }]);
    const placeholder = screen.getByLabelText('Bag');
    expect(placeholder.tagName).toBe('DIV');
    expect(placeholder.querySelector('svg')).toBeInTheDocument();
  });

  it('muestra img normal cuando pictureUrl es imagen', () => {
    renderSummary([{ ...baseItem, pictureUrl: 'https://res.cloudinary.com/bag.jpg' }]);
    const img = screen.getByAltText('Bag') as HTMLImageElement;
    expect(img.tagName).toBe('IMG');
  });

  it('muestra ×N como contador de cantidad', () => {
    renderSummary([{ ...baseItem, quantity: 3 }]);
    expect(screen.getByText('×3')).toBeInTheDocument();
  });
});
