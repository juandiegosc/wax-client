import { Link } from 'react-router';
import { routePaths } from '@/routes/routePaths';
import { formatCurrency } from '@/utils/currency';
import type { Product } from '@/features/catalog/types/catalog.types';

type Props = {
  product: Product;
};

export const ProductCard = ({ product }: Props) => {
  return (
    <article
      style={{
        display: 'grid',
        gap: '1rem',
        padding: '1rem',
        borderRadius: '1.5rem',
        background: 'rgba(255, 255, 255, 0.82)',
        boxShadow: '0 24px 60px rgba(28, 25, 23, 0.08)',
        border: '1px solid rgba(28, 25, 23, 0.06)',
      }}
    >
      <div
        style={{
          aspectRatio: '4 / 3',
          borderRadius: '1rem',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #e7e5e4, #fafaf9)',
        }}
      >
        <img
          src={product.pictureUrl}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <strong>{product.name}</strong>
          <span style={{ color: '#a16207', fontWeight: 700 }}>{formatCurrency(product.price)}</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
          <span style={{ padding: '0.25rem 0.6rem', borderRadius: '999px', background: '#f5f5f4' }}>
            {product.brand}
          </span>
          <span style={{ padding: '0.25rem 0.6rem', borderRadius: '999px', background: '#fef3c7' }}>
            {product.type}
          </span>
        </div>

        <p style={{ margin: 0, color: '#57534e' }}>{product.description}</p>
      </div>

      <Link
        to={routePaths.catalogDetails(product.id)}
        style={{ display: 'inline-flex', fontWeight: 700, color: '#1c1917' }}
      >
        Ver detalle
      </Link>
    </article>
  );
};