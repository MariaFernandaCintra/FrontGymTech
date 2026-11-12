import { useEffect, useState } from "react";

import api from "../services/api";
import { mensagemErro } from "../utils/erro";

export function useTreinosProfissional({ status, busca }) {

    const [treinos, setTreinos] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [versao, setVersao] = useState(0);

    useEffect(() => {

        let cancelado = false;

        const timer = setTimeout(async () => {

            try {

                setLoading(true);
                setError("");

                const params = {
                    status,
                    incluir_itens: true,
                    limit: 500
                };

                if (busca.trim()) {
                    params.busca = busca.trim();
                }

                const { data } = await api.get("/profissionais/me/treinos", { params });

                if (!cancelado) {
                    setTreinos(data.itens);
                    setTotal(data.total);
                }

            } catch (err) {

                if (cancelado) return;

                setError(mensagemErro(err, "Não foi possível carregar os treinos."));

                console.error("Erro ao carregar treinos:", err);

            } finally {

                if (!cancelado) {
                    setLoading(false);
                }
            }

        }, 350);

        return () => {
            cancelado = true;
            clearTimeout(timer);
        };

    }, [status, busca, versao]);

    // Chame depois de criar, editar ou cancelar para atualizar a lista
    const recarregar = () => setVersao((v) => v + 1);

    return { treinos, total, loading, error, recarregar };
}