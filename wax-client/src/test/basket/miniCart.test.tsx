import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MiniCartProvider, useMiniCart } from '@/features/basket/context/miniCartContext';

const wrapper = ({ children }: { children: ReactNode }) => (
  <MiniCartProvider>{children}</MiniCartProvider>
);

describe('useMiniCart', () => {
  it('arranca cerrado', () => {
    const { result } = renderHook(() => useMiniCart(), { wrapper });
    expect(result.current.isOpen).toBe(false);
  });

  it('open() abre el drawer', () => {
    const { result } = renderHook(() => useMiniCart(), { wrapper });
    act(() => { result.current.open(); });
    expect(result.current.isOpen).toBe(true);
  });

  it('close() cierra el drawer', () => {
    const { result } = renderHook(() => useMiniCart(), { wrapper });
    act(() => { result.current.open(); });
    act(() => { result.current.close(); });
    expect(result.current.isOpen).toBe(false);
  });

  it('lanza error si se usa fuera del provider', () => {
    expect(() => renderHook(() => useMiniCart())).toThrow(/MiniCartProvider/);
  });
});
