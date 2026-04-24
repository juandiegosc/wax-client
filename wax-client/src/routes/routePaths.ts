export const routePaths = {
  home: '/',
  login: '/login',
  register: '/register',
  profile: '/profile',
  catalog: '/catalog',
  productDetails: '/catalog/:id',
  catalogDetails: (id: string) => `/catalog/${id}`,
  atelier: '/atelier-ai',
  basket: '/basket',
  support: '/support',
  notFound: '/not-found',
  serverError: '/server-error',
} as const;