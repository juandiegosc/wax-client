import { createBrowserRouter } from 'react-router';
import { CatalogPage } from '@/pages/CatalogPage';
import { BasketPage } from '@/pages/BasketPage';
import { MainLayout } from '@/layouts/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProductDetailsPage } from '@/pages/ProductDetailsPage';
import { ServerErrorPage } from '@/pages/ServerErrorPage';
import { SupportPage } from '@/pages/SupportPage';
import { routePaths } from '@/routes/routePaths';

export const router = createBrowserRouter([
  {
    path: routePaths.home,
    Component: MainLayout,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: routePaths.catalog,
        Component: CatalogPage,
      },
      {
        path: routePaths.productDetails,
        Component: ProductDetailsPage,
      },
      {
        path: routePaths.basket,
        Component: BasketPage,
      },
      {
        path: routePaths.support,
        Component: SupportPage,
      },
      {
        path: routePaths.notFound,
        Component: NotFoundPage,
      },
      {
        path: routePaths.serverError,
        Component: ServerErrorPage,
      },
    ],
  },
]);