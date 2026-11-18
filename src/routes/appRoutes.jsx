
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/login/login";
import Register from "../pages/register/register";
import ForgotPassword from "../pages/forgot-password/forgot-password";

import DashboardAluno from "../pages/dashboard/dashboard-aluno";
import DashboardProfissional from "../pages/dashboard/dashboard-profissional";
import DashboardAcademia from "../pages/dashboard/dashboard-academia";

import MeusTreinos from "../pages/dashboard/meus-treinos";
import HistoricoTreinos from "../pages/dashboard/historico-treinos";
import PerfilAluno from "../pages/dashboard/perfil-aluno";
import PerfilProfissional from "../pages/dashboard/perfil-profissional";

import TreinosProfissional from "../pages/treinos/treinos-profissional";
import AlunosProfissional from "../pages/alunos/alunos-profissional";
import NotificacoesProfissional from "../pages/notificacoes/notificacoes-profissional";
import AgendaProfissional from "../pages/agenda/agenda-profissional";

import AgendamentoAula from "../pages/dashboard/agendamento-aula";
import AvaliacaoFisica from "../pages/dashboard/avaliacao-fisica";

import AlunosAcademia from "../pages/dashboard/listar-alunos";
import ListarProfissionais from "../pages/dashboard/listar-profissionais";
import ListarAulas from "../pages/dashboard/listar-aulas";

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

        {/* Agenda do profissional */}
        <Route
          path="/agenda-profissional"
          element={
            <PrivateRoute allowedRoles={["profissional"]}>
              <AgendaProfissional />
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

        {/* Perfil do profissional */}
        <Route
          path="/perfil-profissional"
          element={
            <PrivateRoute allowedRoles={["profissional"]}>
              <PerfilProfissional />
            </PrivateRoute>
          }
        />

        {/* Notificações do profissional */}
        <Route
          path="/notificacoes-profissional"
          element={
            <PrivateRoute allowedRoles={["profissional"]}>
              <NotificacoesProfissional />
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

        {/* Histórico de Treinos */}
        <Route
          path="/historico-treinos"
          element={
            <PrivateRoute allowedRoles={["aluno"]}>
              <HistoricoTreinos />
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

        {/* Agendamento de aula */}
        <Route
          path="/agendamento-aula"
          element={<AgendamentoAula />}
        />

        {/* Avaliação física */}
        <Route
          path="/avaliacao-fisica"
          element={<AvaliacaoFisica />}
        />

        {/* Alunos da academia */}
        <Route
          path="/alunos-academia"
          element={
            <PrivateRoute allowedRoles={["academia"]}>
              <AlunosAcademia />
            </PrivateRoute>
          }
        />

        <Route
          path="/profissionais-academia"
          element={
            <PrivateRoute allowedRoles={["academia"]}>
              <ListarProfissionais />
            </PrivateRoute>
          }
        />

        <Route path="/aulas" element={<ListarAulas />} />

        {/* Qualquer rota inexistente volta para o login */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;

