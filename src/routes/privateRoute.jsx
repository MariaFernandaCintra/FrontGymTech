import { Navigate } from "react-router-dom";

import { getUser } from "../services/auth";

// =========================
// ROTA PROTEGIDA POR PERFIL
// =========================
// Só renderiza a tela se houver usuário logado E o perfil dele
// estiver na lista "allowedRoles". Qualquer outro caso volta ao login.
//
// Atenção: essa trava é só da interface. A segurança de verdade
// (quem pode ver quais dados) precisa ser validada também no back-end.

function PrivateRoute({ allowedRoles, children }) {

    const user = getUser();

    if (!user || !allowedRoles.includes(user.perfil)) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default PrivateRoute;
