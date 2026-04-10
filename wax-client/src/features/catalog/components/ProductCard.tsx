import { Link } from 'react-router';
import { waxBrand } from '@/config/brand';
import { routePaths } from '@/routes/routePaths';
import { formatCurrency } from '@/utils/currency';
import type { Product } from '@/features/catalog/types/catalog.types';

type Props = {
  product: Product;
};

export const ProductCard = ({ product }: Props) => {
  return (
    <article className="product-card" style={{ borderRadius: waxBrand.radius.strong, boxShadow: waxBrand.shadow.soft }}>
      <div className="product-card-visual" style={{ background: `linear-gradient(135deg, ${waxBrand.color.stone}, ${waxBrand.color.porcelain})` }}>
        <div className="product-card-brand">{product.brand}</div>
        <img
          src={product.pictureUrl}
          alt={product.name}
          className="product-card-image"
        />
        <div className="product-card-overlay" />

        <div className="product-card-meta">
          <span className="product-card-type">{product.type}</span>
          <div className="product-card-heading">
            <strong className="product-card-name">{product.name}</strong>
            <span className="product-card-price">{formatCurrency(product.price)}</span>
          </div>
        </div>
      </div>

      <div className="product-card-footer">
        <span className="product-card-stock">{product.quantityInStock} disponibles</span>

        <p className="product-card-description">{product.description}</p>
      </div>

      <Link
        to={routePaths.catalogDetails(product.id)}
        className="product-card-link"
      >
        Ver detalle
      </Link>
    </article>
  );
};