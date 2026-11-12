import { useEffect, useState } from "react";

import api from "../services/api";
import { hojeISO } from "../utils/format";

const MESES = [
    "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
    "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
];


// Monta a lista dos últimos N meses (o último é o mês atual)
function ultimosMeses(qtd) {

    const hoje = new Date();
    const lista = [];

    for (let i = qtd - 1; i >= 0; i--) {

        const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mes = String(d.getMonth() + 1).padStart(2, "0");

        lista.push({
            chave: `${d.getFullYear()}-${mes}`,   // ex.: "2026-11"
            rotulo: MESES[d.getMonth()],
            total: 0,
            atual: i === 0
        });
    }

    return lista;
}


// Transforma as respostas da API no formato que a tela usa
function montarDashboard(academia, alunosResp, profResp, treinosResp, hoje) {

    const alunos = alunosResp.itens;
    const profissionais = profResp.itens;
    const treinos = treinosResp.itens;


    // Novos alunos por mês (últimos 6 meses)
    const cadastros = ultimosMeses(6);

    for (const aluno of alunos) {

        const mes = cadastros.find(
            (m) => m.chave === aluno.data_cadastro.slice(0, 7)
        );

        if (mes) mes.total += 1;
    }


    // Novos alunos nos últimos 30 dias
    const limite = new Date();
    limite.setDate(limite.getDate() - 30);

    const novos = alunos.filter(
        (a) => new Date(a.data_cadastro) >= limite
    ).length;


    // Modalidades (top 5)
    const contagem = new Map();

    for (const aluno of alunos) {

        const nome = aluno.modalidade_treino || "Não informada";

        contagem.set(nome, (contagem.get(nome) || 0) + 1);
    }

    const modalidades = [...contagem.entries()]
        .map(([nome, total]) => ({ nome, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);


    // Equipe: treinos e alunos de cada profissional
    const porProfissional = new Map();

    for (const t of treinos) {

        const info = porProfissional.get(t.fk_id_profissional) || {
            treinos: 0,
            alunos: new Set()
        };

        info.treinos += 1;
        info.alunos.add(t.fk_id_aluno);

        porProfissional.set(t.fk_id_profissional, info);
    }

    const equipe = profissionais
        .map((p) => {

            const info = porProfissional.get(p.id_usuario);

            return {
                id: p.id_usuario,
                nome: p.nome,
                especialidade: p.especialidade || "Profissional",
                treinos: info ? info.treinos : 0,
                alunos: info ? info.alunos.size : 0
            };
        })
        .sort((a, b) => b.treinos - a.treinos);


    // Próximos treinos da academia (a API já ordena por data)
    const proximos = treinos
        .filter((t) => t.data_programada && t.data_programada >= hoje)
        .slice(0, 5);


    return {
        nome: academia.nome_academia,
        resumo: {
            alunos: alunosResp.total,
            profissionais: profResp.total,
            treinos: treinosResp.total,
            novos
        },
        cadastros,
        modalidades,
        totalAlunos: alunos.length,
        equipe,
        proximos
    };
}


export function useDashboardAcademia() {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        let cancelado = false;

        async function carregar() {

            try {

                setLoading(true);
                setError("");

                // As quatro chamadas rodam ao mesmo tempo
                const [academia, alunos, profissionais, treinos] = await Promise.all([
                    api.get("/academias/me"),
                    api.get("/alunos", { params: { status: "Ativo", limit: 500 } }),
                    api.get("/profissionais", { params: { status: "Ativo", limit: 500 } }),
                    api.get("/treinos", { params: { limit: 500 } })
                ]);

                if (!cancelado) {
                    setData(
                        montarDashboard(
                            academia.data,
                            alunos.data,
                            profissionais.data,
                            treinos.data,
                            hojeISO()
                        )
                    );
                }

            } catch (err) {

                if (cancelado) return;

                const detalhe = err.response?.data?.detail;

                setError(
                    typeof detalhe === "string"
                        ? detalhe
                        : "Não foi possível carregar os dados do dashboard."
                );

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