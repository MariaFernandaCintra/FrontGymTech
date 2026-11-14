import { useEffect, useState } from "react";

import api from "../services/api";
import { hojeISO } from "../utils/format";
import { mensagemErro } from "../utils/erro";


// Une os alunos que aparecem nos treinos e nas reservas de aula do profissional
function montarAlunos(treinos, reservas, hoje) {

    const mapa = new Map();

    const obter = (id, nome) => {

        if (!mapa.has(id)) {
            mapa.set(id, { id, nome, treinos: [], aulas: [] });
        }

        return mapa.get(id);
    };

    for (const t of treinos) {
        obter(t.fk_id_aluno, t.nome_aluno).treinos.push(t);
    }

    for (const r of reservas) {
        obter(r.fk_id_aluno, r.nome_aluno).aulas.push(r);
    }

    return [...mapa.values()]
        .map((aluno) => {

            const ativos = aluno.treinos.filter((t) => t.status === "Ativo");

            const proximoTreino = ativos
                .map((t) => t.data_programada)
                .filter((d) => d && d >= hoje)
                .sort()[0] || null;

            // Ativos primeiro; dentro de cada grupo, por data (sem data por último)
            const treinos = [...aluno.treinos].sort((a, b) => {

                if (a.status !== b.status) {
                    return a.status === "Ativo" ? -1 : 1;
                }

                return (a.data_programada || "9999").localeCompare(b.data_programada || "9999");
            });

            const aulas = [...aluno.aulas].sort((a, b) =>
                a.data_horario_aula.localeCompare(b.data_horario_aula)
            );

            const proximaAula = aulas
                .map((r) => r.data_horario_aula)
                .find((d) => d.slice(0, 10) >= hoje) || null;

            return {
                id: aluno.id,
                nome: aluno.nome,
                treinos,
                aulas,
                treinosAtivos: ativos.length,
                proximoTreino,
                proximaAula
            };
        })
        .sort((a, b) => a.nome.localeCompare(b.nome));
}


export function useAlunosProfissional() {

    const [alunos, setAlunos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        let cancelado = false;

        async function carregar() {

            try {

                setLoading(true);
                setError("");

                const [treinos, reservas] = await Promise.all([
                    api.get("/profissionais/me/treinos", {
                        params: { status: "Todos", limit: 500 }
                    }),
                    api.get("/profissionais/me/reservas-aulas", {
                        params: { status: "Confirmado", limit: 500 }
                    })
                ]);

                if (!cancelado) {
                    setAlunos(
                        montarAlunos(treinos.data.itens, reservas.data.itens, hojeISO())
                    );
                }

            } catch (err) {

                if (cancelado) return;

                setError(mensagemErro(err, "Não foi possível carregar os alunos."));

                console.error("Erro ao carregar alunos:", err);

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

    return { alunos, loading, error };
}