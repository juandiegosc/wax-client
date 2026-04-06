export const routePaths = {
  home: '/',
  catalog: '/catalog',
  productDetails: '/catalog/:id',
  catalogDetails: (id: string) => `/catalog/${id}`,
  basket: '/basket',
  support: '/support',
  notFound: '/not-found',
  serverError: '/server-error',
} as const;