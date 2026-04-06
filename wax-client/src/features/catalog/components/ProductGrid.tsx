import { ProductCard } from '@/features/catalog/components/ProductCard';
import type { Product } from '@/features/catalog/types/catalog.types';

type Props = {
  products: Product[];
};

export const ProductGrid = ({ products }: Props) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1rem',
      }}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};