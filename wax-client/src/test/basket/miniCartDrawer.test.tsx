import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { MiniCartProvider } from '@/features/basket/context/MiniCartProvider';
import { MiniCartDrawer } from '@/features/basket/components/MiniCartDrawer';
import { useMiniCart } from '@/features/basket/hooks/useMiniCart';

vi.mock('@/features/basket/hooks/useBasket', () => ({ useBasket: vi.fn() }));

import { useBasket } from '@/features/basket/hooks/useBasket';
const mockUseBasket = vi.mocked(useBasket);

const OpenButton = () => {
  const { open } = useMiniCart();
  return <button onClick={open}>OPEN</button>;
};

const renderDrawer = () => render(
  <MemoryRouter>
    <MiniCartProvider>
      <OpenButton />
      <MiniCartDrawer />
    </MiniCartProvider>
  </MemoryRouter>,
);

const itemsFixture = [
  { productId: 'p1', productName: 'Bag', price: 5000, quantity: 2, pictureUrl: 'https://x.jpg', brand: 'WAX', type: 'BG' },
  { productId: 'p2', productName: 'Ring', price: 3000, quantity: 1, pictureUrl: 'https://meshy.ai/r.glb', brand: 'WAX', type: 'RG' },
];

describe('MiniCartDrawer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('cuando isOpen=false no muestra contenido visible', () => {
    mockUseBasket.mockReturnValue({ data: { basketId: 'b1', items: [] } } as unknown as ReturnType<typeof useBasket>);
    renderDrawer();
    // El drawer existe pero translateX(100%) — no asercio visibility, asercio aria-hidden
    const drawer = document.querySelector('aside');
    expect(drawer?.getAttribute('aria-hidden')).toBe('true');
  });

  it('muestra mensaje de vacio cuando no hay items', async () => {
    mockUseBasket.mockReturnValue({ data: { basketId: 'b1', items: [] } } as unknown as ReturnType<typeof useBasket>);
    renderDrawer();
    await userEvent.click(screen.getByText('OPEN'));
    expect(screen.getByText(/Tu carrito está vacío|esta vacio/i)).toBeInTheDocument();
  });

  it('muestra items con subtotal y total cuando tiene contenido', async () => {
    mockUseBasket.mockReturnValue({ data: { basketId: 'b1', items: itemsFixture } } as unknown as ReturnType<typeof useBasket>);
    renderDrawer();
    await userEvent.click(screen.getByText('OPEN'));
    expect(screen.getByText('Bag')).toBeInTheDocument();
    expect(screen.getByText('Ring')).toBeInTheDocument();
    // 3 piezas total
    expect(screen.getByText(/3 piezas/)).toBeInTheDocument();
    // subtotal = 5000*2 + 3000*1 = 13000 → $130.00
    expect(screen.getAllByText('$130.00').length).toBeGreaterThanOrEqual(1);
  });

  it('muestra placeholder 3D para items GLB', async () => {
    mockUseBasket.mockReturnValue({ data: { basketId: 'b1', items: [itemsFixture[1]] } } as unknown as ReturnType<typeof useBasket>);
    renderDrawer();
    await userEvent.click(screen.getByText('OPEN'));
    const placeholder = screen.getByLabelText('Ring');
    expect(placeholder.tagName).toBe('DIV');
    expect(placeholder.querySelector('svg')).toBeInTheDocument();
  });

  it('click en boton de cerrar (X) cierra el drawer', async () => {
    mockUseBasket.mockReturnValue({ data: { basketId: 'b1', items: itemsFixture } } as unknown as ReturnType<typeof useBasket>);
    renderDrawer();
    await userEvent.click(screen.getByText('OPEN'));
    await userEvent.click(screen.getByLabelText('Cerrar'));
    const drawer = document.querySelector('aside');
    expect(drawer?.getAttribute('aria-hidden')).toBe('true');
  });

  it('click en overlay cierra el drawer', async () => {
    mockUseBasket.mockReturnValue({ data: { basketId: 'b1', items: [] } } as unknown as ReturnType<typeof useBasket>);
    renderDrawer();
    await userEvent.click(screen.getByText('OPEN'));
    await userEvent.click(screen.getByLabelText('Cerrar carrito'));
    const drawer = document.querySelector('aside');
    expect(drawer?.getAttribute('aria-hidden')).toBe('true');
  });

  it('los links "Ver carrito" e "Ir a pagar" apuntan a las rutas correctas', async () => {
    mockUseBasket.mockReturnValue({ data: { basketId: 'b1', items: itemsFixture } } as unknown as ReturnType<typeof useBasket>);
    renderDrawer();
    await userEvent.click(screen.getByText('OPEN'));
    const verCarrito = screen.getByText(/Ver carrito/i).closest('a');
    const irAPagar = screen.getByText(/Ir a pagar/i).closest('a');
    expect(verCarrito?.getAttribute('href')).toContain('basket');
    expect(irAPagar?.getAttribute('href')).toContain('checkout');
  });
});
