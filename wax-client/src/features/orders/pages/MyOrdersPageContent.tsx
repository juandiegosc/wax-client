import { Link } from 'react-router';
import { useOrders } from '@/lib/hooks/useOrders';
import { OrderCard } from '@/features/orders/components/OrderCard';
import { routePaths } from '@/routes/routePaths';

export const MyOrdersPageContent = () => {
  const { ordersData, isLoadingOrders, hasNextPage, isFetchingNextPage, fetchNextPage } = useOrders();

  const orders = ordersData?.pages.flatMap((p) => p.items) ?? [];

  return (
    <section className="quote-page">
      <header className="quote-header">
        <span className="quote-kicker">Cuenta</span>
        <h1 className="quote-title">Mis pedidos</h1>
        <p className="quote-lead">
          Revisá el historial y el estado de tus compras en WAX.
        </p>
      </header>

      {isLoadingOrders ? (
        <p className="quote-empty">Cargando tus pedidos…</p>
      ) : !orders.length ? (
        <div className="quote-empty-state">
          <p className="quote-empty">Todavía no tenés pedidos.</p>
          <Link to={routePaths.catalog} className="quote-btn quote-btn--primary">
            Ver colección
          </Link>
        </div>
      ) : (
        <>
          <ul className="quote-list">
            {orders.map((order) => (
              <li key={order.id}>
                <OrderCard order={order} />
              </li>
            ))}
          </ul>

          {hasNextPage && (
            <div className="quote-empty-state">
              <button
                type="button"
                className="quote-btn quote-btn--ghost"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Cargando…' : 'Ver más pedidos'}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};
