import { routePaths } from '@/routes/routePaths';

export const waxMenuSections = [
  {
    title: 'Principal',
    items: [
      { label: 'Colección', to: routePaths.catalog, description: 'Selecciones curadas, firmas y ediciones con narrativa' },
      { label: 'Maison', to: routePaths.maison, description: 'Conoce la historia, el proceso y los valores de WAX' },
    ],
  },
  {
    title: 'Servicios',
    items: [
      { label: 'Atelier AI', to: routePaths.atelier, description: 'Punto de partida conversacional para encargos' },
      { label: 'Soporte', to: routePaths.support, description: 'Preguntas, solicitudes y acompañamiento posterior' },
      { label: 'Carrito', to: routePaths.basket, description: 'Revisa las piezas seleccionadas y tu avance' },
    ],
  },
  {
    title: 'Cuenta',
    items: [
      { label: 'Mi perfil', to: routePaths.profile, description: 'Consulta tu información personal y tu dirección guardada' },
      { label: 'Mis pedidos', to: routePaths.myOrders, description: 'Historial y estado de tus compras' },
      { label: 'Mis cotizaciones', to: routePaths.myCustomProducts, description: 'Revisa el estado de tus encargos y propuestas' },
    ],
  },
] as const;

export const waxMenuFooterLinks = [
  { label: 'Hablar con WAX', href: 'mailto:hello@waxatelier.com' },
  { label: 'Envíos y entregas', href: 'mailto:hello@waxatelier.com?subject=Env%C3%ADos%20y%20entregas' },
] as const;
