
import { useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    Clock,
    Dumbbell,
    UserRound,
    Users,
    Search,
    CalendarCheck,
    X,
    RefreshCw
} from "lucide-react";

import api from "../../services/api";
import ClientSidebar from "../../componets/client-sidebar/client-sidebar";

function AgendamentoAula() {
    const [aulas, setAulas] = useState([]);
    const [reservas, setReservas] = useState([]);

    const [abaAtiva, setAbaAtiva] = useState("aulas");
    const [busca, setBusca] = useState("");
    const [tipoSelecionado, setTipoSelecionado] = useState("");

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [idProcessando, setIdProcessando] = useState(null);

    // FORMATAR DATA
    const formatarData = (data) => {
        if (!data) return "";

        return new Date(data).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    // FORMATAR HORÁRIO
    const formatarHorario = (data) => {
        if (!data) return "";

        return new Date(data).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // CARREGAR AULAS DISPONÍVEIS
    const carregarAulas = async () => {
        try {
            const response = await api.get("/alunos/me/aulas", {
                params: {
                    status: "Ativa",
                    futuras: true,
                    limit: 500,
                    offset: 0
                }
            });

            setAulas(
                Array.isArray(response.data?.itens)
                    ? response.data.itens
                    : []
            );
        } catch (error) {
            console.error("Erro ao carregar aulas:", error);
            setErro("Não foi possível carregar as aulas disponíveis.");
        }
    };

    // CARREGAR MINHAS RESERVAS
    const carregarReservas = async () => {
        try {
            const response = await api.get("/alunos/me/reservas", {
                params: {
                    status: "Confirmado",
                    futuras: true,
                    limit: 500,
                    offset: 0
                }
            });

            setReservas(
                Array.isArray(response.data?.itens)
                    ? response.data.itens
                    : []
            );
        } catch (error) {
            console.error("Erro ao carregar reservas:", error);
            setErro("Não foi possível carregar suas reservas.");
        }
    };

    // CARREGAR DADOS DA PÁGINA
    const carregarDados = async () => {
        setCarregando(true);
        setErro("");

        await Promise.all([
            carregarAulas(),
            carregarReservas()
        ]);

        setCarregando(false);
    };

    useEffect(() => {
        carregarDados();
    }, []);

    // TIPOS DE AULA DISPONÍVEIS
    const tiposAula = useMemo(() => {
        return [...new Set(
            aulas
                .map((aula) => aula.tipo_aula)
                .filter(Boolean)
        )];
    }, [aulas]);

    // FILTRAR AULAS
    const aulasFiltradas = useMemo(() => {
        return aulas.filter((aula) => {
            const correspondeBusca =
                aula.nome_aula?.toLowerCase().includes(busca.toLowerCase()) ||
                aula.nome_profissional?.toLowerCase().includes(busca.toLowerCase());

            const correspondeTipo =
                !tipoSelecionado || aula.tipo_aula === tipoSelecionado;

            return correspondeBusca && correspondeTipo;
        });
    }, [aulas, busca, tipoSelecionado]);

    // REALIZAR RESERVA
    const agendarAula = async (idAula) => {
        setIdProcessando(idAula);
        setErro("");
        setMensagem("");

        try {
            const response = await api.post("/alunos/me/reservas", {
                fk_id_aula: idAula
            });

            setMensagem(
                response.data?.mensagem || "Reserva realizada com sucesso!"
            );

            await carregarDados();
        } catch (error) {
            console.error("Erro ao agendar aula:", error);

            const mensagemErro =
                error.response?.data?.detail ||
                error.response?.data?.mensagem ||
                "Não foi possível realizar a reserva.";

            setErro(
                typeof mensagemErro === "string"
                    ? mensagemErro
                    : "Não foi possível realizar a reserva. Verifique os dados."
            );
        } finally {
            setIdProcessando(null);
        }
    };

    // CANCELAR RESERVA
    const cancelarReserva = async (idReserva) => {
        const confirmar = window.confirm(
            "Tem certeza de que deseja cancelar esta reserva?"
        );

        if (!confirmar) return;

        setIdProcessando(idReserva);
        setErro("");
        setMensagem("");

        try {
            const response = await api.delete(
                `/alunos/me/reservas/${idReserva}`
            );

            setMensagem(
                response.data?.mensagem || "Reserva cancelada com sucesso!"
            );

            await carregarDados();
        } catch (error) {
            console.error("Erro ao cancelar reserva:", error);

            const mensagemErro =
                error.response?.data?.detail ||
                error.response?.data?.mensagem ||
                "Não foi possível cancelar a reserva.";

            setErro(
                typeof mensagemErro === "string"
                    ? mensagemErro
                    : "Não foi possível cancelar a reserva."
            );
        } finally {
            setIdProcessando(null);
        }
    };

    // VERIFICAR SE A AULA JÁ FOI RESERVADA
    const aulaJaReservada = (idAula) => {
        return reservas.some(
            (reserva) => reserva.fk_id_aula === idAula
        );
    };

    return (
        <>
            <style>{`
                .agendamento-page {
                    display: flex;
                    min-height: 100vh;
                    background: #101010;
                    color: #f5f5f5;
                    font-family: Arial, sans-serif;
                }

                .agendamento-content {
                    flex: 1;
                    padding: 35px;
                    min-width: 0;
                }

                .agendamento-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 30px;
                    flex-wrap: wrap;
                }

                .agendamento-header h1 {
                    font-size: 27px;
                    margin: 0 0 8px;
                }

                .agendamento-header p {
                    color: #999;
                    margin: 0;
                    font-size: 14px;
                }

                .agendamento-refresh {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border: 1px solid #333;
                    background: #1b1b1b;
                    color: #ccc;
                    padding: 11px 15px;
                    border-radius: 8px;
                    cursor: pointer;
                }

                .agendamento-refresh:hover {
                    border-color: #c6ff00;
                    color: #c6ff00;
                }

                .agendamento-tabs {
                    display: flex;
                    gap: 10px;
                    border-bottom: 1px solid #303030;
                    margin-bottom: 25px;
                }

                .agendamento-tab {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 13px 18px;
                    background: transparent;
                    color: #999;
                    border: none;
                    border-bottom: 2px solid transparent;
                    cursor: pointer;
                    font-size: 14px;
                }

                .agendamento-tab.active {
                    color: #c6ff00;
                    border-bottom-color: #c6ff00;
                }

                .agendamento-filtros {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 25px;
                    flex-wrap: wrap;
                }

                .agendamento-search {
                    flex: 1;
                    min-width: 220px;
                    position: relative;
                }

                .agendamento-search svg {
                    position: absolute;
                    left: 13px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #777;
                }

                .agendamento-search input,
                .agendamento-filtros select {
                    width: 100%;
                    box-sizing: border-box;
                    height: 43px;
                    background: #1b1b1b;
                    border: 1px solid #333;
                    border-radius: 8px;
                    color: #eee;
                    outline: none;
                    font-size: 13px;
                }

                .agendamento-search input {
                    padding: 0 12px 0 40px;
                }

                .agendamento-filtros select {
                    width: 200px;
                    padding: 0 12px;
                }

                .agendamento-search input:focus,
                .agendamento-filtros select:focus {
                    border-color: #c6ff00;
                }

                .agendamento-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
                    gap: 18px;
                }

                .agendamento-card {
                    background: #1a1a1a;
                    border: 1px solid #303030;
                    border-radius: 12px;
                    padding: 20px;
                    transition: border-color 0.2s;
                }

                .agendamento-card:hover {
                    border-color: #626262;
                }

                .agendamento-card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 10px;
                    margin-bottom: 18px;
                }

                .agendamento-card h2 {
                    font-size: 18px;
                    margin: 0 0 7px;
                }

                .agendamento-tipo {
                    color: #999;
                    font-size: 12px;
                }

                .agendamento-status {
                    background: rgba(198, 255, 0, 0.10);
                    color: #c6ff00;
                    padding: 6px 9px;
                    border-radius: 20px;
                    font-size: 10px;
                    white-space: nowrap;
                }

                .agendamento-info {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    color: #aaa;
                    font-size: 13px;
                    margin: 13px 0;
                }

                .agendamento-info svg {
                    color: #c6ff00;
                    flex-shrink: 0;
                }

                .agendamento-vagas {
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 1px solid #303030;
                }

                .agendamento-vagas-texto {
                    display: flex;
                    justify-content: space-between;
                    gap: 8px;
                    font-size: 12px;
                    color: #999;
                    margin-bottom: 9px;
                }

                .agendamento-vagas-texto strong {
                    color: #c6ff00;
                }

                .agendamento-barra {
                    height: 6px;
                    background: #353535;
                    border-radius: 10px;
                    overflow: hidden;
                }

                .agendamento-barra-preenchida {
                    height: 100%;
                    background: #c6ff00;
                    border-radius: 10px;
                }

                .agendamento-btn {
                    width: 100%;
                    margin-top: 20px;
                    padding: 12px;
                    border: none;
                    border-radius: 7px;
                    background: #c6ff00;
                    color: #111;
                    font-weight: bold;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .agendamento-btn:hover {
                    background: #b2e600;
                }

                .agendamento-btn:disabled {
                    background: #383838;
                    color: #999;
                    cursor: not-allowed;
                }

                .agendamento-btn.cancelar {
                    background: transparent;
                    color: #ff7777;
                    border: 1px solid #713b3b;
                }

                .agendamento-btn.cancelar:hover {
                    background: rgba(255, 80, 80, 0.08);
                }

                .agendamento-alerta {
                    padding: 13px 16px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    font-size: 13px;
                }

                .agendamento-alerta.sucesso {
                    color: #c6ff00;
                    background: rgba(198, 255, 0, 0.08);
                    border: 1px solid rgba(198, 255, 0, 0.2);
                }

                .agendamento-alerta.erro {
                    color: #ff8585;
                    background: rgba(255, 80, 80, 0.08);
                    border: 1px solid rgba(255, 80, 80, 0.2);
                }

                .agendamento-vazio {
                    text-align: center;
                    padding: 55px 20px;
                    color: #888;
                    background: #1a1a1a;
                    border: 1px dashed #383838;
                    border-radius: 12px;
                }

                .agendamento-vazio svg {
                    color: #c6ff00;
                    margin-bottom: 12px;
                }

                .agendamento-vazio h2 {
                    color: #eee;
                    font-size: 17px;
                }

                .agendamento-vazio p {
                    font-size: 13px;
                }

                .agendamento-loading {
                    text-align: center;
                    color: #aaa;
                    padding: 50px;
                }

                @media (max-width: 700px) {
                    .agendamento-content {
                        padding: 22px 15px;
                    }

                    .agendamento-header h1 {
                        font-size: 23px;
                    }

                    .agendamento-filtros {
                        flex-direction: column;
                    }

                    .agendamento-filtros select {
                        width: 100%;
                    }

                    .agendamento-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <div className="agendamento-page">
                <ClientSidebar />

                <main className="agendamento-content">
                    <header className="agendamento-header">
                        <div>
                            <h1>Agendar Aula</h1>
                            <p>Encontre uma aula e reserve sua vaga.</p>
                        </div>

                        <button
                            className="agendamento-refresh"
                            onClick={carregarDados}
                            disabled={carregando}
                        >
                            <RefreshCw size={15} />
                            Atualizar
                        </button>
                    </header>

                    <div className="agendamento-tabs">
                        <button
                            className={`agendamento-tab ${
                                abaAtiva === "aulas" ? "active" : ""
                            }`}
                            onClick={() => {
                                setAbaAtiva("aulas");
                                setErro("");
                                setMensagem("");
                            }}
                        >
                            <CalendarDays size={16} />
                            Aulas disponíveis
                        </button>

                        <button
                            className={`agendamento-tab ${
                                abaAtiva === "reservas" ? "active" : ""
                            }`}
                            onClick={() => {
                                setAbaAtiva("reservas");
                                setErro("");
                                setMensagem("");
                            }}
                        >
                            <CalendarCheck size={16} />
                            Minhas reservas ({reservas.length})
                        </button>
                    </div>

                    {mensagem && (
                        <div className="agendamento-alerta sucesso">
                            {mensagem}
                        </div>
                    )}

                    {erro && (
                        <div className="agendamento-alerta erro">
                            {erro}
                        </div>
                    )}

                    {abaAtiva === "aulas" && (
                        <>
                            <div className="agendamento-filtros">
                                <div className="agendamento-search">
                                    <Search size={16} />
                                    <input
                                        type="text"
                                        placeholder="Buscar aula ou profissional..."
                                        value={busca}
                                        onChange={(e) => setBusca(e.target.value)}
                                    />
                                </div>

                                <select
                                    value={tipoSelecionado}
                                    onChange={(e) =>
                                        setTipoSelecionado(e.target.value)
                                    }
                                >
                                    <option value="">Todos os tipos</option>

                                    {tiposAula.map((tipo) => (
                                        <option key={tipo} value={tipo}>
                                            {tipo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {carregando ? (
                                <div className="agendamento-loading">
                                    Carregando aulas...
                                </div>
                            ) : aulasFiltradas.length === 0 ? (
                                <div className="agendamento-vazio">
                                    <CalendarDays size={35} />
                                    <h2>Nenhuma aula encontrada</h2>
                                    <p>
                                        Não encontramos aulas disponíveis
                                        com esses filtros.
                                    </p>
                                </div>
                            ) : (
                                <div className="agendamento-grid">
                                    {aulasFiltradas.map((aula) => {
                                        const reservada = aulaJaReservada(
                                            aula.id_aula
                                        );

                                        const capacidade = Number(
                                            aula.capacidade_maxima || 0
                                        );

                                        const ocupadas = Number(
                                            aula.vagas_ocupadas || 0
                                        );

                                        const disponiveis = Number(
                                            aula.vagas_disponiveis || 0
                                        );

                                        const ocupacao = capacidade > 0
                                            ? Math.min(
                                                100,
                                                (ocupadas / capacidade) * 100
                                            )
                                            : 0;

                                        const semVagas = disponiveis <= 0;

                                        return (
                                            <article
                                                className="agendamento-card"
                                                key={aula.id_aula}
                                            >
                                                <div className="agendamento-card-top">
                                                    <div>
                                                        <h2>{aula.nome_aula}</h2>
                                                        <span className="agendamento-tipo">
                                                            {aula.tipo_aula}
                                                        </span>
                                                    </div>

                                                    <span className="agendamento-status">
                                                        {reservada
                                                            ? "Reservada"
                                                            : semVagas
                                                                ? "Lotada"
                                                                : "Disponível"}
                                                    </span>
                                                </div>

                                                <div className="agendamento-info">
                                                    <UserRound size={16} />
                                                    {aula.nome_profissional}
                                                </div>

                                                <div className="agendamento-info">
                                                    <CalendarDays size={16} />
                                                    {formatarData(aula.data_horario)}
                                                </div>

                                                <div className="agendamento-info">
                                                    <Clock size={16} />
                                                    {formatarHorario(aula.data_horario)}
                                                </div>

                                                <div className="agendamento-vagas">
                                                    <div className="agendamento-vagas-texto">
                                                        <span>
                                                            {ocupadas} de {capacidade} vagas ocupadas
                                                        </span>

                                                        <strong>
                                                            {disponiveis} livres
                                                        </strong>
                                                    </div>

                                                    <div className="agendamento-barra">
                                                        <div
                                                            className="agendamento-barra-preenchida"
                                                            style={{
                                                                width: `${ocupacao}%`
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    className="agendamento-btn"
                                                    disabled={
                                                        reservada ||
                                                        semVagas ||
                                                        idProcessando === aula.id_aula
                                                    }
                                                    onClick={() =>
                                                        agendarAula(aula.id_aula)
                                                    }
                                                >
                                                    {idProcessando === aula.id_aula
                                                        ? "Agendando..."
                                                        : reservada
                                                            ? "Aula já reservada"
                                                            : semVagas
                                                                ? "Sem vagas disponíveis"
                                                                : "Agendar aula"}
                                                </button>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}

                    {abaAtiva === "reservas" && (
                        <>
                            {carregando ? (
                                <div className="agendamento-loading">
                                    Carregando suas reservas...
                                </div>
                            ) : reservas.length === 0 ? (
                                <div className="agendamento-vazio">
                                    <CalendarCheck size={35} />
                                    <h2>Você ainda não possui reservas</h2>
                                    <p>
                                        Quando reservar uma aula, ela aparecerá aqui.
                                    </p>

                                    <button
                                        className="agendamento-btn"
                                        style={{ maxWidth: "220px" }}
                                        onClick={() => setAbaAtiva("aulas")}
                                    >
                                        Ver aulas disponíveis
                                    </button>
                                </div>
                            ) : (
                                <div className="agendamento-grid">
                                    {reservas.map((reserva) => (
                                        <article
                                            className="agendamento-card"
                                            key={reserva.id_reserva_aula}
                                        >
                                            <div className="agendamento-card-top">
                                                <div>
                                                    <h2>{reserva.nome_aula}</h2>
                                                    <span className="agendamento-tipo">
                                                        {reserva.tipo_aula}
                                                    </span>
                                                </div>

                                                <span className="agendamento-status">
                                                    Confirmada
                                                </span>
                                            </div>

                                            <div className="agendamento-info">
                                                <UserRound size={16} />
                                                {reserva.nome_profissional}
                                            </div>

                                            <div className="agendamento-info">
                                                <CalendarDays size={16} />
                                                {formatarData(reserva.data_horario_aula)}
                                            </div>

                                            <div className="agendamento-info">
                                                <Clock size={16} />
                                                {formatarHorario(reserva.data_horario_aula)}
                                            </div>

                                            <button
                                                className="agendamento-btn cancelar"
                                                disabled={
                                                    idProcessando === reserva.id_reserva_aula
                                                }
                                                onClick={() =>
                                                    cancelarReserva(
                                                        reserva.id_reserva_aula
                                                    )
                                                }
                                            >
                                                {idProcessando === reserva.id_reserva_aula
                                                    ? "Cancelando..."
                                                    : "Cancelar reserva"}
                                            </button>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </>
    );
}

export default AgendamentoAula;
