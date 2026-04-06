import { ProductGrid } from '@/features/catalog/components/ProductGrid';
import { useProducts } from '@/features/catalog/hooks/useProducts';

export const CatalogPageContent = () => {
  const { data, isLoading, isError } = useProducts({ pageNumber: 1, pageSize: 12 });

  if (isLoading) {
    return <p>Cargando catalogo...</p>;
  }

  if (isError) {
    return <p>No se pudo cargar el catalogo.</p>;
  }

  if (!data?.items.length) {
    return <p>No hay productos disponibles.</p>;
  }

  return (
    <section style={{ display: 'grid', gap: '1.5rem' }}>
      <header style={{ display: 'grid', gap: '0.5rem' }}>
        <span style={{ color: '#a16207', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Catalog feature
        </span>
        <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Catalogo de productos</h1>
        <p style={{ margin: 0, color: '#57534e' }}>
          Esta pagina ya vive en `features/catalog` y consume el backend con React Query dentro del nuevo estandar.
        </p>
      </header>

      <ProductGrid products={data.items} />
    </section>
  );
};