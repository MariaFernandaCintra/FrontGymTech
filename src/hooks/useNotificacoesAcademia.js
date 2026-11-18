import { useCallback, useEffect, useMemo, useState } from "react";

import api from "../services/api";
import { hojeISO, formatarDataCompleta, formatarDataHora } from "../utils/format";


const MAX_NOTIFICACOES = 40;
const DIAS_RECENTES = 7;


// "2026-11-15" -> número de dias (para comparar datas sem se perder com fuso)
function emDias(iso) {

    const [ano, mes, dia] = iso.slice(0, 10).split("-").map(Number);

    return Math.round(new Date(ano, mes - 1, dia).getTime() / 86400000);
}


// "2026-11-14" -> "Ontem", "Há 3 dias", "Hoje", "Amanhã", "Em 2 dias"
function quando(iso, hoje) {

    const diferenca = emDias(iso) - emDias(hoje);

    if (diferenca === 0) return "Hoje";
    if (diferenca === -1) return "Ontem";
    if (diferenca === 1) return "Amanhã";
    if (diferenca < 0) return `Há ${-diferenca} dias`;

    return `Em ${diferenca} dias`;
}

// true se a data está nos últimos N dias (e não é futura)
function eRecente(iso, hoje, dias = DIAS_RECENTES) {

    const idade = emDias(hoje) - emDias(iso);

    return idade >= 0 && idade <= dias;
}


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


// Transforma os dados da academia em avisos, do mais novo ao mais antigo
function montarNotificacoes({ alunos, profissionais, aulas, avaliacoes, treinos }, hoje) {

    const lista = [];

    // ------------------------------------------------------------ cadastros
    for (const a of alunos) {

        if (a.status !== "Ativo" || !eRecente(a.data_cadastro, hoje)) continue;

        lista.push({
            id: `aluno-novo-${a.id_usuario}`,
            ordem: a.data_cadastro,
            titulo: `Novo aluno cadastrado: ${a.nome}`,
            detalhe: `${quando(a.data_cadastro, hoje)}${a.objetivo ? ` • Objetivo: ${a.objetivo}` : ""}`
        });
    }

    for (const p of profissionais) {

        if (p.status !== "Ativo" || !eRecente(p.data_cadastro, hoje)) continue;

        lista.push({
            id: `profissional-novo-${p.id_usuario}`,
            ordem: p.data_cadastro,
            titulo: `Novo profissional cadastrado: ${p.nome}`,
            detalhe: `${quando(p.data_cadastro, hoje)}${p.especialidade ? ` • ${p.especialidade}` : ""}`
        });
    }

    // ---------------------------------------------------------------- aulas
    for (const aula of aulas) {

        const { dia, hora } = formatarDataHora(aula.data_horario);
        const faltam = emDias(aula.data_horario) - emDias(hoje);

        if (aula.vagas_disponiveis === 0) {

            lista.push({
                id: `aula-lotada-${aula.id_aula}`,
                ordem: aula.data_horario,
                titulo: `Aula "${aula.nome_aula}" está lotada`,
                detalhe: `${dia} às ${hora} • ${aula.nome_profissional}`
            });

        } else if (aula.vagas_ocupadas === 0 && faltam >= 0 && faltam <= 2) {

            lista.push({
                id: `aula-vazia-${aula.id_aula}`,
                ordem: aula.data_horario,
                titulo: `Aula "${aula.nome_aula}" ainda não tem reservas`,
                detalhe: `${quando(aula.data_horario, hoje)}, ${hora} • ${aula.nome_profissional}`
            });
        }
    }

    // ----------------------------------------------------------- avaliações
    for (const v of avaliacoes) {

        const { dia, hora } = formatarDataHora(v.data_horario);
        const quandoTexto = `${dia} às ${hora}`;
        const faltam = emDias(v.data_horario) - emDias(hoje);

        if (v.status === "Agendado" && faltam >= 0 && faltam <= 2) {

            lista.push({
                id: `avaliacao-proxima-${v.id_agendamento_avaliacao}`,
                ordem: v.data_horario,
                titulo: `Avaliação de ${v.nome_aluno} ${faltam === 0 ? "hoje" : faltam === 1 ? "amanhã" : "em breve"}`,
                detalhe: `${quandoTexto} • ${v.nome_profissional}`
            });

        } else if (v.status === "Agendado" && faltam < 0) {

            lista.push({
                id: `avaliacao-pendente-${v.id_agendamento_avaliacao}`,
                ordem: v.data_horario,
                titulo: `Avaliação de ${v.nome_aluno} está sem ficha`,
                detalhe: `${quandoTexto} • ${v.nome_profissional} ainda não preencheu`
            });

        } else if (v.status === "Cancelado" && (faltam > 0 || eRecente(v.data_horario, hoje, 30))) {

            lista.push({
                id: `avaliacao-cancelada-${v.id_agendamento_avaliacao}`,
                ordem: v.data_horario,
                titulo: `Avaliação de ${v.nome_aluno} foi cancelada`,
                detalhe: `${quandoTexto} • ${v.nome_profissional}`
            });

        } else if (v.status === "Realizado" && eRecente(v.data_horario, hoje)) {

            lista.push({
                id: `avaliacao-realizada-${v.id_agendamento_avaliacao}`,
                ordem: v.data_horario,
                titulo: `Avaliação de ${v.nome_aluno} realizada`,
                detalhe: `${quandoTexto} • ${v.nome_profissional}`
            });
        }
    }

    // -------------------------------------------------------------- treinos
    for (const t of treinos) {

        if (t.status === "Cancelado") {

            lista.push({
                id: `treino-cancelado-${t.id_treino}`,
                ordem: `${t.data_programada || t.data_criacao}T00:00:00`,
                titulo: `Treino "${t.titulo_treino}" de ${t.nome_aluno} foi cancelado`,
                detalhe: `Profissional: ${t.nome_profissional} • criado em ${formatarDataCompleta(t.data_criacao)}`
            });

        } else if (eRecente(t.data_criacao, hoje)) {

            lista.push({
                id: `treino-criado-${t.id_treino}`,
                ordem: `${t.data_criacao}T00:00:00`,
                titulo: `Treino "${t.titulo_treino}" criado para ${t.nome_aluno}`,
                detalhe: `${quando(t.data_criacao, hoje)} • ${t.nome_profissional}`
            });
        }
    }

    return lista
        .sort((a, b) => b.ordem.localeCompare(a.ordem))
        .slice(0, MAX_NOTIFICACOES);
}


// Guarda no navegador quais avisos já foram vistos
function lerLidas(chave) {

    try {
        return new Set(JSON.parse(localStorage.getItem(chave) || "[]"));
    } catch {
        return new Set();
    }
}

function salvarLidas(chave, ids) {

    try {
        localStorage.setItem(chave, JSON.stringify([...ids]));
    } catch {
        console.error("Não foi possível salvar as notificações lidas.");
    }
}


export function useNotificacoesAcademia() {

    const [academia, setAcademia] = useState(null);
    const [itens, setItens] = useState([]);
    const [lidas, setLidas] = useState(() => new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const chaveLidas = `gymtech:notificacoes-lidas:academia-${academia?.id_academia ?? "anonima"}`;

    // Carrega a lista de lidas quando já sabemos qual é a academia
    useEffect(() => {
        setLidas(lerLidas(chaveLidas));
    }, [chaveLidas]);

    useEffect(() => {

        let cancelado = false;

        async function carregar() {

            try {

                setLoading(true);
                setError("");

                const paginacao = { limit: 500, offset: 0 };

                const [dadosAcademia, alunos, profissionais, aulas, avaliacoes, treinos] =
                    await Promise.all([
                        api.get("/academias/me").then((r) => r.data).catch(() => null),

                        buscarLista("/alunos", { status: "Ativo", ...paginacao }, "alunos"),

                        buscarLista("/profissionais", { status: "Ativo", ...paginacao }, "profissionais"),

                        buscarLista(
                            "/aulas",
                            { status: "Ativa", futuras: true, ...paginacao },
                            "aulas"
                        ),

                        buscarLista(
                            "/agendamentos-avaliacoes",
                            { status: "Todos", ...paginacao },
                            "avaliações"
                        ),

                        buscarLista("/treinos", { status: "Todos", ...paginacao }, "treinos")
                    ]);

                if (cancelado) return;

                setAcademia(dadosAcademia);

                setItens(
                    montarNotificacoes(
                        {
                            alunos: alunos.itens,
                            profissionais: profissionais.itens,
                            aulas: aulas.itens,
                            avaliacoes: avaliacoes.itens,
                            treinos: treinos.itens
                        },
                        hojeISO()
                    )
                );

                const falhas = [alunos, profissionais, aulas, avaliacoes, treinos]
                    .map((r) => r.falha)
                    .filter(Boolean);

                if (falhas.length > 0) {
                    setError(`Não foi possível carregar: ${falhas.join(", ")}.`);
                }

            } catch (err) {

                if (cancelado) return;

                setError("Não foi possível carregar as notificações.");

                console.error("Erro ao carregar notificações:", err);

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

    const notificacoes = useMemo(
        () => itens.map((n) => ({ ...n, nova: !lidas.has(n.id) })),
        [itens, lidas]
    );

    const naoLidas = notificacoes.filter((n) => n.nova).length;

    const marcarTodasComoLidas = useCallback(() => {

        const todas = new Set([...lidas, ...itens.map((n) => n.id)]);

        setLidas(todas);
        salvarLidas(chaveLidas, todas);

    }, [lidas, itens, chaveLidas]);

    return {
        nomeAcademia: academia?.nome_academia || "Academia",
        notificacoes,
        naoLidas,
        loading,
        error,
        marcarTodasComoLidas
    };
}