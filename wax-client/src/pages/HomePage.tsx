import { Link } from 'react-router';
import { routePaths } from '@/routes/routePaths';
import { useProducts } from '@/features/catalog/hooks/useProducts';
import homePageMainImage from '@/assets/images/editorial/HOME_PAGE_MAIN.png';

type HomeFooterLink =
  | { label: string; to: string }
  | { label: string; href: string };

type HomeServiceBlock = {
  title: string;
  description: string;
  ctaLabel: string;
  link: HomeFooterLink;
};

type HomeFooterColumn = {
  title: string;
  description?: string;
  links: HomeFooterLink[];
};

const homeServiceBlocks: HomeServiceBlock[] = [
  {
    title: 'Atelier AI',
    description: 'Nos compartes tu idea, desarrollamos el modelo, revisas la propuesta, apruebas la pieza y avanzas al pago para producirla.',
    ctaLabel: 'Iniciar encargo',
    link: { label: 'Iniciar encargo', to: routePaths.atelier },
  },
  {
    title: 'Compra de coleccion',
    description: 'Exploras piezas ya disponibles, eliges la que quieres, confirmas la compra y coordinamos el envio desde Ecuador.',
    ctaLabel: 'Ver coleccion',
    link: { label: 'Ver coleccion', to: routePaths.catalog },
  },
] as const;

const homeFooterColumns: HomeFooterColumn[] = [
  {
    title: 'Ayuda',
    description: 'Asistencia para pedidos, tiempos de entrega y acompanamiento en compras privadas.',
    links: [
      { label: 'Hablar con WAX', href: 'mailto:hello@waxatelier.com' },
      { label: 'Soporte', to: routePaths.support },
    ],
  },
  {
    title: 'Servicios',
    links: [
      { label: 'Atelier AI', to: routePaths.atelier },
      { label: 'Coleccion Umbral', to: routePaths.catalog },
      { label: 'Carrito', to: routePaths.basket },
    ],
  },
  {
    title: 'Maison',
    links: [
      { label: 'Explorar piezas', to: routePaths.catalog },
      { label: 'Cuenta', to: routePaths.login },
      { label: 'Contacto', href: 'mailto:hello@waxatelier.com' },
    ],
  },
] as const;

export const HomePage = () => {
  const { data: meta } = useProducts({ pageSize: 1 });
  const totalCount = meta?.totalCount ?? 0;

  // Última página de 4 para traer los más recientes (los nuevos van al final).
  const lastPage = totalCount > 0 ? Math.ceil(Math.max(1, totalCount - 3) / 4) : 1;
  const { data, isLoading, isError } = useProducts(
    { pageSize: 4, pageNumber: lastPage },
    { enabled: totalCount > 0 },
  );

  const featuredProducts = data?.items ?? [];
  const showSection = isLoading || (!isError && featuredProducts.length > 0);

  return (
    <section className="home-page">
      <section className="home-campaign-shell">
        <div className="home-campaign">
          <img
            className="home-campaign-image"
            src={homePageMainImage}
            alt="Bolso escultorico negro presentado en una composicion editorial de WAX"
          />

          <div aria-hidden className="home-campaign-overlay" />

          <div className="home-campaign-content">
            <div className="home-campaign-copy">
              <span className="home-campaign-label">STUDIO</span>
              <h1 className="home-campaign-title">
                Diseñado para tu <em>identidad</em>
              </h1>

              <div className="home-campaign-actions">
                <Link to={routePaths.catalog} className="home-campaign-action home-campaign-action-primary">
                  Ver seleccion
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showSection && (
        <section className="home-editorial-section">
          <div className="home-editorial-header">
            <span className="home-editorial-kicker">New Studio Collection</span>
            <h2 className="home-editorial-title">COLECCIÓN UMBRAL</h2>
          </div>

          <div className="home-editorial-grid">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`home-editorial-card home-editorial-card-skeleton ${i === 0 ? 'home-editorial-card-featured' : ''}`}
                  />
                ))
              : featuredProducts.map((product, index) => (
                  <Link
                    key={product.id}
                    to={routePaths.catalogDetails(product.id)}
                    className={`home-editorial-card ${index === 0 ? 'home-editorial-card-featured' : ''}`}
                  >
                    <img className="home-editorial-card-image" src={product.pictureUrl} alt={product.name} />
                    <div className="home-editorial-card-overlay" />
                    <div className="home-editorial-card-copy">
                      <span className="home-editorial-card-tone">{product.type}</span>
                      <strong className="home-editorial-card-title">{product.name}</strong>
                    </div>
                  </Link>
                ))}
          </div>
        </section>
      )}

      <section className="home-service-strip">
        <div className="home-service-grid">
          {homeServiceBlocks.map((block) => {
            const primaryLink = block.link;

            return (
              <article key={block.title} className="home-service-card">
                <span className="home-service-heading">{block.title}</span>
                <p className="home-service-description">{block.description}</p>
                {'to' in primaryLink ? (
                  <Link to={primaryLink.to} className="home-service-link">
                    {block.ctaLabel}
                  </Link>
                ) : (
                  <a href={primaryLink.href} className="home-service-link">
                    {block.ctaLabel}
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer-columns">
          {homeFooterColumns.map((column) => (
            <section key={column.title} className="home-footer-column">
              <span className="home-footer-heading">{column.title}</span>
              {column.description ? <p className="home-footer-description">{column.description}</p> : null}
              <div className="home-footer-links">
                {column.links.map((link) =>
                  'to' in link ? (
                    <Link key={link.label} to={link.to} className="home-footer-link">
                      {link.label}
                    </Link>
                  ) : (
                    <a key={link.label} href={link.href} className="home-footer-link">
                      {link.label}
                    </a>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>

        <div className="home-footer-bottom">
          <div className="home-footer-region">Envios desde Ecuador</div>
          <strong className="home-footer-wordmark">WAX</strong>
          <div className="home-footer-legal">
            <Link to={routePaths.support} className="home-footer-legal-link">
              Soporte
            </Link>
            <Link to={routePaths.catalog} className="home-footer-legal-link">
              Coleccion
            </Link>
            <Link to={routePaths.login} className="home-footer-legal-link">
              Cuenta
            </Link>
          </div>
        </div>
      </footer>
    </section>
  );
};
