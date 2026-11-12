
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/login/login";
import Register from "../pages/register/register";
import ForgotPassword from "../pages/forgot-password/forgot-password";

import DashboardAluno from "../pages/dashboard/dashboard-aluno";
import DashboardProfissional from "../pages/dashboard/dashboard-profissional";
import DashboardAcademia from "../pages/dashboard/dashboard-academia";
import MeusTreinos from "../pages/dashboard/meus-treinos";
import PerfilAluno from "../pages/dashboard/perfil-aluno";

import PrivateRoute from "./privateRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Páginas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/esqueceu-senha" element={<ForgotPassword />} />

        {/* Dashboard do aluno */}
        <Route
          path="/dashboard-aluno"
          element={
            <PrivateRoute allowedRoles={["aluno"]}>
              <DashboardAluno />
            </PrivateRoute>
          }
        />

        {/* Dashboard do profissional */}
        <Route
          path="/dashboard-profissional"
          element={
            <PrivateRoute allowedRoles={["profissional"]}>
              <DashboardProfissional />
            </PrivateRoute>
          }
        />

        {/* Dashboard da academia */}
        <Route
          path="/dashboard-academia"
          element={
            <PrivateRoute allowedRoles={["academia"]}>
              <DashboardAcademia />
            </PrivateRoute>
          }
        />

        {/* Página de Meus Treinos */}
        <Route
          path="/meus-treinos"
          element={
            <PrivateRoute allowedRoles={["aluno"]}>
              <MeusTreinos />
            </PrivateRoute>
          }
        />

        {/* Perfil do aluno */}
        <Route
          path="/perfil-aluno"
          element={
            <PrivateRoute allowedRoles={["aluno"]}>
              <PerfilAluno />
            </PrivateRoute>
          }
        />

        {/* Qualquer rota inexistente volta para o login */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
