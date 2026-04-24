import { createBrowserRouter } from 'react-router';
import { AtelierPage } from '@/pages/AtelierPage';
import { CatalogPage } from '@/pages/CatalogPage';
import { BasketPage } from '@/pages/BasketPage';
import { MainLayout } from '@/layouts/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProductDetailsPage } from '@/pages/ProductDetailsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { RegisterPage } from '@/pages/RegisterPage';
import { RouteErrorPage } from '@/pages/RouteErrorPage';
import { RequiredAuth } from '@/routes/RequiredAuth';
import { ServerErrorPage } from '@/pages/ServerErrorPage';
import { SupportPage } from '@/pages/SupportPage';
import { routePaths } from '@/routes/routePaths';
import { LoginPage } from '../pages/LoginPage';

export const router = createBrowserRouter([
  {
    path: routePaths.home,
    Component: MainLayout,
    ErrorBoundary: RouteErrorPage,
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
        path: routePaths.login,
        Component: LoginPage,
      },
      {
        path: routePaths.register,
        Component: RegisterPage,
      },
      {
        Component: RequiredAuth,
        children: [
          {
            path: routePaths.atelier,
            Component: AtelierPage,
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
            path: routePaths.profile,
            Component: ProfilePage,
          },
        ],
      },
      {
        path: routePaths.productDetails,
        Component: ProductDetailsPage,
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