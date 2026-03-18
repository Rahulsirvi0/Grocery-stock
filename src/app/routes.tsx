import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AddProduct } from './pages/AddProduct';
import { UpdateStock } from './pages/UpdateStock';
import { StockView } from './pages/StockView';

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
      }
    ]
  }
]);
