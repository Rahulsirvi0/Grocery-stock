import { RouterProvider } from 'react-router-dom';
import { router } from './Route';

/**
 * GROCERY STOCK MANAGEMENT SYSTEM
 * Main Application Entry Point
 * 
 * Features:
 * - Real-time dashboard with statistics
 * - Add new products with validation
 * - Update stock quantities dynamically
 * - View all products in animated table
 * - Automatic status calculation (Available/Low Stock/Out of Stock)
 * - LocalStorage persistence
 * - Premium glassmorphism UI
 * - Fully responsive design
 */
export default function App() {
  return <RouterProvider router={router} />;
}
