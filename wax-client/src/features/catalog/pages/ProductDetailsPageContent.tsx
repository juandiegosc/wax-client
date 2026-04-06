import { useParams } from 'react-router';
import { formatCurrency } from '@/utils/currency';
import { useProduct } from '@/features/catalog/hooks/useProduct';

export const ProductDetailsPageContent = () => {
  const { id } = useParams();
  const { data: product, isLoading, isError } = useProduct(id);

  if (isLoading) {
    return <p>Cargando producto...</p>;
  }

  if (isError || !product) {
    return <p>No se pudo cargar el producto solicitado.</p>;
  }

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
        gap: '2rem',
        alignItems: 'start',
      }}
    >
      <div style={{ borderRadius: '1.5rem', overflow: 'hidden', background: '#e7e5e4' }}>
        <img src={product.pictureUrl} alt={product.name} style={{ width: '100%', display: 'block' }} />
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <span style={{ color: '#a16207', fontWeight: 700 }}>{product.brand}</span>
          <h1 style={{ margin: '0.4rem 0 0' }}>{product.name}</h1>
        </div>
        <strong style={{ fontSize: '1.5rem' }}>{formatCurrency(product.price)}</strong>
        <p style={{ margin: 0, color: '#57534e' }}>{product.description}</p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ padding: '0.35rem 0.75rem', borderRadius: '999px', background: '#fef3c7' }}>
            Tipo: {product.type}
          </span>
          <span style={{ padding: '0.35rem 0.75rem', borderRadius: '999px', background: '#f5f5f4' }}>
            Stock: {product.quantityInStock}
          </span>
        </div>
      </div>
    </section>
  );
};