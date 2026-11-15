
import { useCallback, useEffect, useMemo, useState } from "react";

import "../dashboard/dashboard.css";
import "./agenda-profissional.css";

import ClientSidebar from "../../componets/client-sidebar/client-sidebar";
import { menuProfissional } from "../../componets/client-sidebar/menus";

import { useUsuarioLogado } from "../../hooks/useUsuarioLogado";
import api from "../../services/api";

import {
    CalendarDays,
    Clock,
    Dumbbell,
    Users,
    Search,
    RefreshCw,
    CalendarCheck
} from "lucide-react";

// Data atual no formato AAAA-MM-DD, usando o horário local.
function dataHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

// Evita problemas de fuso horário ao formatar datas sem horário.
function formatarData(data) {
    if (!data) return "Data não informada";

    const [ano, mes, dia] = String(data).split("T")[0].split("-");

    if (!ano || !mes || !dia) return "Data não informada";

    return `${dia}/${mes}/${ano}`;
}

function formatarHorario(data) {
    if (!data) return "Horário não informado";

    return new Date(data).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function AgendaProfissional() {
    const usuario = useUsuarioLogado();

    const [aulas, setAulas] = useState([]);
    const [treinos, setTreinos] = useState([]);

    const [abaAtiva, setAbaAtiva] = useState("todos");
    const [busca, setBusca] = useState("");

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const carregarAgenda = useCallback(async () => {
        setCarregando(true);
        setErro("");

        try {
            const hoje = dataHoje();

            const [respostaAulas, respostaTreinos] = await Promise.all([
                api.get("/profissionais/me/aulas", {
                    params: {
                        status: "Ativa",
                        futuras: true,
                        limit: 500,
                        offset: 0
                    }
                }),

                api.get("/profissionais/me/treinos", {
                    params: {
                        status: "Ativo",
                        data_de: hoje,
                        incluir_itens: false,
                        limit: 500,
                        offset: 0
                    }
                })
            ]);

            setAulas(
                Array.isArray(respostaAulas.data?.itens)
                    ? respostaAulas.data.itens
                    : []
            );

            setTreinos(
                Array.isArray(respostaTreinos.data?.itens)
                    ? respostaTreinos.data.itens
                    : []
            );

        } catch (error) {
            console.error("Erro ao carregar agenda:", error);

            setErro(
                error.response?.data?.detail ||
                "Não foi possível carregar sua agenda. Tente novamente."
            );
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarAgenda();
    }, [carregarAgenda]);

    // Junta aulas e treinos em uma única lista.
    const compromissos = useMemo(() => {
        const listaAulas = aulas.map((aula) => ({
            id: `aula-${aula.id_aula}`,
            categoria: "aula",
            titulo: aula.nome_aula,
            subtitulo: aula.tipo_aula,
            data: aula.data_horario,
            nomeAluno: null,
            horario: formatarHorario(aula.data_horario),
            capacidade: aula.capacidade_maxima,
            vagasDisponiveis: aula.vagas_disponiveis
        }));

        const listaTreinos = treinos
            .filter((treino) => treino.data_programada)
            .map((treino) => ({
                id: `treino-${treino.id_treino}`,
                categoria: "treino",
                titulo: treino.titulo_treino,
                subtitulo: "Treino individual",
                data: treino.data_programada,
                nomeAluno: treino.nome_aluno,
                quantidadeExercicios: treino.quantidade_exercicios,
                horario: null
            }));

        return [...listaAulas, ...listaTreinos].sort((a, b) => {
            return new Date(a.data).getTime() - new Date(b.data).getTime();
        });
    }, [aulas, treinos]);

    // Pesquisa e filtros.
    const compromissosFiltrados = useMemo(() => {
        return compromissos.filter((item) => {
            const correspondeAba =
                abaAtiva === "todos" ||
                item.categoria === abaAtiva;

            const textoBusca = busca.toLowerCase().trim();

            const correspondeBusca =
                !textoBusca ||
                item.titulo?.toLowerCase().includes(textoBusca) ||
                item.subtitulo?.toLowerCase().includes(textoBusca) ||
                item.nomeAluno?.toLowerCase().includes(textoBusca);

            return correspondeAba && correspondeBusca;
        });
    }, [compromissos, abaAtiva, busca]);

    const nomeProfissional = usuario?.nome || "Profissional";

    return (
        <div className="dash-page">

            <ClientSidebar
                name={nomeProfissional}
                plan="Profissional"
                menu={menuProfissional}
            />

            <main className="dash-main agenda-main">

                {/* CABEÇALHO */}
                <header className="agenda-header">
                    <div>
                        <span className="agenda-label">
                            ORGANIZAÇÃO PROFISSIONAL
                        </span>

                        <h1>Minha Agenda</h1>

                        <p>
                            Acompanhe suas aulas e os treinos dos seus alunos.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="agenda-refresh"
                        onClick={carregarAgenda}
                        disabled={carregando}
                    >
                        <RefreshCw
                            size={15}
                            className={carregando ? "agenda-spinning" : ""}
                        />
                        Atualizar
                    </button>
                </header>

                {/* RESUMO */}
                <section className="agenda-resumo">

                    <article className="agenda-resumo-card">
                        <div className="agenda-resumo-icon">
                            <CalendarCheck size={19} />
                        </div>

                        <div>
                            <span>COMPROMISSOS</span>
                            <strong>{compromissos.length}</strong>
                        </div>
                    </article>

                    <article className="agenda-resumo-card">
                        <div className="agenda-resumo-icon">
                            <Users size={19} />
                        </div>

                        <div>
                            <span>AULAS COLETIVAS</span>
                            <strong>{aulas.length}</strong>
                        </div>
                    </article>

                    <article className="agenda-resumo-card">
                        <div className="agenda-resumo-icon">
                            <Dumbbell size={19} />
                        </div>

                        <div>
                            <span>TREINOS INDIVIDUAIS</span>
                            <strong>
                                {treinos.filter((t) => t.data_programada).length}
                            </strong>
                        </div>
                    </article>

                </section>

                {/* FILTROS */}
                <section className="agenda-filtros">

                    <div className="agenda-tabs">

                        <button
                            type="button"
                            className={abaAtiva === "todos" ? "active" : ""}
                            onClick={() => setAbaAtiva("todos")}
                        >
                            Todos
                        </button>

                        <button
                            type="button"
                            className={abaAtiva === "aula" ? "active" : ""}
                            onClick={() => setAbaAtiva("aula")}
                        >
                            <Users size={14} />
                            Aulas
                        </button>

                        <button
                            type="button"
                            className={abaAtiva === "treino" ? "active" : ""}
                            onClick={() => setAbaAtiva("treino")}
                        >
                            <Dumbbell size={14} />
                            Treinos
                        </button>

                    </div>

                    <div className="agenda-busca">
                        <Search size={16} />

                        <input
                            type="text"
                            placeholder="Buscar compromisso ou aluno..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>

                </section>

                {/* MENSAGEM DE ERRO */}
                {erro && (
                    <div className="agenda-erro">
                        {erro}
                    </div>
                )}

                {/* LISTA DE COMPROMISSOS */}
                {carregando ? (

                    <div className="agenda-estado">
                        <RefreshCw size={22} className="agenda-spinning" />
                        <p>Carregando sua agenda...</p>
                    </div>

                ) : compromissosFiltrados.length === 0 ? (

                    <div className="agenda-vazio">
                        <CalendarDays size={38} />

                        <h2>Nenhum compromisso encontrado</h2>

                        <p>
                            Não encontramos aulas ou treinos para os filtros selecionados.
                        </p>
                    </div>

                ) : (

                    <section className="agenda-lista">

                        {compromissosFiltrados.map((item) => (

                            <article
                                className="agenda-card"
                                key={item.id}
                            >

                                <div className="agenda-card-icon">
                                    {item.categoria === "aula"
                                        ? <Users size={21} />
                                        : <Dumbbell size={21} />
                                    }
                                </div>

                                <div className="agenda-card-conteudo">

                                    <div className="agenda-card-topo">

                                        <div>
                                            <span className="agenda-card-tipo">
                                                {item.categoria === "aula"
                                                    ? "AULA COLETIVA"
                                                    : "TREINO INDIVIDUAL"
                                                }
                                            </span>

                                            <h2>{item.titulo}</h2>

                                            <p>{item.subtitulo}</p>
                                        </div>

                                        <span className="agenda-card-data">
                                            {formatarData(item.data)}
                                        </span>

                                    </div>

                                    <div className="agenda-card-detalhes">

                                        <span>
                                            <CalendarDays size={14} />
                                            {formatarData(item.data)}
                                        </span>

                                        {item.horario && (
                                            <span>
                                                <Clock size={14} />
                                                {item.horario}
                                            </span>
                                        )}

                                        {item.nomeAluno && (
                                            <span>
                                                <Users size={14} />
                                                {item.nomeAluno}
                                            </span>
                                        )}

                                        {item.categoria === "aula" && (
                                            <span>
                                                <Users size={14} />
                                                {item.vagasDisponiveis} vagas disponíveis
                                            </span>
                                        )}

                                        {item.categoria === "treino" && (
                                            <span>
                                                <Dumbbell size={14} />
                                                {item.quantidadeExercicios} exercícios
                                            </span>
                                        )}

                                    </div>

                                </div>

                            </article>

                        ))}

                    </section>

                )}

            </main>

        </div>
    );
}

export default AgendaProfissional;
