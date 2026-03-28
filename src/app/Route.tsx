import PrivateRoute from "./components/PrivateRoute";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { AddProduct } from "./pages/AddProduct";
import { UpdateStock } from "./pages/UpdateStock";
import { StockView } from "./pages/StockView";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Profile } from "./pages/Profile";
import Billing from "./pages/Bill";

// Remove the isLoggedIn function - let PrivateRoute handle it
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/signup",
    element: <Signup />
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "dashboard",
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        )
      },
      {
        path: "add-product",
        element: (
          <PrivateRoute>
            <AddProduct />
          </PrivateRoute>
        )
      },
      {
        path: "update-stock",
        element: (
          <PrivateRoute>
            <UpdateStock />
          </PrivateRoute>
        )
      },
      {
        path: "stock-view",
        element: (
          <PrivateRoute>
            <StockView />
          </PrivateRoute>
        )
      },
      {
        path: "billing",
        element: (
          <PrivateRoute>
            <Billing />
          </PrivateRoute>
        )
      }, 
      {
        path: "profile",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        )
      }
    ]
  }
]);