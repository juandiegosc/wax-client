import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { ProductGrid } from '@/features/catalog/components/ProductGrid';
import { useProducts } from '@/features/catalog/hooks/useProducts';
import { waxBrand } from '@/config/brand';

const PAGE_SIZE = 12;

const ORDER_OPTIONS = [
  { value: '', label: 'Relevancia' },
  { value: 'name', label: 'Nombre A–Z' },
  { value: 'priceAsc', label: 'Precio: menor a mayor' },
  { value: 'priceDesc', label: 'Precio: mayor a menor' },
];

export const CatalogPageContent = () => {
  const [searchParams] = useSearchParams();
  const [pageNumber, setPageNumber] = useState(1);
  const [orderBy, setOrderBy] = useState('');
  const [inputValue, setInputValue] = useState(() => searchParams.get('q') ?? '');
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') ?? '');

  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    setInputValue(q);
    setSearchTerm(q);
    setPageNumber(1);
  }, [searchParams]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, isError } = useProducts({ pageNumber, pageSize: PAGE_SIZE, searchTerm, orderBy });
  const products = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchTerm(inputValue);
      setPageNumber(1);
    }, 380);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [inputValue]);

  const handleOrderChange = (value: string) => {
    setOrderBy(value);
    setPageNumber(1);
  };

  if (isError) {
    return <p style={{ color: waxBrand.color.graphite }}>No se pudo cargar el catalogo.</p>;
  }

  return (
    <section className="catalog-page">
      <header className="catalog-page-header">
        <div className="catalog-page-header-left">
          <span className="catalog-kicker">Colección</span>
          <h1 className="catalog-page-title">Catálogo</h1>
        </div>

        <div className="catalog-page-header-right">
          <input
            className="catalog-filter-input"
            type="search"
            placeholder="Buscar..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <select
            className="catalog-filter-select"
            value={orderBy}
            onChange={(e) => handleOrderChange(e.target.value)}
          >
            {ORDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </header>

      {isLoading ? (
        <div className="catalog-loading">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="catalog-skeleton" />
          ))}
        </div>
      ) : !products.length ? (
        <p className="catalog-empty">
          {searchTerm
            ? 'No hay piezas para esta búsqueda.'
            : 'El catálogo está vacío. Las nuevas piezas aparecerán aquí.'}
        </p>
      ) : (
        <ProductGrid products={products} />
      )}

      {totalPages > 1 && (
        <nav className="catalog-pagination">
          <button
            className="catalog-page-btn"
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber === 1}
          >
            ←
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`catalog-page-btn${n === pageNumber ? ' catalog-page-btn--active' : ''}`}
              onClick={() => setPageNumber(n)}
            >
              {n}
            </button>
          ))}

          <button
            className="catalog-page-btn"
            onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
            disabled={pageNumber === totalPages}
          >
            →
          </button>
        </nav>
      )}
    </section>
  );
};
