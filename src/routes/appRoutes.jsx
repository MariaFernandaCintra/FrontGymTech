import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/login/login";
import Register from "../pages/register/register";
import ForgotPassword from "../pages/forgot-password/forgot-password";

import DashboardAluno from "../pages/dashboard/dashboard-aluno";
import DashboardProfissional from "../pages/dashboard/dashboard-profissional";
import DashboardAcademia from "../pages/dashboard/dashboard-academia";
import TreinosProfissional from "../pages/treinos/treinos-profissional";
import AlunosProfissional from "../pages/alunos/alunos-profissional";

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

        {/* Treinos do profissional */}
        <Route
          path="/treinos-profissional"
          element={
            <PrivateRoute allowedRoles={["profissional"]}>
              <TreinosProfissional />
            </PrivateRoute>
          }
        />

        {/* Alunos do profissional */}
        <Route
          path="/alunos-profissional"
          element={
            <PrivateRoute allowedRoles={["profissional"]}>
              <AlunosProfissional />
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

        {/* Qualquer rota inexistente volta para o login */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
