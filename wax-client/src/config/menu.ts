import { routePaths } from '@/routes/routePaths';

export const waxMenuSections = [
  {
    title: 'Principal',
    items: [
      { label: 'Novedades', to: routePaths.catalog, description: 'Piezas recientes y lanzamientos destacados' },
      { label: 'Colecciones', description: 'Selecciones curadas, firmas y ediciones con narrativa' },
    ],
  },
  {
    title: 'Servicios',
    items: [
      { label: 'Atelier AI', to: routePaths.atelier, description: 'Punto de partida conversacional para encargos' },
      { label: 'Soporte', to: routePaths.support, description: 'Preguntas, solicitudes y acompanamiento posterior' },
      { label: 'Carrito', to: routePaths.basket, description: 'Revisa las piezas seleccionadas y tu avance' },
    ],
  },
] as const;

export const waxMenuFooterLinks = [
  { label: 'Podemos ayudarte', value: '...', href: '...' },
  { label: 'Contactanos', href: 'mailto:hello@waxatelier.com' },
  { label: 'Envios y entregas' },
] as const;