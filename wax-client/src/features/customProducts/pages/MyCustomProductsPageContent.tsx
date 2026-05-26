import { Link } from 'react-router';
import { useMyCustomProducts } from '@/features/customProducts/hooks/useMyCustomProducts';
import { CustomProductCard } from '@/features/customProducts/components/CustomProductCard';
import { routePaths } from '@/routes/routePaths';

export const MyCustomProductsPageContent = () => {
  const { data: products, isLoading } = useMyCustomProducts();

  const items = products ?? [];
  const needingResponse = items.filter((p) => p.status === 'AwaitingCustomerReview').length;

  return (
    <section className="quote-page">
      <header className="quote-header">
        <span className="quote-kicker">Atelier</span>
        <h1 className="quote-title">Mis cotizaciones</h1>
        <p className="quote-lead">
          Sigue el estado de las piezas que diseñaste y responde a las propuestas de WAX.
        </p>
      </header>

      {isLoading ? (
        <p className="quote-empty">Cargando tus cotizaciones…</p>
      ) : !items.length ? (
        <div className="quote-empty-state">
          <p className="quote-empty">Todavía no enviaste ninguna pieza a cotizar.</p>
          <Link to={routePaths.atelier} className="quote-btn quote-btn--primary">
            Ir al Atelier
          </Link>
        </div>
      ) : (
        <>
          {needingResponse > 0 && (
            <div className="quote-banner">
              Tienes {needingResponse} {needingResponse === 1 ? 'propuesta' : 'propuestas'} esperando tu respuesta.
            </div>
          )}
          <ul className="quote-list">
            {items.map((product) => (
              <li key={product.id}>
                <CustomProductCard product={product} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
};
