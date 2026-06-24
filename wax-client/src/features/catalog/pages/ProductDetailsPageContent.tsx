import { useParams } from 'react-router';
import { formatCurrency } from '@/utils/currency';
import { Reveal } from '@/components/Reveal';
import { useProduct } from '@/features/catalog/hooks/useProduct';
import { useAddToBasket } from '@/features/basket/hooks/useAddToBasket';
import { useProfileGuard } from '@/lib/hooks/useProfileGuard';
import { PageLoadingSkeleton } from '@/components/PageLoadingSkeleton';

export const ProductDetailsPageContent = () => {
  const { id } = useParams();
  const { data: product, isLoading, isError } = useProduct(id);
  const { mutate: addToBasket, isPending: isAdding } = useAddToBasket();
  const { requireProfile } = useProfileGuard();

  if (isLoading) {
    return <PageLoadingSkeleton label="Cargando pieza" rows={5} />;
  }

  if (isError || !product) {
    return <p style={{ color: 'var(--wax-fg-muted)' }}>No pudimos cargar esta pieza.</p>;
  }

  const outOfStock = product.quantityInStock === 0;
  const addBtnLabel = isAdding ? 'Añadiendo...' : outOfStock ? 'Sin stock' : 'Añadir al carrito';

  return (
    <section className="product-details-layout">
      <Reveal className="product-details-visual" style={{ background: 'var(--wax-color-stone)', boxShadow: 'var(--wax-shadow-soft)' }}>
        <img src={product.pictureUrl} alt={product.name} className="product-details-image product-details-image-enter" />

        <div className="product-details-visual-badge">{product.brand}</div>

        <div className="product-details-visual-note">
          <span>Pieza</span>
          <strong>{product.type}</strong>
        </div>
      </Reveal>

      <div className="product-details-content">
        <Reveal className="product-details-header" delay={120}>
          <span className="product-details-kicker">Edición WAX</span>
          <h1 className="product-details-title">{product.name}</h1>
          <p className="product-details-lead">{product.description}</p>
        </Reveal>

        <Reveal className="product-details-purchase-row" delay={220}>
          <strong className="product-details-price">{formatCurrency(product.price)}</strong>
          <span className="product-details-availability">{product.quantityInStock} disponibles</span>
        </Reveal>

        <Reveal delay={300}>
          <button
            className="product-details-add-btn"
            disabled={outOfStock || isAdding}
            onClick={() => requireProfile(() => addToBasket({ productId: product.id, quantity: 1 }))}
          >
            {addBtnLabel}
          </button>
        </Reveal>

        <Reveal className="product-details-facts" delay={380}>
          <div className="product-details-fact-card">
            <span className="product-details-fact-label">Tipo</span>
            <strong className="product-details-fact-value">{product.type}</strong>
          </div>
        </Reveal>
      </div>
    </section>
  );
};