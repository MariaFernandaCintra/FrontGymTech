import { useEffect, useState } from "react";

import api from "../services/api";
import { getUser } from "../services/auth";

// Guarda o usuário na memória, junto com o token dele.
// Se outra pessoa logar na mesma aba, o token muda e o cache é ignorado.
let cache = null;

export function useUsuarioLogado() {

    const token = getUser()?.token;

    const [usuario, setUsuario] = useState(
        cache && cache.token === token ? cache.usuario : null
    );

    useEffect(() => {

        if (cache && cache.token === token) return;

        let cancelado = false;

        api.get("/usuarios/me")
            .then(({ data }) => {

                cache = { token, usuario: data };

                if (!cancelado) {
                    setUsuario(data);
                }
            })
            .catch((err) => {
                console.error("Erro ao carregar o usuário:", err);
            });

        return () => {
            cancelado = true;
        };

    }, [token]);

    return usuario;
}