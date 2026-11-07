import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/login/login";
import Register from "../pages/register/register";
import ForgotPassword from "../pages/forgot-password/forgot-password";
import Dashboard from "../pages/dashboard/dashboard";

import PrivateRoute from "./privateRoute";

function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />

        <Route path="/cadastro" element={<Register />} />

        <Route path="/esqueceu-senha" element={<ForgotPassword />} />

        {/* Dashboard do cliente: somente perfil "cliente" */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={["cliente"]}>
              <Dashboard />
            </PrivateRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default AppRoutes;
