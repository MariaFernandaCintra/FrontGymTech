
import { useEffect, useMemo, useState } from "react";
import {
    Search,
    Plus,
    CalendarDays,
    CalendarCheck,
    CalendarX,
    X,
    ChevronLeft,
    ChevronRight,
    LoaderCircle,
    Clock,
    Users,
    Pencil,
    Ban
} from "lucide-react";

import ClientSidebar from "../../componets/client-sidebar/client-sidebar";
import { menuAcademia } from "../../componets/client-sidebar/menus";
import api from "../../services/api";

import "./listar-aulas.css";

function ListarAulas() {
    const [aulas, setAulas] = useState([]);
    const [profissionais, setProfissionais] = useState([]);

    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");

    const [pesquisa, setPesquisa] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("Todas");
    const [paginaAtual, setPaginaAtual] = useState(1);

    const [modalAberto, setModalAberto] = useState(false);
    const [aulaEditando, setAulaEditando] = useState(null);
    const [salvando, setSalvando] = useState(false);
    const [erroFormulario, setErroFormulario] = useState("");

    const [aulaSelecionada, setAulaSelecionada] = useState(null);
    const [cancelando, setCancelando] = useState(false);
    const [erroCancelamento, setErroCancelamento] = useState("");

    const aulasPorPagina = 10;

    const formularioInicial = {
        fk_id_profissional: "",
        nome_aula: "",
        tipo_aula: "",
        data_horario: "",
        capacidade_maxima: "20"
    };

    const [formulario, setFormulario] = useState(formularioInicial);

    // TRATAR ERROS DA API
    const obterErro = (error, mensagemPadrao) => {
        const detalhe = error.response?.data?.detail;

        if (typeof detalhe === "string") return detalhe;

        if (Array.isArray(detalhe)) {
            return detalhe.map((item) => item.msg).join(", ");
        }

        return error.response?.data?.mensagem || mensagemPadrao;
    };

    // BUSCAR AULAS
    const buscarAulas = async () => {
        try {
            setLoading(true);
            setErro("");

            const response = await api.get("/aulas", {
                params: {
                    status: "Todas",
                    limit: 500,
                    offset: 0
                }
            });

            setAulas(response.data.itens || []);
        } catch (error) {
            console.error("Erro ao buscar aulas:", error);
            setErro(obterErro(error, "Não foi possível carregar as aulas."));
        } finally {
            setLoading(false);
        }
    };

    // BUSCAR PROFISSIONAIS ATIVOS
    const buscarProfissionais = async () => {
        try {
            const response = await api.get("/profissionais", {
                params: {
                    status: "Ativo",
                    limit: 500,
                    offset: 0
                }
            });

            setProfissionais(
                (response.data.itens || []).filter(
                    (profissional) =>
                        profissional.status?.toLowerCase() === "ativo"
                )
            );
        } catch (error) {
            console.error("Erro ao buscar profissionais:", error);
        }
    };

    useEffect(() => {
        buscarAulas();
        buscarProfissionais();
    }, []);

    // FILTRAR AULAS
    const aulasFiltradas = useMemo(() => {
        const termo = pesquisa.toLowerCase().trim();

        return aulas.filter((aula) => {
            const correspondePesquisa =
                aula.nome_aula?.toLowerCase().includes(termo) ||
                aula.tipo_aula?.toLowerCase().includes(termo) ||
                aula.nome_profissional?.toLowerCase().includes(termo);

            const correspondeStatus =
                filtroStatus === "Todas" ||
                aula.status?.toLowerCase() === filtroStatus.toLowerCase();

            return correspondePesquisa && correspondeStatus;
        });
    }, [aulas, pesquisa, filtroStatus]);

    // PAGINAÇÃO
    const totalPaginas = Math.max(
        1,
        Math.ceil(aulasFiltradas.length / aulasPorPagina)
    );

    const aulasExibidas = aulasFiltradas.slice(
        (paginaAtual - 1) * aulasPorPagina,
        paginaAtual * aulasPorPagina
    );

    // INDICADORES
    const totalAulas = aulas.length;

    const aulasAtivas = aulas.filter(
        (aula) => aula.status?.toLowerCase() === "ativa"
    ).length;

    const aulasCanceladas = aulas.filter(
        (aula) => aula.status?.toLowerCase() === "cancelada"
    ).length;

    // ALTERAR FORMULÁRIO
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: value
        }));
    };

    // CONVERTER DATA PARA O CAMPO DATETIME-LOCAL
    const formatarParaInput = (data) => {
        if (!data) return "";

        const dataObj = new Date(data);

        const ano = dataObj.getFullYear();
        const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
        const dia = String(dataObj.getDate()).padStart(2, "0");
        const hora = String(dataObj.getHours()).padStart(2, "0");
        const minuto = String(dataObj.getMinutes()).padStart(2, "0");

        return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
    };

    // FORMATAR DATA PARA EXIBIÇÃO
    const formatarData = (data) => {
        if (!data) return "-";

        const dataObj = new Date(data);

        return dataObj.toLocaleDateString("pt-BR");
    };

    const formatarHorario = (data) => {
        if (!data) return "-";

        const dataObj = new Date(data);

        return dataObj.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // ABRIR MODAL DE CADASTRO
    const abrirModalCadastro = () => {
        setAulaEditando(null);
        setFormulario(formularioInicial);
        setErroFormulario("");
        setModalAberto(true);
    };

    // ABRIR MODAL DE EDIÇÃO
    const abrirModalEdicao = async (aula) => {
        try {
            setErroFormulario("");

            const response = await api.get(`/aulas/${aula.id_aula}`);
            const dados = response.data;

            setAulaEditando(dados);

            setFormulario({
                fk_id_profissional: String(dados.fk_id_profissional),
                nome_aula: dados.nome_aula || "",
                tipo_aula: dados.tipo_aula || "",
                data_horario: formatarParaInput(dados.data_horario),
                capacidade_maxima: String(dados.capacidade_maxima)
            });

            setModalAberto(true);
        } catch (error) {
            console.error("Erro ao buscar detalhes da aula:", error);
            setMensagem(obterErro(error, "Não foi possível abrir a aula para edição."));
        }
    };

    // CADASTRAR OU EDITAR AULA
    const handleSalvar = async (event) => {
        event.preventDefault();

        try {
            setSalvando(true);
            setErroFormulario("");

            const dados = {
                fk_id_profissional: Number(formulario.fk_id_profissional),
                nome_aula: formulario.nome_aula.trim(),
                tipo_aula: formulario.tipo_aula.trim(),
                data_horario: formulario.data_horario,
                capacidade_maxima: Number(formulario.capacidade_maxima)
            };

            if (aulaEditando) {
                await api.patch(`/aulas/${aulaEditando.id_aula}`, dados);
                setMensagem("Aula atualizada com sucesso!");
            } else {
                await api.post("/aulas", dados);
                setMensagem("Aula cadastrada com sucesso!");
            }

            setModalAberto(false);
            setAulaEditando(null);
            setFormulario(formularioInicial);

            await buscarAulas();
        } catch (error) {
            console.error("Erro ao salvar aula:", error);
            setErroFormulario(
                obterErro(error, "Não foi possível salvar a aula.")
            );
        } finally {
            setSalvando(false);
        }
    };

    // ABRIR CONFIRMAÇÃO DE CANCELAMENTO
    const abrirConfirmacaoCancelamento = (aula) => {
        setErroCancelamento("");
        setAulaSelecionada(aula);
    };

    // CANCELAR AULA
    const handleCancelarAula = async () => {
        if (!aulaSelecionada) return;

        try {
            setCancelando(true);
            setErroCancelamento("");

            const response = await api.delete(
                `/aulas/${aulaSelecionada.id_aula}`
            );

            setMensagem(
                response.data.mensagem || "Aula cancelada com sucesso!"
            );

            setAulaSelecionada(null);

            await buscarAulas();
        } catch (error) {
            console.error("Erro ao cancelar aula:", error);
            setErroCancelamento(
                obterErro(error, "Não foi possível cancelar a aula.")
            );
        } finally {
            setCancelando(false);
        }
    };

    // ALTERAR FILTRO
    const alterarFiltro = (status) => {
        setFiltroStatus(status);
        setPaginaAtual(1);
    };

    // ALTERAR PESQUISA
    const alterarPesquisa = (event) => {
        setPesquisa(event.target.value);
        setPaginaAtual(1);
    };

    return (
        <div className="la-layout">
            <ClientSidebar
                menu={menuAcademia}
                name="Academia"
                plan="Gestão"
            />

            <main className="la-main">
                <div className="la-header">
                    <div>
                        <span className="la-subtitle">GERENCIAMENTO</span>
                        <h1>Aulas</h1>
                        <p>Gerencie as aulas e os horários da sua academia.</p>
                    </div>

                    <button
                        type="button"
                        className="la-add-button"
                        onClick={abrirModalCadastro}
                    >
                        <Plus size={18} />
                        Nova aula
                    </button>
                </div>

                {mensagem && (
                    <div className="la-success-message">
                        <span>{mensagem}</span>

                        <button
                            type="button"
                            onClick={() => setMensagem("")}
                            aria-label="Fechar mensagem"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* INDICADORES */}
                <section className="la-stats">
                    <div className="la-stat-card">
                        <div className="la-stat-icon">
                            <CalendarDays size={21} />
                        </div>

                        <div>
                            <span>Total de aulas</span>
                            <strong>{totalAulas}</strong>
                        </div>
                    </div>

                    <div className="la-stat-card">
                        <div className="la-stat-icon la-active-icon">
                            <CalendarCheck size={21} />
                        </div>

                        <div>
                            <span>Aulas ativas</span>
                            <strong>{aulasAtivas}</strong>
                        </div>
                    </div>

                    <div className="la-stat-card">
                        <div className="la-stat-icon la-inactive-icon">
                            <CalendarX size={21} />
                        </div>

                        <div>
                            <span>Aulas canceladas</span>
                            <strong>{aulasCanceladas}</strong>
                        </div>
                    </div>
                </section>

                {/* LISTAGEM */}
                <section className="la-content">
                    <div className="la-list-header">
                        <div>
                            <h2>Todas as aulas</h2>
                            <span>
                                {aulasFiltradas.length} aula(s) encontrada(s)
                            </span>
                        </div>

                        <div className="la-search">
                            <Search size={17} />

                            <input
                                type="text"
                                placeholder="Pesquisar aula ou profissional..."
                                value={pesquisa}
                                onChange={alterarPesquisa}
                            />
                        </div>
                    </div>

                    {/* FILTROS */}
                    <div className="la-filters">
                        {["Todas", "Ativa", "Cancelada"].map((status) => (
                            <button
                                key={status}
                                type="button"
                                className={filtroStatus === status ? "selected" : ""}
                                onClick={() => alterarFiltro(status)}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="la-state">
                            <LoaderCircle className="la-spinner" size={28} />
                            <p>Carregando aulas...</p>
                        </div>
                    ) : erro ? (
                        <div className="la-state la-error">
                            <p>{erro}</p>

                            <button type="button" onClick={buscarAulas}>
                                Tentar novamente
                            </button>
                        </div>
                    ) : aulasExibidas.length === 0 ? (
                        <div className="la-state">
                            <CalendarDays size={32} />
                            <p>Nenhuma aula encontrada.</p>
                        </div>
                    ) : (
                        <>
                            <div className="la-table-container">
                                <table className="la-table">
                                    <thead>
                                        <tr>
                                            <th>Aula</th>
                                            <th>Profissional</th>
                                            <th>Data</th>
                                            <th>Horário</th>
                                            <th>Vagas</th>
                                            <th>Status</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {aulasExibidas.map((aula) => (
                                            <tr key={aula.id_aula}>
                                                <td>
                                                    <div className="la-class-info">
                                                        <div className="la-class-avatar">
                                                            <CalendarDays size={18} />
                                                        </div>

                                                        <div>
                                                            <strong>{aula.nome_aula}</strong>
                                                            <span>{aula.tipo_aula}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>{aula.nome_profissional || "-"}</td>

                                                <td>{formatarData(aula.data_horario)}</td>

                                                <td>
                                                    <span className="la-time">
                                                        <Clock size={14} />
                                                        {formatarHorario(aula.data_horario)}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="la-vacancies">
                                                        <Users size={14} />
                                                        {aula.vagas_ocupadas || 0}/
                                                        {aula.capacidade_maxima}
                                                    </span>
                                                    <small className="la-available">
                                                        {aula.vagas_disponiveis ?? 0} disponível(is)
                                                    </small>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`la-status ${
                                                            aula.status?.toLowerCase() === "ativa"
                                                                ? "status-active"
                                                                : "status-inactive"
                                                        }`}
                                                    >
                                                        {aula.status || "Não informado"}
                                                    </span>
                                                </td>

                                                <td>
                                                    {aula.status?.toLowerCase() === "ativa" ? (
                                                        <div className="la-actions">
                                                            <button
                                                                type="button"
                                                                className="la-edit-button"
                                                                onClick={() => abrirModalEdicao(aula)}
                                                                title="Editar aula"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="la-cancel-button"
                                                                onClick={() =>
                                                                    abrirConfirmacaoCancelamento(aula)
                                                                }
                                                                title="Cancelar aula"
                                                            >
                                                                <Ban size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="la-inactive-label">
                                                            Cancelada
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* PAGINAÇÃO */}
                            <div className="la-pagination">
                                <span>
                                    Página {paginaAtual} de {totalPaginas}
                                </span>

                                <div>
                                    <button
                                        type="button"
                                        disabled={paginaAtual === 1}
                                        onClick={() =>
                                            setPaginaAtual((pagina) => pagina - 1)
                                        }
                                        aria-label="Página anterior"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>

                                    <button
                                        type="button"
                                        disabled={paginaAtual === totalPaginas}
                                        onClick={() =>
                                            setPaginaAtual((pagina) => pagina + 1)
                                        }
                                        aria-label="Próxima página"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </main>

            {/* MODAL DE CADASTRO / EDIÇÃO */}
            {modalAberto && (
                <div
                    className="la-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !salvando) {
                            setModalAberto(false);
                        }
                    }}
                >
                    <div className="la-modal">
                        <div className="la-modal-header">
                            <div>
                                <h2>
                                    {aulaEditando ? "Editar aula" : "Cadastrar aula"}
                                </h2>
                                <p>
                                    {aulaEditando
                                        ? "Altere as informações da aula."
                                        : "Preencha os dados para adicionar uma nova aula."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setModalAberto(false)}
                                aria-label="Fechar"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSalvar}>
                            <div className="la-form-grid">
                                <div className="la-field la-full">
                                    <label htmlFor="nome_aula">Nome da aula</label>
                                    <input
                                        id="nome_aula"
                                        name="nome_aula"
                                        value={formulario.nome_aula}
                                        onChange={handleChange}
                                        placeholder="Ex.: Treinamento funcional"
                                        required
                                    />
                                </div>

                                <div className="la-field">
                                    <label htmlFor="tipo_aula">Tipo de aula</label>
                                    <input
                                        id="tipo_aula"
                                        name="tipo_aula"
                                        value={formulario.tipo_aula}
                                        onChange={handleChange}
                                        placeholder="Ex.: Coletiva"
                                        required
                                    />
                                </div>

                                <div className="la-field">
                                    <label htmlFor="capacidade_maxima">
                                        Capacidade máxima
                                    </label>
                                    <input
                                        id="capacidade_maxima"
                                        name="capacidade_maxima"
                                        type="number"
                                        min="1"
                                        max="500"
                                        value={formulario.capacidade_maxima}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="la-field la-full">
                                    <label htmlFor="fk_id_profissional">
                                        Profissional responsável
                                    </label>
                                    <select
                                        id="fk_id_profissional"
                                        name="fk_id_profissional"
                                        value={formulario.fk_id_profissional}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Selecione um profissional</option>

                                        {profissionais.map((profissional) => (
                                            <option
                                                key={profissional.id_usuario}
                                                value={profissional.id_usuario}
                                            >
                                                {profissional.nome}
                                                {profissional.especialidade
                                                    ? ` - ${profissional.especialidade}`
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>

                                    {profissionais.length === 0 && (
                                        <small className="la-field-hint">
                                            Nenhum profissional ativo foi encontrado.
                                        </small>
                                    )}
                                </div>

                                <div className="la-field la-full">
                                    <label htmlFor="data_horario">
                                        Data e horário
                                    </label>
                                    <input
                                        id="data_horario"
                                        name="data_horario"
                                        type="datetime-local"
                                        value={formulario.data_horario}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {erroFormulario && (
                                <div className="la-form-error">
                                    {erroFormulario}
                                </div>
                            )}

                            <div className="la-modal-actions">
                                <button
                                    type="button"
                                    className="la-cancel-button-form"
                                    onClick={() => setModalAberto(false)}
                                    disabled={salvando}
                                >
                                    Voltar
                                </button>

                                <button
                                    type="submit"
                                    className="la-save-button"
                                    disabled={salvando || profissionais.length === 0}
                                >
                                    {salvando
                                        ? "Salvando..."
                                        : aulaEditando
                                            ? "Salvar alterações"
                                            : "Cadastrar aula"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMAÇÃO DE CANCELAMENTO */}
            {aulaSelecionada && (
                <div
                    className="la-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !cancelando) {
                            setAulaSelecionada(null);
                            setErroCancelamento("");
                        }
                    }}
                >
                    <div className="la-confirm-modal">
                        <div className="la-confirm-icon">
                            <Ban size={25} />
                        </div>

                        <h2>Cancelar aula?</h2>

                        <p>
                            Tem certeza de que deseja cancelar a aula{" "}
                            <strong>{aulaSelecionada.nome_aula}</strong>?
                        </p>

                        <p className="la-confirm-warning">
                            Essa ação marcará a aula como cancelada e as reservas
                            confirmadas vinculadas a ela também serão canceladas.
                        </p>

                        {erroCancelamento && (
                            <div className="la-form-error">
                                {erroCancelamento}
                            </div>
                        )}

                        <div className="la-modal-actions">
                            <button
                                type="button"
                                className="la-cancel-button-form"
                                onClick={() => {
                                    setAulaSelecionada(null);
                                    setErroCancelamento("");
                                }}
                                disabled={cancelando}
                            >
                                Voltar
                            </button>

                            <button
                                type="button"
                                className="la-confirm-cancel"
                                onClick={handleCancelarAula}
                                disabled={cancelando}
                            >
                                {cancelando ? "Cancelando..." : "Confirmar cancelamento"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ListarAulas;
