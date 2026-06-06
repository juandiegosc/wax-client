import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BasketItem } from '@/features/basket/components/BasketItem';

const { mockAddMutate, mockRemoveMutate } = vi.hoisted(() => ({
  mockAddMutate: vi.fn(),
  mockRemoveMutate: vi.fn(),
}));

vi.mock('@/features/basket/hooks/useAddToBasket', () => ({
  useAddToBasket: () => ({ mutate: mockAddMutate, isPending: false }),
}));

vi.mock('@/features/basket/hooks/useRemoveFromBasket', () => ({
  useRemoveFromBasket: () => ({ mutate: mockRemoveMutate, isPending: false }),
}));

const makeItem = (overrides = {}) => ({
  productId: 'p1',
  productName: 'Bolso editorial',
  brand: 'WAX',
  type: 'Bolso',
  price: 2500,
  quantity: 2,
  pictureUrl: 'https://cdn.example.com/bag.jpg',
  ...overrides,
});

describe('BasketItem', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renderiza marca, tipo y nombre', () => {
    render(<BasketItem item={makeItem()} />);
    expect(screen.getByText('WAX')).toBeInTheDocument();
    expect(screen.getByText('Bolso')).toBeInTheDocument();
    expect(screen.getByText('Bolso editorial')).toBeInTheDocument();
  });

  it('muestra precio unitario con "c/u"', () => {
    render(<BasketItem item={makeItem()} />);
    // formatCurrency(2500) = $25.00
    expect(screen.getByText(/\$25\.00 c\/u/)).toBeInTheDocument();
  });

  it('renderiza la imagen real para productos normales', () => {
    render(<BasketItem item={makeItem({ pictureUrl: 'https://cdn.example.com/bag.jpg' })} />);
    const img = screen.getByAltText('Bolso editorial') as HTMLImageElement;
    expect(img.tagName).toBe('IMG');
    expect(img.src).toContain('bag.jpg');
  });

  it('muestra placeholder 3D cuando pictureUrl termina en .glb', () => {
    render(<BasketItem item={makeItem({ pictureUrl: 'https://meshy.ai/model.glb' })} />);
    expect(screen.getByText('Pieza 3D')).toBeInTheDocument();
    expect(screen.queryByAltText('Bolso editorial')).not.toBeInTheDocument();
  });

  it('detecta .glb con query string también', () => {
    render(<BasketItem item={makeItem({ pictureUrl: 'https://meshy.ai/m.glb?token=abc' })} />);
    expect(screen.getByText('Pieza 3D')).toBeInTheDocument();
  });

  it('click en − llama removeItem con productId y quantity 1', () => {
    render(<BasketItem item={makeItem()} />);
    fireEvent.click(screen.getByLabelText('Quitar uno'));
    expect(mockRemoveMutate).toHaveBeenCalledWith({ productId: 'p1', quantity: 1 });
  });

  it('muestra la cantidad actual', () => {
    render(<BasketItem item={makeItem({ quantity: 3 })} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
