import { useEffect, useState } from "react";

import api from "../services/api";
import { hojeISO } from "../utils/format";
import { mensagemErro } from "../utils/erro";


// Transforma as respostas da API no formato que a tela usa
function montarDashboard(me, treinosResp, hoje) {

    const treinos = treinosResp.itens;

    const treinosHoje = treinos.filter((t) => t.data_programada === hoje);

    const proximos = treinos.filter(
        (t) => t.data_programada && t.data_programada > hoje
    );

    const semData = treinos.filter((t) => !t.data_programada);

    // Agrupa os treinos por aluno
    const porAluno = new Map();

    for (const t of treinos) {

        const aluno = porAluno.get(t.fk_id_aluno) || {
            id: t.fk_id_aluno,
            nome: t.nome_aluno,
            treinos: 0,
            proximo: null
        };

        aluno.treinos += 1;

        if (
            t.data_programada &&
            t.data_programada >= hoje &&
            (!aluno.proximo || t.data_programada < aluno.proximo)
        ) {
            aluno.proximo = t.data_programada;
        }

        porAluno.set(t.fk_id_aluno, aluno);
    }

    const alunos = [...porAluno.values()].sort((a, b) =>
        a.nome.localeCompare(b.nome)
    );

    return {
        nome: me.nome,
        resumo: {
            alunos: alunos.length,
            treinosAtivos: treinos.length,
            treinosHoje: treinosHoje.length,
            semData: semData.length
        },
        treinosHoje,
        proximos: proximos.slice(0, 5),
        alunos
    };
}


export function useDashboardProfissional() {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        let cancelado = false;

        async function carregar() {

            try {

                setLoading(true);
                setError("");

                const [me, treinos] = await Promise.all([
                    api.get("/usuarios/me"),
                    api.get("/profissionais/me/treinos", {
                        params: { limit: 500 }
                    })
                ]);

                if (!cancelado) {
                    setData(montarDashboard(me.data, treinos.data, hojeISO()));
                }

            } catch (err) {

                if (cancelado) return;

                setError(mensagemErro(err, "Não foi possível carregar os dados do dashboard."));

                console.error("Erro ao carregar dashboard:", err);

            } finally {

                if (!cancelado) {
                    setLoading(false);
                }
            }
        }

        carregar();

        return () => {
            cancelado = true;
        };

    }, []);

    return { data, loading, error };
}