import { useCallback, useEffect, useMemo, useState } from "react";

import api from "../services/api";
import { hojeISO, formatarDataCompleta, formatarDataHora } from "../utils/format";
import { mensagemErro } from "../utils/erro";
import { useUsuarioLogado } from "./useUsuarioLogado";


const MAX_NOTIFICACOES = 30;


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


// Transforma treinos e avaliações em uma lista de avisos, do mais novo ao mais antigo
function montarNotificacoes(treinos, agendamentos, hoje) {

    const lista = [];

    for (const t of treinos) {

        if (t.status === "Cancelado") {

            lista.push({
                id: `treino-cancelado-${t.id_treino}`,
                ordem: `${t.data_programada || t.data_criacao}T00:00:00`,
                titulo: `Treino "${t.titulo_treino}" de ${t.nome_aluno} foi cancelado`,
                detalhe: `Criado em ${formatarDataCompleta(t.data_criacao)}`
            });

            continue;
        }

        lista.push({
            id: `treino-criado-${t.id_treino}`,
            ordem: `${t.data_criacao}T00:00:00`,
            titulo: `Treino "${t.titulo_treino}" criado para ${t.nome_aluno}`,
            detalhe: `${quando(t.data_criacao, hoje)} • ${t.quantidade_exercicios ?? 0} exercícios`
        });

        // Treino programado para hoje ou amanhã
        if (t.data_programada) {

            const faltam = emDias(t.data_programada) - emDias(hoje);

            if (faltam === 0 || faltam === 1) {

                lista.push({
                    id: `treino-proximo-${t.id_treino}-${t.data_programada}`,
                    ordem: `${t.data_programada}T00:00:00`,
                    titulo: `${t.nome_aluno} tem treino ${faltam === 0 ? "hoje" : "amanhã"}`,
                    detalhe: `${t.titulo_treino} • ${formatarDataCompleta(t.data_programada)}`
                });
            }
        }
    }

    for (const a of agendamentos) {

        const { dia, hora } = formatarDataHora(a.data_horario);
        const quandoTexto = `${dia} às ${hora}`;
        const passou = a.data_horario.slice(0, 10) < hoje;

        if (a.status === "Agendado" && !passou) {

            lista.push({
                id: `avaliacao-agendada-${a.id_agendamento_avaliacao}`,
                ordem: a.data_horario,
                titulo: `Avaliação agendada com ${a.nome_aluno}`,
                detalhe: quandoTexto
            });

        } else if (a.status === "Agendado" && passou) {

            lista.push({
                id: `avaliacao-pendente-${a.id_agendamento_avaliacao}`,
                ordem: a.data_horario,
                titulo: `Avaliação de ${a.nome_aluno} aguardando a ficha`,
                detalhe: `Era para ${quandoTexto} • preencha a ficha`
            });

        } else if (a.status === "Realizado") {

            lista.push({
                id: `avaliacao-realizada-${a.id_agendamento_avaliacao}`,
                ordem: a.data_horario,
                titulo: `Avaliação de ${a.nome_aluno} realizada`,
                detalhe: quandoTexto
            });

        } else if (a.status === "Cancelado") {

            lista.push({
                id: `avaliacao-cancelada-${a.id_agendamento_avaliacao}`,
                ordem: a.data_horario,
                titulo: `Avaliação com ${a.nome_aluno} foi cancelada`,
                detalhe: quandoTexto
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


export function useNotificacoesProfissional() {

    const usuario = useUsuarioLogado();

    const chaveLidas = `gymtech:notificacoes-lidas:${usuario?.id_usuario ?? "anonimo"}`;

    const [itens, setItens] = useState([]);
    const [lidas, setLidas] = useState(() => new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Carrega a lista de lidas quando já sabemos quem é o usuário
    useEffect(() => {
        setLidas(lerLidas(chaveLidas));
    }, [chaveLidas]);

    useEffect(() => {

        let cancelado = false;

        async function carregar() {

            try {

                setLoading(true);
                setError("");

                const [treinos, agendamentos] = await Promise.all([
                    api.get("/profissionais/me/treinos", {
                        params: { status: "Todos", limit: 500 }
                    }),
                    api.get("/profissionais/me/agendamentos", {
                        params: { status: "Todos", limit: 500 }
                    }).catch((err) => {
                        // Rota inexistente nesta versão da API: segue só com os treinos
                        if (err.response?.status === 404) {
                            return { data: { itens: [] } };
                        }

                        throw err;
                    })
                ]);

                if (!cancelado) {
                    setItens(
                        montarNotificacoes(
                            treinos.data.itens,
                            agendamentos.data.itens,
                            hojeISO()
                        )
                    );
                }

            } catch (err) {

                if (cancelado) return;

                setError(mensagemErro(err, "Não foi possível carregar as notificações."));

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

    return { notificacoes, naoLidas, loading, error, marcarTodasComoLidas };
}