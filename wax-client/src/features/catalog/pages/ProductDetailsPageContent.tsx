import { useParams } from 'react-router';
import { waxBrand } from '@/config/brand';
import { formatCurrency } from '@/utils/currency';
import { useProduct } from '@/features/catalog/hooks/useProduct';

export const ProductDetailsPageContent = () => {
  const { id } = useParams();
  const { data: product, isLoading, isError } = useProduct(id);

  if (isLoading) {
    return <p style={{ color: waxBrand.color.graphite }}>Cargando producto...</p>;
  }

  if (isError || !product) {
    return <p style={{ color: waxBrand.color.graphite }}>No se pudo cargar el producto solicitado.</p>;
  }

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

        <div className="product-details-facts">
          <div className="product-details-fact-card">
            <span className="product-details-fact-label">Tipo</span>
            <strong className="product-details-fact-value">{product.type}</strong>
          </div>
          <div className="product-details-fact-card">
            <span className="product-details-fact-label">Presentacion</span>
            <strong className="product-details-fact-value">Objeto editorial</strong>
          </div>
          <div className="product-details-fact-card">
            <span className="product-details-fact-label">Lectura</span>
            <strong className="product-details-fact-value">Superficie y presencia</strong>
          </div>
        </div>

        <div className="product-details-note" style={{ borderTop: `1px solid rgba(15, 15, 16, 0.08)` }}>
          <span className="product-details-note-label">Nota de presentacion</span>
          <div className="product-details-note-body">
            Esta pieza se lee primero como forma, despues como especificacion.
          </div>
        </div>
      </div>
    </section>
  );
};