import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import bagBlack01 from '@/assets/images/editorial/bag-black-01.png';
import bagBlackCloudStructured from '@/assets/images/editorial/bag-black-cloud-structured.png';
import bagBlackStuds02 from '@/assets/images/editorial/bag-black-studs-02.png';
import bagWhiteCloud from '@/assets/images/editorial/bag-white-cloud.png';
import { ProductGrid } from '@/features/catalog/components/ProductGrid';
import { useProducts } from '@/features/catalog/hooks/useProducts';
import { waxBrand } from '@/config/brand';
import { routePaths } from '@/routes/routePaths';

const PAGE_SIZE = 9;

const ORDER_OPTIONS = [
  { value: '', label: 'Relevancia' },
  { value: 'name', label: 'Nombre A–Z' },
  { value: 'priceAsc', label: 'Precio: menor a mayor' },
  { value: 'priceDesc', label: 'Precio: mayor a menor' },
];

const catalogEditorialFrames = [
  { label: 'Monocromo', title: 'Siluetas oscuras', image: bagBlack01 },
  { label: 'Textura', title: 'Acabados nubosos', image: bagWhiteCloud },
  { label: 'Detalle', title: 'Acentos con caracter', image: bagBlackStuds02 },
  { label: 'Estructura', title: 'Volumen mas rigido', image: bagBlackCloudStructured },
] as const;

export const CatalogPageContent = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [orderBy, setOrderBy] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, isError } = useProducts({ pageNumber, pageSize: PAGE_SIZE, searchTerm, orderBy });
  const products = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;

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

  const pageButtons = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (isError) {
    return <p style={{ color: waxBrand.color.graphite }}>No se pudo cargar el catalogo.</p>;
  }

  return (
    <section className="catalog-page">
      <header className="catalog-hero" style={{ borderBottom: `1px solid rgba(15, 15, 16, 0.08)` }}>
        <div className="catalog-hero-copy">
          <span className="catalog-kicker">Seleccion curada</span>
          <h1 className="catalog-title">Piezas presentadas con ritmo editorial.</h1>
          <p className="catalog-lead">
            Menos ruido visual, mas imagen y lectura contenida para cada pieza.
          </p>
        </div>

        <div className="catalog-summary" style={{ color: waxBrand.color.graphite }}>
          <span className="catalog-summary-label">Disponibles</span>
          <strong className="catalog-summary-value">{totalCount} piezas</strong>
          <span className="catalog-summary-note">La exploracion comienza en la imagen.</span>
        </div>
      </header>

      <section className="catalog-lookbook">
        <div className="catalog-lookbook-copy">
          <span className="catalog-kicker">Rutas guiadas</span>
          <h2 className="catalog-lookbook-title">Inspiracion primero, busqueda despues.</h2>
          <p className="catalog-lookbook-text">
            Una lectura visual inicial ayuda a entender tonos, volumenes y detalles antes de entrar al grid completo.
          </p>
          <Link to={routePaths.catalog} className="catalog-lookbook-link">
            Ver toda la seleccion
          </Link>
        </div>

        <div className="catalog-lookbook-grid">
          {catalogEditorialFrames.map((frame) => (
            <Link key={frame.title} to={routePaths.catalog} className="catalog-lookbook-card">
              <img className="catalog-lookbook-image" src={frame.image} alt={frame.title} />
              <div className="catalog-lookbook-overlay" />
              <div className="catalog-lookbook-card-copy">
                <span className="catalog-lookbook-label">{frame.label}</span>
                <strong className="catalog-lookbook-card-title">{frame.title}</strong>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="catalog-filters">
        <input
          className="catalog-filter-input"
          type="search"
          placeholder="Buscar pieza..."
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

      {isLoading ? (
        <p style={{ color: waxBrand.color.graphite }}>Cargando catalogo...</p>
      ) : !products.length ? (
        <p style={{ color: waxBrand.color.graphite }}>No hay productos para esta busqueda.</p>
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

          {pageButtons.map((n) => (
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