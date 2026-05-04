import { Link, useNavigate } from 'react-router';
import { waxBrand } from '@/config/brand';
import { formatCurrency } from '@/utils/currency';
import { routePaths } from '@/routes/routePaths';
import { useBasket } from '@/features/basket/hooks/useBasket';
import { BasketItem } from '@/features/basket/components/BasketItem';

export const BasketPageContent = () => {
  const { data: basket, isLoading, isError } = useBasket();
  const navigate = useNavigate();
  const items = basket?.items ?? [];
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  if (isLoading) {
    return <p style={{ color: waxBrand.color.graphite }}>Cargando carrito...</p>;
  }

  if (isError) {
    return <p style={{ color: waxBrand.color.graphite }}>No se pudo cargar el carrito.</p>;
  }

  if (!items.length) {
    return (
      <section className="basket-empty">
        <span className="basket-empty-kicker">Carrito</span>
        <h1 className="basket-empty-title">Sin piezas seleccionadas.</h1>
        <p className="basket-empty-lead">
          Explora el catalogo y añade las piezas que quieras reservar.
        </p>
        <Link to={routePaths.catalog} className="basket-cta">
          Ir al catalogo
        </Link>
      </section>
    );
  }

  return (
    <section className="basket-page">
      <header className="basket-header" style={{ borderBottom: `1px solid rgba(15, 15, 16, 0.08)` }}>
        <div className="basket-header-copy">
          <span className="basket-kicker">Carrito</span>
          <h1 className="basket-title">Tu seleccion.</h1>
        </div>
        <div className="basket-header-meta">
          <strong className="basket-count">{totalItems} {totalItems === 1 ? 'pieza' : 'piezas'}</strong>
        </div>
      </header>

      <div className="basket-layout">
        <ul className="basket-list">
          {items.map((item) => (
            <li key={item.productId}>
              <BasketItem item={item} />
            </li>
          ))}
        </ul>

        <aside className="basket-summary" style={{ borderLeft: `1px solid rgba(15, 15, 16, 0.08)` }}>
          <span className="basket-kicker">Resumen</span>

          <div className="basket-summary-row">
            <span>Subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>

          <div className="basket-summary-row basket-summary-row--total">
            <span>Total estimado</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>

          <p className="basket-summary-note">
            El pago y envio se confirman en el siguiente paso.
          </p>

          <button
            className="basket-checkout-btn"
            onClick={() => navigate(routePaths.checkout)}
          >
            Continuar al pago
          </button>
        </aside>
      </div>
    </section>
  );
};
