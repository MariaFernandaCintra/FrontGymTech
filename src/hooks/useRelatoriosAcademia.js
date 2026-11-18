import { useEffect, useState } from "react";

import api from "../services/api";
import { hojeISO } from "../utils/format";


// Busca uma lista. Se falhar, devolve vazio em vez de derrubar a página:
// rota inexistente (404) é ignorada; outros erros viram um aviso.
async function buscarLista(rota, params, nome) {

    try {

        const resposta = await api.get(rota, { params });

        return {
            itens: Array.isArray(resposta.data?.itens) ? resposta.data.itens : [],
            falha: null
        };

    } catch (err) {

        console.error(`Erro ao carregar ${nome}:`, err);

        if (err.response?.status === 404) {
            return { itens: [], falha: null };
        }

        return { itens: [], falha: nome };
    }
}


// ------------------------------------------------------------------ datas

function doisDigitos(n) {
    return String(n).padStart(2, "0");
}

// Date local -> "2026-11-18"
function paraISO(data) {
    return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

// "2026-11-18" + (-6) -> "2026-11-12"
function somarDias(iso, dias) {

    const [ano, mes, dia] = iso.split("-").map(Number);
    const data = new Date(ano, mes - 1, dia);

    data.setDate(data.getDate() + dias);

    return paraISO(data);
}

// Agora, no mesmo formato das datas da API (sem fuso): "2026-11-18T14:30:00"
function agoraISO() {

    const d = new Date();

    return `${paraISO(d)}T${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}:${doisDigitos(d.getSeconds())}`;
}

// "2026-11-18T14:30:00" -> "18/11/2026"
export function dataBR(iso) {

    if (!iso) return "";

    const [ano, mes, dia] = iso.slice(0, 10).split("-");

    return `${dia}/${mes}/${ano}`;
}

// "2026-11-18T14:30:00" -> "14:30"
export function horaDe(iso) {

    return iso && iso.includes("T") ? iso.slice(11, 16) : "";
}

function percentual(parte, total) {

    return total > 0 ? Math.round((parte / total) * 100) : null;
}


// ------------------------------------------------------------- relatórios

function montarRelatorios({ alunos, profissionais, aulas, reservas, avaliacoes, treinos }, inicio, hoje, agora) {

    // --------------------------------------------------------------- aulas
    const aulasDadas = aulas.filter((a) => a.status === "Ativa" && a.data_horario <= agora);
    const aulasCanceladas = aulas.filter((a) => a.status === "Cancelada");

    const capacidadeTotal = aulasDadas.reduce((s, a) => s + a.capacidade_maxima, 0);
    const ocupadasTotal = aulasDadas.reduce((s, a) => s + a.vagas_ocupadas, 0);

    const porTipo = new Map();

    for (const aula of aulasDadas) {

        const tipo = aula.tipo_aula || "Sem tipo";
        const atual = porTipo.get(tipo) || { tipo, aulas: 0, capacidade: 0, ocupadas: 0 };

        atual.aulas += 1;
        atual.capacidade += aula.capacidade_maxima;
        atual.ocupadas += aula.vagas_ocupadas;

        porTipo.set(tipo, atual);
    }

    const tipos = [...porTipo.values()]
        .map((t) => ({ ...t, ocupacao: percentual(t.ocupadas, t.capacidade) }))
        .sort((a, b) => (b.ocupacao ?? -1) - (a.ocupacao ?? -1));

    const rankingAulas = aulasDadas
        .filter((a) => a.capacidade_maxima > 0)
        .map((a) => ({
            id: a.id_aula,
            nome: a.nome_aula,
            data: a.data_horario,
            profissional: a.nome_profissional,
            ocupadas: a.vagas_ocupadas,
            capacidade: a.capacidade_maxima,
            ocupacao: Math.round((a.vagas_ocupadas / a.capacidade_maxima) * 100)
        }))
        .sort((a, b) => b.ocupacao - a.ocupacao);

    const quantosMostrar = Math.min(3, Math.floor(rankingAulas.length / 2));

    // -------------------------------------------------------------- alunos
    const reservasFeitas = reservas.filter(
        (r) => r.status === "Confirmado" && r.data_horario_aula <= agora
    );

    const reservasPorAluno = new Map();

    for (const r of reservasFeitas) {

        const atual = reservasPorAluno.get(r.fk_id_aluno) || { id: r.fk_id_aluno, nome: r.nome_aluno, total: 0 };

        atual.total += 1;

        reservasPorAluno.set(r.fk_id_aluno, atual);
    }

    const maisAtivos = [...reservasPorAluno.values()]
        .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome))
        .slice(0, 5);

    const novosAlunos = alunos.filter((a) => {

        const dia = a.data_cadastro.slice(0, 10);

        return dia >= inicio && dia <= hoje;
    });

    // --------------------------------------------------------- avaliações
    const realizadas = avaliacoes.filter((v) => v.status === "Realizado");
    const canceladasAval = avaliacoes.filter((v) => v.status === "Cancelado");
    const semFicha = avaliacoes.filter((v) => v.status === "Agendado" && v.data_horario <= agora);

    const taxaRealizacao = percentual(
        realizadas.length,
        realizadas.length + canceladasAval.length + semFicha.length
    );

    // -------------------------------------------------------------- equipe
    const treinosDoPeriodo = treinos.filter(
        (t) => t.data_criacao >= inicio && t.data_criacao <= hoje
    );

    const equipe = profissionais
        .filter((p) => p.status === "Ativo")
        .map((p) => {

            const alunosAtendidos = new Set([
                ...reservasFeitas.filter((r) => r.fk_id_profissional === p.id_usuario).map((r) => r.fk_id_aluno),
                ...realizadas.filter((v) => v.fk_id_profissional === p.id_usuario).map((v) => v.fk_id_aluno)
            ]);

            return {
                id: p.id_usuario,
                nome: p.nome,
                especialidade: p.especialidade || "Sem especialidade",
                aulas: aulasDadas.filter((a) => a.fk_id_profissional === p.id_usuario).length,
                alunos: alunosAtendidos.size,
                avaliacoes: realizadas.filter((v) => v.fk_id_profissional === p.id_usuario).length,
                treinos: treinosDoPeriodo.filter((t) => t.fk_id_profissional === p.id_usuario).length
            };
        })
        .sort((a, b) => b.aulas - a.aulas || a.nome.localeCompare(b.nome));

    // ----------------------------------------------------------- resultado
    return {

        aulas: {
            dadas: aulasDadas.length,
            canceladas: aulasCanceladas.length,
            ocupacaoMedia: percentual(ocupadasTotal, capacidadeTotal),
            tipos,
            maisCheias: rankingAulas.slice(0, quantosMostrar),
            maisVazias: quantosMostrar > 0 ? rankingAulas.slice(-quantosMostrar).reverse() : [],

            csv: {
                cabecalho: ["Data", "Hora", "Aula", "Tipo", "Profissional", "Status", "Capacidade", "Vagas ocupadas"],
                linhas: [...aulas]
                    .sort((a, b) => a.data_horario.localeCompare(b.data_horario))
                    .map((a) => [
                        dataBR(a.data_horario), horaDe(a.data_horario), a.nome_aula, a.tipo_aula,
                        a.nome_profissional, a.status, a.capacidade_maxima, a.vagas_ocupadas
                    ])
            }
        },

        alunos: {
            ativos: alunos.filter((a) => a.status === "Ativo").length,
            inativos: alunos.filter((a) => a.status !== "Ativo").length,
            novos: novosAlunos.length,
            maisAtivos,

            csv: {
                cabecalho: ["Aluno", "Status", "Data de cadastro", "Reservas no período"],
                linhas: [...alunos]
                    .sort((a, b) => a.nome.localeCompare(b.nome))
                    .map((a) => [
                        a.nome, a.status, dataBR(a.data_cadastro),
                        reservasPorAluno.get(a.id_usuario)?.total || 0
                    ])
            }
        },

        avaliacoes: {
            realizadas: realizadas.length,
            canceladas: canceladasAval.length,
            semFicha: semFicha.length,
            taxaRealizacao,

            csv: {
                cabecalho: ["Data", "Hora", "Aluno", "Profissional", "Status", "Ficha preenchida"],
                linhas: [...avaliacoes]
                    .sort((a, b) => a.data_horario.localeCompare(b.data_horario))
                    .map((v) => [
                        dataBR(v.data_horario), horaDe(v.data_horario), v.nome_aluno,
                        v.nome_profissional, v.status, v.possui_ficha ? "Sim" : "Não"
                    ])
            }
        },

        equipe: {
            itens: equipe,

            csv: {
                cabecalho: ["Profissional", "Especialidade", "Aulas dadas", "Alunos atendidos", "Avaliações realizadas", "Treinos criados"],
                linhas: equipe.map((p) => [p.nome, p.especialidade, p.aulas, p.alunos, p.avaliacoes, p.treinos])
            }
        }
    };
}


export function useRelatoriosAcademia(dias) {

    const [nomeAcademia, setNomeAcademia] = useState("Academia");
    const [relatorios, setRelatorios] = useState(null);
    const [periodo, setPeriodo] = useState(null);
    const [avisos, setAvisos] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        let cancelado = false;

        async function carregar() {

            try {

                setLoading(true);
                setError("");

                const hoje = hojeISO();
                const inicio = somarDias(hoje, -(dias - 1));
                const agora = agoraISO();

                const paginacao = { limit: 500, offset: 0 };
                const intervalo = { data_de: inicio, data_ate: hoje };

                const [academia, alunos, profissionais, aulas, reservas, avaliacoes, treinos] =
                    await Promise.all([
                        api.get("/academias/me").then((r) => r.data).catch(() => null),

                        buscarLista("/alunos", paginacao, "alunos"),

                        buscarLista("/profissionais", paginacao, "profissionais"),

                        buscarLista("/aulas", { status: "Todas", ...intervalo, ...paginacao }, "aulas"),

                        buscarLista("/reservas-aulas", { status: "Confirmado", ...intervalo, ...paginacao }, "reservas"),

                        buscarLista("/agendamentos-avaliacoes", { status: "Todos", ...intervalo, ...paginacao }, "avaliações"),

                        buscarLista("/treinos", { status: "Todos", ...paginacao }, "treinos")
                    ]);

                if (cancelado) return;

                if (academia?.nome_academia) {
                    setNomeAcademia(academia.nome_academia);
                }

                setRelatorios(
                    montarRelatorios(
                        {
                            alunos: alunos.itens,
                            profissionais: profissionais.itens,
                            aulas: aulas.itens,
                            reservas: reservas.itens,
                            avaliacoes: avaliacoes.itens,
                            treinos: treinos.itens
                        },
                        inicio,
                        hoje,
                        agora
                    )
                );

                setPeriodo({ inicio, hoje });

                const falhas = [alunos, profissionais, aulas, reservas, avaliacoes, treinos]
                    .map((r) => r.falha)
                    .filter(Boolean);

                setAvisos(
                    falhas.length > 0
                        ? `Não foi possível carregar: ${falhas.join(", ")}. Os números abaixo podem estar incompletos.`
                        : ""
                );

            } catch (err) {

                if (cancelado) return;

                setError("Não foi possível gerar os relatórios.");

                console.error("Erro ao gerar relatórios:", err);

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

    }, [dias]);

    return { nomeAcademia, relatorios, periodo, avisos, loading, error };
}