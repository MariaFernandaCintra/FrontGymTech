
import { useEffect, useState } from "react";

import {
    CalendarDays,
    Clock,
    UserRound,
    ClipboardList,
    CalendarPlus,
    RefreshCw,
    Search,
    Scale,
    Ruler,
    Activity,
    FileText,
    X,
    CheckCircle2
} from "lucide-react";

import api from "../../services/api";
import ClientSidebar from "../../componets/client-sidebar/client-sidebar";

function AvaliacaoFisica() {
    const [profissionais, setProfissionais] = useState([]);
    const [agendamentos, setAgendamentos] = useState([]);

    const [profissionalSelecionado, setProfissionalSelecionado] = useState("");
    const [dataHorario, setDataHorario] = useState("");

    const [abaAtiva, setAbaAtiva] = useState("agendar");

    const [ficha, setFicha] = useState(null);
    const [agendamentoFicha, setAgendamentoFicha] = useState(null);

    const [carregando, setCarregando] = useState(true);
    const [carregandoFicha, setCarregandoFicha] = useState(false);
    const [idProcessando, setIdProcessando] = useState(null);

    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");

    // DATA E HORÁRIO MÍNIMOS PARA O INPUT
    const obterDataHoraAtual = () => {
        const agora = new Date();
        const ano = agora.getFullYear();
        const mes = String(agora.getMonth() + 1).padStart(2, "0");
        const dia = String(agora.getDate()).padStart(2, "0");
        const hora = String(agora.getHours()).padStart(2, "0");
        const minuto = String(agora.getMinutes()).padStart(2, "0");

        return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
    };

    // FORMATAR DATA E HORÁRIO
    const formatarDataHora = (data) => {
        if (!data) return "Não informado";

        return new Date(data).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // FORMATAR DATA SEM ALTERAR O DIA PELO FUSO HORÁRIO
    const formatarData = (data) => {
        if (!data) return "Não informado";

        const [ano, mes, dia] = data.split("-");

        if (!ano || !mes || !dia) return data;

        return `${dia}/${mes}/${ano}`;
    };

    // TRATAR MENSAGENS DE ERRO DA API
    const obterMensagemErro = (error, mensagemPadrao) => {
        const detalhe = error.response?.data?.detail;
        const mensagemApi = error.response?.data?.mensagem;

        if (typeof detalhe === "string") {
            return detalhe;
        }

        if (Array.isArray(detalhe)) {
            return detalhe.map((item) => item.msg).join(" | ");
        }

        if (typeof mensagemApi === "string") {
            return mensagemApi;
        }

        return mensagemPadrao;
    };

    async function carregarProfissionais() {
        try {
            const response = await api.get("/alunos/me/profissionais", {
                params: {
                    limit: 500,
                    offset: 0
                }
            });

            console.log("Resposta da API:", response.data);
            console.log("Profissionais:", response.data.itens);

            setProfissionais(response.data.itens || []);
        } catch (error) {
            console.error("Erro ao buscar profissionais:", error);
            console.error("Resposta do erro:", error.response?.data);
        }
    }

    const formatarMedidasCorporais = (medidas) => {
        if (!medidas) {
            return "Nenhuma medida informada.";
        }

        if (typeof medidas === "string") {
            return medidas;
        }

        if (typeof medidas === "object") {
            return Object.entries(medidas)
                .map(([nome, valor]) => `${nome}: ${valor}`)
                .join("\n");
        }

        return String(medidas);
    };

    // LISTAR AGENDAMENTOS
    const carregarAgendamentos = async () => {
        try {
            const response = await api.get("/alunos/me/agendamentos", {
                params: {
                    status: "Todos",
                    futuros: false,
                    limit: 500,
                    offset: 0
                }
            });

            setAgendamentos(
                Array.isArray(response.data?.itens)
                    ? response.data.itens
                    : []
            );
        } catch (error) {
            console.error("Erro ao carregar agendamentos:", error);

            setErro(
                obterMensagemErro(
                    error,
                    "Não foi possível carregar seus agendamentos."
                )
            );
        }
    };

    // CARREGAR DADOS DA PÁGINA
    const carregarDados = async () => {
        setCarregando(true);
        setErro("");

        await Promise.all([
            carregarProfissionais(),
            carregarAgendamentos()
        ]);

        setCarregando(false);
    };

    useEffect(() => {
        carregarDados();
    }, []);

    // SEPARAR AGENDAMENTOS POR STATUS
    const agendamentosAtivos = agendamentos.filter(
        (item) => item.status === "Agendado"
    );

    // CRIAR AGENDAMENTO
    const agendarAvaliacao = async (e) => {
        e.preventDefault();

        setErro("");
        setMensagem("");

        if (!profissionalSelecionado || !dataHorario) {
            setErro("Selecione um profissional, uma data e um horário.");
            return;
        }

        const dataEscolhida = new Date(dataHorario);

        if (Number.isNaN(dataEscolhida.getTime())) {
            setErro("Informe uma data e um horário válidos.");
            return;
        }

        if (dataEscolhida <= new Date()) {
            setErro("Escolha uma data e um horário futuros.");
            return;
        }

        setIdProcessando("agendamento");

        try {
            const response = await api.post(
                "/alunos/me/agendamentos",
                {
                    fk_id_profissional: Number(profissionalSelecionado),
                    data_horario: dataEscolhida.toISOString()
                }
            );

            setMensagem(
                response.data?.mensagem ||
                "Agendamento realizado com sucesso!"
            );

            setProfissionalSelecionado("");
            setDataHorario("");

            await carregarAgendamentos();

            setAbaAtiva("agendamentos");
        } catch (error) {
            console.error("Erro ao agendar avaliação:", error);

            setErro(
                obterMensagemErro(
                    error,
                    "Não foi possível realizar o agendamento. Verifique se existe conflito de horário."
                )
            );
        } finally {
            setIdProcessando(null);
        }
    };

    // CANCELAR AGENDAMENTO
    const cancelarAgendamento = async (idAgendamento) => {
        const confirmar = window.confirm(
            "Tem certeza de que deseja cancelar esta avaliação?"
        );

        if (!confirmar) return;

        setErro("");
        setMensagem("");
        setIdProcessando(idAgendamento);

        try {
            const response = await api.delete(
                `/alunos/me/agendamentos/${idAgendamento}`
            );

            setMensagem(
                response.data?.mensagem ||
                "Agendamento cancelado com sucesso!"
            );

            await carregarAgendamentos();
        } catch (error) {
            console.error("Erro ao cancelar agendamento:", error);

            setErro(
                obterMensagemErro(
                    error,
                    "Não foi possível cancelar o agendamento."
                )
            );
        } finally {
            setIdProcessando(null);
        }
    };

    // CONSULTAR FICHA DE AVALIAÇÃO
    const consultarFicha = async (agendamento) => {
        setErro("");
        setMensagem("");
        setFicha(null);
        setAgendamentoFicha(agendamento);
        setCarregandoFicha(true);

        try {
            const response = await api.get(
                `/alunos/me/agendamentos/${agendamento.id_agendamento_avaliacao}/avaliacao`
            );

            setFicha(response.data);
            setAbaAtiva("ficha");
        } catch (error) {
            console.error("Erro ao consultar ficha:", error);

            setErro(
                obterMensagemErro(
                    error,
                    "Não foi possível carregar sua ficha de avaliação."
                )
            );
        } finally {
            setCarregandoFicha(false);
        }
    };

    // VOLTAR PARA OS AGENDAMENTOS
    const voltarAgendamentos = () => {
        setFicha(null);
        setAgendamentoFicha(null);
        setAbaAtiva("agendamentos");
        setErro("");
        setMensagem("");
    };

    return (
        <>
            <style>{`
                .avaliacao-page {
                    display: flex;
                    min-height: 100vh;
                    background: #101010;
                    color: #f5f5f5;
                    font-family: Arial, sans-serif;
                }

                .avaliacao-content {
                    flex: 1;
                    min-width: 0;
                    padding: 35px;
                }

                .avaliacao-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 15px;
                    flex-wrap: wrap;
                    margin-bottom: 30px;
                }

                .avaliacao-header h1 {
                    margin: 0 0 8px;
                    font-size: 27px;
                }

                .avaliacao-header p {
                    margin: 0;
                    color: #999;
                    font-size: 14px;
                }

                .avaliacao-refresh {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 11px 15px;
                    border: 1px solid #333;
                    border-radius: 8px;
                    background: #1b1b1b;
                    color: #ccc;
                    cursor: pointer;
                }

                .avaliacao-refresh:hover {
                    border-color: #c6ff00;
                    color: #c6ff00;
                }

                .avaliacao-tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 25px;
                    border-bottom: 1px solid #303030;
                    overflow-x: auto;
                }

                .avaliacao-tab {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 13px 17px;
                    border: none;
                    border-bottom: 2px solid transparent;
                    background: transparent;
                    color: #999;
                    white-space: nowrap;
                    cursor: pointer;
                    font-size: 14px;
                }

                .avaliacao-tab.active {
                    border-bottom-color: #c6ff00;
                    color: #c6ff00;
                }

                .avaliacao-alerta {
                    padding: 13px 16px;
                    margin-bottom: 20px;
                    border-radius: 8px;
                    font-size: 13px;
                }

                .avaliacao-alerta.sucesso {
                    color: #c6ff00;
                    background: rgba(198, 255, 0, 0.08);
                    border: 1px solid rgba(198, 255, 0, 0.2);
                }

                .avaliacao-alerta.erro {
                    color: #ff8585;
                    background: rgba(255, 80, 80, 0.08);
                    border: 1px solid rgba(255, 80, 80, 0.2);
                }

                .avaliacao-form {
                    max-width: 750px;
                    padding: 25px;
                    border: 1px solid #303030;
                    border-radius: 12px;
                    background: #1a1a1a;
                }

                .avaliacao-form h2 {
                    margin: 0 0 8px;
                    font-size: 19px;
                }

                .avaliacao-form-descricao {
                    margin: 0 0 25px;
                    color: #999;
                    font-size: 13px;
                    line-height: 1.6;
                }

                .avaliacao-label {
                    display: block;
                    margin-bottom: 9px;
                    color: #ddd;
                    font-size: 13px;
                    font-weight: bold;
                }

                .avaliacao-campo {
                    margin-bottom: 22px;
                }

                .avaliacao-input,
                .avaliacao-select {
                    width: 100%;
                    height: 45px;
                    box-sizing: border-box;
                    padding: 0 13px;
                    border: 1px solid #383838;
                    border-radius: 8px;
                    outline: none;
                    background: #111;
                    color: #eee;
                    font-size: 13px;
                }

                .avaliacao-input:focus,
                .avaliacao-select:focus {
                    border-color: #c6ff00;
                }

                .avaliacao-input::placeholder {
                    color: #777;
                }

                .avaliacao-profissional-info {
                    margin-top: 10px;
                    padding: 13px;
                    border: 1px solid #353535;
                    border-radius: 8px;
                    background: #151515;
                    color: #aaa;
                    font-size: 12px;
                    line-height: 1.7;
                }

                .avaliacao-profissional-info strong {
                    color: #c6ff00;
                }

                .avaliacao-horario-aviso {
                    display: flex;
                    align-items: flex-start;
                    gap: 9px;
                    margin: 5px 0 22px;
                    padding: 13px;
                    border-radius: 8px;
                    background: rgba(198, 255, 0, 0.06);
                    color: #bbb;
                    font-size: 12px;
                    line-height: 1.6;
                }

                .avaliacao-horario-aviso svg {
                    flex-shrink: 0;
                    color: #c6ff00;
                }

                .avaliacao-btn {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    padding: 13px;
                    border: none;
                    border-radius: 8px;
                    background: #c6ff00;
                    color: #111;
                    font-size: 13px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .avaliacao-btn:hover {
                    background: #b2e600;
                }

                .avaliacao-btn:disabled {
                    background: #414141;
                    color: #999;
                    cursor: not-allowed;
                }

                .avaliacao-btn.secundario {
                    background: transparent;
                    border: 1px solid #444;
                    color: #ccc;
                }

                .avaliacao-btn.secundario:hover {
                    border-color: #c6ff00;
                    color: #c6ff00;
                }

                .avaliacao-btn.cancelar {
                    background: transparent;
                    border: 1px solid #713b3b;
                    color: #ff8585;
                }

                .avaliacao-btn.cancelar:hover {
                    background: rgba(255, 80, 80, 0.08);
                }

                .avaliacao-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
                    gap: 18px;
                }

                .avaliacao-card {
                    padding: 20px;
                    border: 1px solid #303030;
                    border-radius: 12px;
                    background: #1a1a1a;
                }

                .avaliacao-card-top {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 10px;
                    margin-bottom: 18px;
                }

                .avaliacao-card h2 {
                    margin: 0 0 7px;
                    font-size: 17px;
                }

                .avaliacao-card-subtitulo {
                    color: #999;
                    font-size: 12px;
                }

                .avaliacao-status {
                    padding: 6px 9px;
                    border-radius: 20px;
                    background: rgba(198, 255, 0, 0.1);
                    color: #c6ff00;
                    font-size: 10px;
                    white-space: nowrap;
                }

                .avaliacao-status.realizado {
                    background: rgba(80, 180, 120, 0.12);
                    color: #80d69a;
                }

                .avaliacao-status.cancelado {
                    background: rgba(255, 80, 80, 0.1);
                    color: #ff8585;
                }

                .avaliacao-info {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    margin: 13px 0;
                    color: #aaa;
                    font-size: 13px;
                }

                .avaliacao-info svg {
                    flex-shrink: 0;
                    color: #c6ff00;
                }

                .avaliacao-card-acoes {
                    display: flex;
                    flex-direction: column;
                    gap: 9px;
                    margin-top: 20px;
                }

                .avaliacao-vazio,
                .avaliacao-loading {
                    padding: 55px 20px;
                    border: 1px dashed #383838;
                    border-radius: 12px;
                    background: #1a1a1a;
                    text-align: center;
                    color: #888;
                }

                .avaliacao-vazio svg {
                    margin-bottom: 12px;
                    color: #c6ff00;
                }

                .avaliacao-vazio h2 {
                    color: #eee;
                    font-size: 17px;
                }

                .avaliacao-vazio p {
                    font-size: 13px;
                }

                .avaliacao-ficha {
                    max-width: 850px;
                }

                .avaliacao-ficha-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    flex-wrap: wrap;
                    margin-bottom: 22px;
                }

                .avaliacao-ficha-header h2 {
                    margin: 0 0 7px;
                    font-size: 20px;
                }

                .avaliacao-ficha-header p {
                    margin: 0;
                    color: #999;
                    font-size: 13px;
                }

                .avaliacao-medidas-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 15px;
                    margin-bottom: 20px;
                }

                .avaliacao-medida {
                    padding: 20px;
                    border: 1px solid #303030;
                    border-radius: 10px;
                    background: #1a1a1a;
                }

                .avaliacao-medida svg {
                    margin-bottom: 14px;
                    color: #c6ff00;
                }

                .avaliacao-medida span {
                    display: block;
                    margin-bottom: 7px;
                    color: #999;
                    font-size: 12px;
                }

                .avaliacao-medida strong {
                    color: #f5f5f5;
                    font-size: 22px;
                }

                .avaliacao-ficha-detalhe {
                    padding: 20px;
                    margin-bottom: 15px;
                    border: 1px solid #303030;
                    border-radius: 10px;
                    background: #1a1a1a;
                }

                .avaliacao-ficha-detalhe h3 {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    margin: 0 0 13px;
                    font-size: 15px;
                }

                .avaliacao-ficha-detalhe h3 svg {
                    color: #c6ff00;
                }

                .avaliacao-ficha-detalhe p {
                    margin: 0;
                    color: #aaa;
                    font-size: 13px;
                    line-height: 1.7;
                    white-space: pre-wrap;
                    overflow-wrap: anywhere;
                }

                .avaliacao-voltar {
                    margin-bottom: 22px;
                }

                @media (max-width: 700px) {
                    .avaliacao-content {
                        padding: 22px 15px;
                    }

                    .avaliacao-header h1 {
                        font-size: 23px;
                    }

                    .avaliacao-form {
                        padding: 18px;
                    }

                    .avaliacao-grid {
                        grid-template-columns: 1fr;
                    }

                    .avaliacao-medidas-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }
            `}</style>

            <div className="avaliacao-page">
                <ClientSidebar />

                <main className="avaliacao-content">

                    <header className="avaliacao-header">
                        <div>
                            <h1>Avaliação Física</h1>
                            <p>
                                Agende sua avaliação e acompanhe sua evolução.
                            </p>
                        </div>

                        <button
                            className="avaliacao-refresh"
                            onClick={carregarDados}
                            disabled={carregando}
                        >
                            <RefreshCw size={15} />
                            Atualizar
                        </button>
                    </header>

                    <div className="avaliacao-tabs">
                        <button
                            className={`avaliacao-tab ${abaAtiva === "agendar" ? "active" : ""
                                }`}
                            onClick={() => {
                                setAbaAtiva("agendar");
                                setErro("");
                                setMensagem("");
                            }}
                        >
                            <CalendarPlus size={16} />
                            Agendar avaliação
                        </button>

                        <button
                            className={`avaliacao-tab ${abaAtiva === "agendamentos" ? "active" : ""
                                }`}
                            onClick={() => {
                                setAbaAtiva("agendamentos");
                                setErro("");
                                setMensagem("");
                            }}
                        >
                            <CalendarDays size={16} />
                            Meus agendamentos ({agendamentos.length})
                        </button>

                        {abaAtiva === "ficha" && (
                            <button className="avaliacao-tab active">
                                <ClipboardList size={16} />
                                Minha ficha
                            </button>
                        )}
                    </div>

                    {mensagem && (
                        <div className="avaliacao-alerta sucesso">
                            {mensagem}
                        </div>
                    )}

                    {erro && (
                        <div className="avaliacao-alerta erro">
                            {erro}
                        </div>
                    )}

                    {/* AGENDAR AVALIAÇÃO */}
                    {abaAtiva === "agendar" && (
                        <form
                            className="avaliacao-form"
                            onSubmit={agendarAvaliacao}
                        >
                            <h2>Agende sua avaliação física</h2>

                            <p className="avaliacao-form-descricao">
                                Escolha um profissional da sua academia e
                                informe a data e o horário desejados.
                            </p>

                            {carregando ? (
                                <div className="avaliacao-loading">
                                    Carregando profissionais...
                                </div>
                            ) : (
                                <>
                                    <div className="avaliacao-campo">
                                        <label className="avaliacao-label">
                                            Profissional
                                        </label>

                                        <select
                                            className="avaliacao-select"
                                            value={profissionalSelecionado}
                                            onChange={(e) =>
                                                setProfissionalSelecionado(e.target.value)
                                            }
                                            required
                                        >
                                            <option value="">
                                                Selecione um profissional
                                            </option>

                                            {profissionais.map(
                                                (profissional) => (
                                                    <option
                                                        key={profissional.id_usuario}
                                                        value={profissional.id_usuario}
                                                    >
                                                        {profissional.nome}
                                                        {profissional.especialidade
                                                            ? ` - ${profissional.especialidade}`
                                                            : ""}
                                                    </option>
                                                )
                                            )}
                                        </select>

                                        {profissionalSelecionado && (
                                            <div className="avaliacao-profissional-info">
                                                {(() => {
                                                    const profissional =
                                                        profissionais.find(
                                                            (item) =>
                                                                item.id_usuario ===
                                                                Number(profissionalSelecionado)
                                                        );

                                                    if (!profissional) return null;

                                                    return (
                                                        <>
                                                            <strong>
                                                                {profissional.nome}
                                                            </strong>
                                                            <br />
                                                            Especialidade:{" "}
                                                            {profissional.especialidade ||
                                                                "Não informada"}
                                                            <br />
                                                            Registro profissional:{" "}
                                                            {profissional.registro_profissional ||
                                                                "Não informado"}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="avaliacao-campo">
                                        <label className="avaliacao-label">
                                            Data e horário desejados
                                        </label>

                                        <input
                                            className="avaliacao-input"
                                            type="datetime-local"
                                            value={dataHorario}
                                            min={obterDataHoraAtual()}
                                            onChange={(e) =>
                                                setDataHorario(e.target.value)
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="avaliacao-horario-aviso">
                                        <Clock size={17} />

                                        <span>
                                            Você pode escolher o horário desejado.
                                            O sistema verificará se existe conflito
                                            com seus treinos ou aulas antes de
                                            confirmar o agendamento.
                                        </span>
                                    </div>

                                    <button
                                        className="avaliacao-btn"
                                        type="submit"
                                        disabled={
                                            idProcessando === "agendamento" ||
                                            profissionais.length === 0
                                        }
                                    >
                                        <CalendarPlus size={17} />

                                        {idProcessando === "agendamento"
                                            ? "Agendando..."
                                            : "Confirmar agendamento"}
                                    </button>
                                </>
                            )}
                        </form>
                    )}

                    {/* MEUS AGENDAMENTOS */}
                    {abaAtiva === "agendamentos" && (
                        <>
                            {carregando ? (
                                <div className="avaliacao-loading">
                                    Carregando seus agendamentos...
                                </div>
                            ) : agendamentos.length === 0 ? (
                                <div className="avaliacao-vazio">
                                    <CalendarDays size={36} />

                                    <h2>Nenhum agendamento encontrado</h2>

                                    <p>
                                        Você ainda não possui avaliações físicas
                                        agendadas.
                                    </p>

                                    <button
                                        className="avaliacao-btn"
                                        style={{
                                            maxWidth: 230,
                                            margin: "20px auto 0"
                                        }}
                                        onClick={() => setAbaAtiva("agendar")}
                                    >
                                        Agendar avaliação
                                    </button>
                                </div>
                            ) : (
                                <div className="avaliacao-grid">
                                    {agendamentos.map((item) => {
                                        const statusClasse =
                                            item.status === "Realizado"
                                                ? "realizado"
                                                : item.status === "Cancelado"
                                                    ? "cancelado"
                                                    : "";

                                        return (
                                            <article
                                                className="avaliacao-card"
                                                key={item.id_agendamento_avaliacao}
                                            >
                                                <div className="avaliacao-card-top">
                                                    <div>
                                                        <h2>
                                                            Avaliação física
                                                        </h2>

                                                        <span className="avaliacao-card-subtitulo">
                                                            Atendimento individual
                                                        </span>
                                                    </div>

                                                    <span
                                                        className={`avaliacao-status ${statusClasse}`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </div>

                                                <div className="avaliacao-info">
                                                    <UserRound size={16} />
                                                    {item.nome_profissional}
                                                </div>

                                                <div className="avaliacao-info">
                                                    <CalendarDays size={16} />
                                                    {formatarDataHora(item.data_horario)}
                                                </div>

                                                <div className="avaliacao-info">
                                                    <ClipboardList size={16} />

                                                    {item.possui_ficha
                                                        ? "Ficha disponível"
                                                        : "Ficha ainda não preenchida"}
                                                </div>

                                                <div className="avaliacao-card-acoes">
                                                    {item.possui_ficha && (
                                                        <button
                                                            className="avaliacao-btn"
                                                            onClick={() =>
                                                                consultarFicha(item)
                                                            }
                                                            disabled={carregandoFicha}
                                                        >
                                                            <FileText size={16} />
                                                            Ver minha ficha
                                                        </button>
                                                    )}

                                                    {item.status === "Agendado" && (
                                                        <button
                                                            className="avaliacao-btn cancelar"
                                                            disabled={
                                                                idProcessando ===
                                                                item.id_agendamento_avaliacao
                                                            }
                                                            onClick={() =>
                                                                cancelarAgendamento(
                                                                    item.id_agendamento_avaliacao
                                                                )
                                                            }
                                                        >
                                                            <X size={16} />

                                                            {idProcessando ===
                                                                item.id_agendamento_avaliacao
                                                                ? "Cancelando..."
                                                                : "Cancelar agendamento"}
                                                        </button>
                                                    )}
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}

                    {/* MINHA FICHA */}
                    {abaAtiva === "ficha" && (
                        <div className="avaliacao-ficha">
                            <button
                                className="avaliacao-btn secundario avaliacao-voltar"
                                style={{ width: "auto" }}
                                onClick={voltarAgendamentos}
                            >
                                Voltar para meus agendamentos
                            </button>

                            {carregandoFicha ? (
                                <div className="avaliacao-loading">
                                    Carregando sua ficha...
                                </div>
                            ) : ficha ? (
                                <>
                                    <div className="avaliacao-ficha-header">
                                        <div>
                                            <h2>Minha avaliação física</h2>

                                            <p>
                                                Profissional:{" "}
                                                {agendamentoFicha?.nome_profissional}
                                            </p>

                                            <p>
                                                Data da avaliação:{" "}
                                                {formatarData(ficha.data_avaliacao)}
                                            </p>
                                        </div>

                                        <CheckCircle2
                                            size={30}
                                            color="#C6FF00"
                                        />
                                    </div>

                                    <div className="avaliacao-medidas-grid">
                                        <div className="avaliacao-medida">
                                            <Scale size={21} />
                                            <span>Peso</span>
                                            <strong>
                                                {ficha.peso ?? "—"} kg
                                            </strong>
                                        </div>

                                        <div className="avaliacao-medida">
                                            <Ruler size={21} />
                                            <span>Altura</span>
                                            <strong>
                                                {ficha.altura ?? "—"} m
                                            </strong>
                                        </div>

                                        <div className="avaliacao-medida">
                                            <Activity size={21} />
                                            <span>Percentual de gordura</span>
                                            <strong>
                                                {ficha.percentual_gordura ?? "—"}%
                                            </strong>
                                        </div>

                                        <div className="avaliacao-medida">
                                            <Activity size={21} />
                                            <span>Massa magra</span>
                                            <strong>
                                                {ficha.massa_magra ?? "—"} kg
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="avaliacao-ficha-detalhe">
                                        <h3>
                                            <Ruler size={17} />
                                            Medidas corporais
                                        </h3>

                                        <p>
                                            {formatarMedidasCorporais(ficha.medidas_corporais)}
                                        </p>
                                    </div>

                                    <div className="avaliacao-ficha-detalhe">
                                        <h3>
                                            <FileText size={17} />
                                            Observações técnicas
                                        </h3>

                                        <p>
                                            {ficha.observacoes_tecnicas ||
                                                "Nenhuma observação informada."}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="avaliacao-vazio">
                                    <ClipboardList size={35} />
                                    <h2>Ficha não encontrada</h2>
                                    <p>
                                        Não foi possível carregar os dados
                                        desta avaliação.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}

export default AvaliacaoFisica;
