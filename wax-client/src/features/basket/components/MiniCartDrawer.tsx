import { useEffect } from 'react';
import { Link } from 'react-router';
import { waxBrand } from '@/config/brand';
import { useBasket } from '@/features/basket/hooks/useBasket';
import { useMiniCart } from '@/features/basket/hooks/useMiniCart';
import { isCustom3dModel } from '@/features/basket/utils/basketHelpers';
import { routePaths } from '@/routes/routePaths';
import { formatCurrency } from '@/utils/currency';

export const MiniCartDrawer = () => {
  const { isOpen, close } = useMiniCart();
  const { data: basket } = useBasket();
  const items = basket?.items ?? [];
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar carrito"
        tabIndex={isOpen ? 0 : -1}
        onClick={close}
        disabled={!isOpen}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 28,
          border: 0,
          padding: 0,
          margin: 0,
          background: 'rgba(15, 15, 16, 0.45)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 280ms ease',
          cursor: 'pointer',
        }}
      />

      <aside
        aria-hidden={!isOpen}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          zIndex: 29,
          width: 'min(26rem, 100vw)',
          height: '100svh',
          background: 'var(--wax-bg)',
          boxShadow: waxBrand.shadow.elevated,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
          display: 'grid',
          gridTemplateRows: 'auto 1fr auto',
          overflow: 'hidden',
        }}
      >
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.1rem 1.25rem',
          borderBottom: '1px solid rgba(15, 15, 16, 0.08)',
        }}>
          <span style={{
            fontSize: '0.72rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--wax-fg-soft)',
          }}>
            Tu carrito · {totalItems} {totalItems === 1 ? 'pieza' : 'piezas'}
          </span>
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar"
            style={{
              border: 0,
              background: 'transparent',
              padding: '0.25rem',
              cursor: 'pointer',
              color: 'var(--wax-fg-soft)',
              fontSize: '1.5rem',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </header>

        <div style={{ overflowY: 'auto', padding: '1rem 1.25rem' }}>
          {items.length === 0 ? (
            <p style={{ color: 'var(--wax-fg-soft)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>
              Tu carrito está vacío.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.85rem' }}>
              {items.map((item) => (
                <li
                  key={item.productId}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '3rem 1fr auto',
                    gap: '0.7rem',
                    alignItems: 'center',
                  }}
                >
                  {isCustom3dModel(item.pictureUrl) ? (
                    <div
                      aria-label={item.productName}
                      style={{
                        width: '3rem',
                        height: '3.5rem',
                        background: 'var(--wax-bg-elevated)',
                        color: 'var(--wax-fg-soft)',
                        borderRadius: waxBrand.radius.soft,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                    </div>
                  ) : (
                    <img
                      src={item.pictureUrl}
                      alt={item.productName}
                      style={{
                        width: '3rem',
                        height: '3.5rem',
                        objectFit: 'cover',
                        borderRadius: waxBrand.radius.soft,
                      }}
                    />
                  )}
                  <div style={{ minWidth: 0, display: 'grid', gap: '0.15rem' }}>
                    <strong style={{
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      color: 'var(--wax-fg)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {item.productName}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--wax-fg-soft)' }}>
                      ×{item.quantity}
                    </span>
                  </div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--wax-fg)' }}>
                    {formatCurrency(item.price * item.quantity)}
                  </strong>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer style={{
          padding: '1rem 1.25rem 1.25rem',
          borderTop: '1px solid rgba(15, 15, 16, 0.08)',
          display: 'grid',
          gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--wax-fg-soft)' }}>
              Subtotal
            </span>
            <strong style={{ fontSize: '1.05rem', color: 'var(--wax-fg)' }}>
              {formatCurrency(subtotal)}
            </strong>
          </div>

          <div style={{ display: 'grid', gap: '0.4rem' }}>
            <Link
              to={routePaths.basket}
              onClick={close}
              style={{
                display: 'block',
                padding: '0.7rem 1rem',
                border: `1px solid var(--wax-fg)`,
                borderRadius: waxBrand.radius.soft,
                background: 'transparent',
                color: 'var(--wax-fg)',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textAlign: 'center',
              }}
            >
              Ver carrito
            </Link>
            <Link
              to={routePaths.checkout}
              onClick={close}
              aria-disabled={items.length === 0}
              style={{
                display: 'block',
                padding: '0.7rem 1rem',
                border: 0,
                borderRadius: waxBrand.radius.soft,
                background: items.length === 0 ? 'var(--wax-fg-soft)' : 'var(--wax-fg)',
                color: 'var(--wax-bg)',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textAlign: 'center',
                pointerEvents: items.length === 0 ? 'none' : 'auto',
              }}
            >
              Ir a pagar
            </Link>
          </div>
        </footer>
      </aside>
    </>
  );
};
