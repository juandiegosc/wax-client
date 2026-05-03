import { useParams } from 'react-router';
import { waxBrand } from '@/config/brand';
import { formatCurrency } from '@/utils/currency';
import { useProduct } from '@/features/catalog/hooks/useProduct';
import { useAddToBasket } from '@/features/basket/hooks/useAddToBasket';
import { useProfileGuard } from '@/lib/hooks/useProfileGuard';

export const ProductDetailsPageContent = () => {
  const { id } = useParams();
  const { data: product, isLoading, isError } = useProduct(id);
  const { mutate: addToBasket, isPending: isAdding } = useAddToBasket();
  const { requireProfile } = useProfileGuard();

  if (isLoading) {
    return <p style={{ color: waxBrand.color.graphite }}>Cargando producto...</p>;
  }

  if (isError || !product) {
    return <p style={{ color: waxBrand.color.graphite }}>No se pudo cargar el producto solicitado.</p>;
  }

  const outOfStock = product.quantityInStock === 0;
  const addBtnLabel = isAdding ? 'Añadiendo...' : outOfStock ? 'Sin stock' : 'Añadir al carrito';

  return (
    <section className="product-details-layout">
      <div className="product-details-visual" style={{ background: waxBrand.color.stone, boxShadow: waxBrand.shadow.soft }}>
        <img src={product.pictureUrl} alt={product.name} className="product-details-image" />

        <div className="product-details-visual-badge">{product.brand}</div>

        <div className="product-details-visual-note">
          <span>Pieza</span>
          <strong>{product.type}</strong>
        </div>
      </div>

      <div className="product-details-content">
        <div className="product-details-header">
          <span className="product-details-kicker">Edicion WAX</span>
          <h1 className="product-details-title">{product.name}</h1>
          <p className="product-details-lead">{product.description}</p>
        </div>

        <div className="product-details-purchase-row">
          <strong className="product-details-price">{formatCurrency(product.price)}</strong>
          <span className="product-details-availability">{product.quantityInStock} disponibles</span>
        </div>

        <button
          className="product-details-add-btn"
          disabled={outOfStock || isAdding}
          onClick={() => requireProfile(() => addToBasket({ productId: product.id, quantity: 1 }))}
        >
          {addBtnLabel}
        </button>

        <div className="product-details-facts">
          <div className="product-details-fact-card">
            <span className="product-details-fact-label">Tipo</span>
            <strong className="product-details-fact-value">{product.type}</strong>
          </div>
        </div>
      </div>
    </section>
  );
};