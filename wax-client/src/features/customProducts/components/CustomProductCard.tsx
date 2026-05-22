import { Link } from 'react-router';
import { routePaths } from '@/routes/routePaths';
import { formatCurrency } from '@/utils/currency';
import {
  STATUS_LABELS,
  type CustomProductDto,
} from '@/features/customProducts/types/customProduct.types';

type Props = {
  product: CustomProductDto;
};

export const CustomProductCard = ({ product }: Props) => {
  const statusLabel = STATUS_LABELS[product.status] ?? product.status;
  const date = new Date(product.createdAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const needsResponse = product.status === 'AwaitingCustomerReview';

  return (
    <Link to={routePaths.customProductDetail(product.id)} className="quote-card-link">
      <article className={`quote-card${needsResponse ? ' quote-card--alert' : ''}`}>
        <div className="quote-card-header">
          <span className="quote-card-type">{product.design.type || product.name}</span>
          <span className={`quote-status quote-status--${product.status.toLowerCase()}`}>
            {statusLabel}
          </span>
        </div>

        <p className="quote-card-desc">
          {product.design.material} · {product.design.color} · {product.design.dimensions}
        </p>

        <div className="quote-card-footer">
          <span className="quote-card-price">{formatCurrency(product.price)}</span>
          <span className="quote-card-date">{date}</span>
        </div>
      </article>
    </Link>
  );
};
