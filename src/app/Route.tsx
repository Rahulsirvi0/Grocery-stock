import PrivateRoute from "./components/PrivateRoute";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { AddProduct } from "./pages/AddProduct";
import { UpdateStock } from "./pages/UpdateStock";
import { StockView } from "./pages/StockView";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";

const isLoggedIn = () => {
  return localStorage.getItem("loggedUser");
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: isLoggedIn()
      ? <Navigate to="/dashboard" />
      : <Navigate to="/login" />
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
        path: "profile",
        element: isLoggedIn()
          ? <Navigate to="/profile" />
          : <Login/>
      },
      {
        path: "login",
        element: isLoggedIn()
          ? <Navigate to="/dashboard" />
          : <Login />
      }
    ]
  }
]);