import { Link } from 'react-router';
import { routePaths } from '@/routes/routePaths';
import bagBlack01 from '@/assets/images/editorial/bag-black-01.png';
import bagBlackCloudStructured from '@/assets/images/editorial/bag-black-cloud-structured.png';
import bagBlackStuds02 from '@/assets/images/editorial/bag-black-studs-02.png';
import bagWhiteCloud from '@/assets/images/editorial/bag-white-cloud.png';
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

const editorialStudies = [
  {
    title: 'Noir Silhouette',
    image: bagBlack01,
    tone: 'Estudio 01',
  },
  {
    title: 'Cloud Veil',
    image: bagWhiteCloud,
    tone: 'Estudio 02',
  },
  {
    title: 'Spike Accent',
    image: bagBlackStuds02,
    tone: 'Estudio 03',
  },
  {
    title: 'Seduction Structure',
    image: bagBlackCloudStructured,
    tone: 'Estudio 04',
  },
] as const;

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
              <span className="home-campaign-label">Coleccion Umbral</span>
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

      <section className="home-editorial-section">
        <div className="home-editorial-header">
          <span className="home-editorial-kicker">Coleccion Umbral</span>
          <h2 className="home-editorial-title"> COLECCIÓN UMBRAL </h2>
        </div>

        <div className="home-editorial-grid">
          {editorialStudies.map((study, index) => (
            <Link
              key={study.title}
              to={routePaths.catalog}
              className={`home-editorial-card ${index === 0 ? 'home-editorial-card-featured' : ''}`}
            >
              <img className="home-editorial-card-image" src={study.image} alt={study.title} />
              <div className="home-editorial-card-overlay" />
              <div className="home-editorial-card-copy">
                <span className="home-editorial-card-tone">{study.tone}</span>
                <strong className="home-editorial-card-title">{study.title}</strong>
              </div>
            </Link>
          ))}
        </div>
      </section>

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
