import { useEffect, useState } from "react";

import api from "../services/api";
import { hojeISO } from "../utils/format";
import { mensagemErro } from "../utils/erro";


const DIAS_NA_GRADE = 7;


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

// Date local -> "2026-11-18"
function paraISO(data) {

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

// "quinta-feira" -> "Quinta-feira"
function capitalizar(texto) {

    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Monta os próximos N dias: Hoje, Amanhã, Sexta-feira (20/11)...
function montarDias(hoje) {

    const [ano, mes, dia] = hoje.split("-").map(Number);
    const base = new Date(ano, mes - 1, dia);

    return Array.from({ length: DIAS_NA_GRADE }, (_, i) => {

        const data = new Date(base);
        data.setDate(base.getDate() + i);

        const chave = paraISO(data);
        const diaMes = `${String(data.getDate()).padStart(2, "0")}/${String(data.getMonth() + 1).padStart(2, "0")}`;

        let rotulo;

        if (i === 0) {
            rotulo = `Hoje (${diaMes})`;
        } else if (i === 1) {
            rotulo = `Amanhã (${diaMes})`;
        } else {
            rotulo = `${capitalizar(data.toLocaleDateString("pt-BR", { weekday: "long" }))} (${diaMes})`;
        }

        return { chave, rotulo, aulas: [] };
    });
}


// Transforma as respostas da API no formato que a tela usa
function montarDados({ academia, alunos, profissionais, aulas }, hoje) {

    // ---------------------------------------------------------------- grade
    const dias = montarDias(hoje);
    const porDia = new Map(dias.map((d) => [d.chave, d]));

    for (const aula of aulas) {

        const dia = porDia.get(aula.data_horario.slice(0, 10));

        if (dia) {
            dia.aulas.push(aula);
        }
    }

    for (const dia of dias) {
        dia.aulas.sort((a, b) => a.data_horario.localeCompare(b.data_horario));
    }

    const aulasDaSemana = dias.flatMap((d) => d.aulas);

    const capacidadeTotal = aulasDaSemana.reduce((soma, a) => soma + a.capacidade_maxima, 0);
    const ocupadasTotal = aulasDaSemana.reduce((soma, a) => soma + a.vagas_ocupadas, 0);

    const ocupacao = capacidadeTotal > 0
        ? Math.round((ocupadasTotal / capacidadeTotal) * 100)
        : null;

    // --------------------------------------------------------------- equipe
    const aulasPorProfissional = new Map();

    for (const aula of aulas) {
        aulasPorProfissional.set(
            aula.fk_id_profissional,
            (aulasPorProfissional.get(aula.fk_id_profissional) || 0) + 1
        );
    }

    const equipe = profissionais
        .filter((p) => p.status === "Ativo")
        .map((p) => ({
            id: p.id_usuario,
            nome: p.nome,
            especialidade: p.especialidade || "Sem especialidade",
            registro: p.registro_profissional,
            aulas: aulasPorProfissional.get(p.id_usuario) || 0
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome));

    // ------------------------------------------------------------- resumo
    return {
        nome: academia.nome_academia,
        endereco: academia.endereco,
        telefone: academia.telefone,
        cnpj: academia.cnpj,
        email: academia.email_corporativo,

        resumo: {
            alunosAtivos: alunos.filter((a) => a.status === "Ativo").length,
            alunosInativos: alunos.filter((a) => a.status !== "Ativo").length,
            profissionais: equipe.length,
            aulasSemana: aulasDaSemana.length,
            aulasFuturas: aulas.length,
            ocupacao
        },

        dias,
        equipe
    };
}


export function useUnidadeAcademia() {

    const [data, setData] = useState(null);
    const [avisos, setAvisos] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        let cancelado = false;

        async function carregar() {

            try {

                setLoading(true);
                setError("");

                const paginacao = { limit: 500, offset: 0 };

                const [academia, alunos, profissionais, aulas] = await Promise.all([
                    api.get("/academias/me"),

                    buscarLista("/alunos", paginacao, "alunos"),

                    buscarLista("/profissionais", paginacao, "profissionais"),

                    buscarLista(
                        "/aulas",
                        { status: "Ativa", futuras: true, ...paginacao },
                        "aulas"
                    )
                ]);

                if (cancelado) return;

                setData(
                    montarDados(
                        {
                            academia: academia.data,
                            alunos: alunos.itens,
                            profissionais: profissionais.itens,
                            aulas: aulas.itens
                        },
                        hojeISO()
                    )
                );

                const falhas = [alunos, profissionais, aulas]
                    .map((r) => r.falha)
                    .filter(Boolean);

                setAvisos(
                    falhas.length > 0
                        ? `Não foi possível carregar: ${falhas.join(", ")}.`
                        : ""
                );

            } catch (err) {

                if (cancelado) return;

                setError(mensagemErro(err, "Não foi possível carregar os dados da unidade."));

                console.error("Erro ao carregar a unidade:", err);

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

    return { data, avisos, loading, error };
}