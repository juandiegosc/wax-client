import { ProductCard } from '@/features/catalog/components/ProductCard';
import type { Product } from '@/features/catalog/types/catalog.types';

type Props = {
  products: Product[];
};

export const ProductGrid = ({ products }: Props) => {
  return (
    <div className="catalog-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};