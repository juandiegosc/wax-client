import { Link } from 'react-router';
import { routePaths } from '@/routes/routePaths';
import { formatCurrency } from '@/utils/currency';
import { useAddToBasket } from '@/features/basket/hooks/useAddToBasket';
import { useProfileGuard } from '@/lib/hooks/useProfileGuard';
import type { Product } from '@/features/catalog/types/catalog.types';

type Props = {
  product: Product;
};

export const ProductCard = ({ product }: Props) => {
  const { mutate: addToBasket, isPending: isAdding } = useAddToBasket();
  const { requireProfile } = useProfileGuard();
  const outOfStock = product.quantityInStock === 0;

  return (
    <article className="product-card">
      <div className="product-card-visual-wrap">
        <Link to={routePaths.catalogDetails(product.id)} className="product-card-image-link">
          <img
            src={product.pictureUrl}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
          />
          <div className="product-card-brand-tag">{product.brand}</div>
        </Link>

        <div className="product-card-quick-add">
          <button
            type="button"
            className="product-card-quick-add-btn"
            disabled={outOfStock || isAdding}
            onClick={() => requireProfile(() => addToBasket({ productId: product.id, quantity: 1 }))}
          >
            {isAdding ? 'Añadiendo...' : outOfStock ? 'Sin stock' : '+ Añadir al carrito'}
          </button>
        </div>
      </div>

      <div className="product-card-info">
        <span className="product-card-type">{product.type}</span>
        <Link to={routePaths.catalogDetails(product.id)} className="product-card-name-link">
          <strong className="product-card-name">{product.name}</strong>
        </Link>
        <span className="product-card-price">{formatCurrency(product.price)}</span>
      </div>
    </article>
  );
};
