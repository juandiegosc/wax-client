import { createBrowserRouter } from 'react-router';
import { AtelierPage } from '@/pages/AtelierPage';
import { CatalogPage } from '@/pages/CatalogPage';
import { MyCustomProductsPage } from '@/pages/MyCustomProductsPage';
import { CustomProductDetailPage } from '@/pages/CustomProductDetailPage';
import { BasketPage } from '@/pages/BasketPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { CheckoutSuccessPage } from '@/pages/CheckoutSuccessPage';
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
import { SupportTicketPage } from '@/pages/SupportTicketPage';
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
            path: routePaths.myCustomProducts,
            Component: MyCustomProductsPage,
          },
          {
            path: routePaths.customProductDetailPattern,
            Component: CustomProductDetailPage,
          },
          {
            path: routePaths.basket,
            Component: BasketPage,
          },
          {
            path: routePaths.checkout,
            Component: CheckoutPage,
          },
          {
            path: routePaths.checkoutSuccess,
            Component: CheckoutSuccessPage,
          },
          {
            path: routePaths.support,
            Component: SupportPage,
          },
          {
            path: routePaths.supportTicket,
            Component: SupportTicketPage,
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