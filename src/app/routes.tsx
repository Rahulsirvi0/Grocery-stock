import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AddProduct } from './pages/AddProduct';
import { UpdateStock } from './pages/UpdateStock';
import { StockView } from './pages/StockView';
import  { Login }  from './pages/Login';
import { Profile } from './pages/Profile';

/**
 * ROUTER CONFIGURATION
 * Defines all application routes
 */
export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: Dashboard
      },
      {
        path: 'add-product',
        Component: AddProduct
      },
      {
        path: 'update-stock',
        Component: UpdateStock
      },
      {
        path: 'stock-view',
        Component: StockView
      },
      {
        path: 'login',
        Component: Login
      },
      {
        path: 'profile',
        Component: Profile
      }
    ]
  }
]);
