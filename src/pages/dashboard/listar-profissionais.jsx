
import { useEffect, useMemo, useState } from "react";
import {
    Search,
    Plus,
    Users,
    UserCheck,
    UserX,
    X,
    ChevronLeft,
    ChevronRight,
    LoaderCircle
} from "lucide-react";

import ClientSidebar from "../../componets/client-sidebar/client-sidebar";
import { menuAcademia } from "../../componets/client-sidebar/menus";
import api from "../../services/api";

import "./listar-profissionais.css";

function ListarProfissionais() {
    const [profissionais, setProfissionais] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");

    const [pesquisa, setPesquisa] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("Todos");
    const [paginaAtual, setPaginaAtual] = useState(1);

    const [modalAberto, setModalAberto] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [erroCadastro, setErroCadastro] = useState("");

    const [profissionalSelecionado, setProfissionalSelecionado] = useState(null);
    const [inativando, setInativando] = useState(false);
    const [erroInativacao, setErroInativacao] = useState("");

    const profissionaisPorPagina = 10;

    const [formulario, setFormulario] = useState({
        nome: "",
        cpf: "",
        email: "",
        senha: "",
        telefone: "",
        data_nascimento: "",
        especialidade: "",
        registro_profissional: ""
    });

    // BUSCAR PROFISSIONAIS
    const buscarProfissionais = async () => {
        try {
            setLoading(true);
            setErro("");

            const response = await api.get("/profissionais", {
                params: {
                    limit: 500,
                    offset: 0
                }
            });

            setProfissionais(response.data.itens || []);
        } catch (error) {
            console.error("Erro ao buscar profissionais:", error);

            setErro(
                error.response?.data?.detail ||
                error.response?.data?.mensagem ||
                "Não foi possível carregar os profissionais."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        buscarProfissionais();
    }, []);

    // FILTRAR PROFISSIONAIS
    const profissionaisFiltrados = useMemo(() => {
        return profissionais.filter((profissional) => {
            const termo = pesquisa.toLowerCase().trim();

            const correspondePesquisa =
                profissional.nome?.toLowerCase().includes(termo) ||
                profissional.email?.toLowerCase().includes(termo) ||
                profissional.cpf?.includes(termo) ||
                profissional.especialidade?.toLowerCase().includes(termo) ||
                profissional.registro_profissional?.toLowerCase().includes(termo);

            const correspondeStatus =
                filtroStatus === "Todos" ||
                profissional.status?.toLowerCase() === filtroStatus.toLowerCase();

            return correspondePesquisa && correspondeStatus;
        });
    }, [profissionais, pesquisa, filtroStatus]);

    // PAGINAÇÃO
    const totalPaginas = Math.max(
        1,
        Math.ceil(profissionaisFiltrados.length / profissionaisPorPagina)
    );

    const profissionaisExibidos = profissionaisFiltrados.slice(
        (paginaAtual - 1) * profissionaisPorPagina,
        paginaAtual * profissionaisPorPagina
    );

    // CONTADORES
    const totalProfissionais = profissionais.length;

    const profissionaisAtivos = profissionais.filter(
        (profissional) => profissional.status?.toLowerCase() === "ativo"
    ).length;

    const profissionaisInativos = profissionais.filter(
        (profissional) => profissional.status?.toLowerCase() === "inativo"
    ).length;

    // ALTERAR FORMULÁRIO
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: value
        }));
    };

    // ABRIR MODAL DE CADASTRO
    const abrirModal = () => {
        setErroCadastro("");

        setFormulario({
            nome: "",
            cpf: "",
            email: "",
            senha: "",
            telefone: "",
            data_nascimento: "",
            especialidade: "",
            registro_profissional: ""
        });

        setModalAberto(true);
    };

    // CADASTRAR PROFISSIONAL
    const handleCadastrar = async (event) => {
        event.preventDefault();

        try {
            setSalvando(true);
            setErroCadastro("");

            await api.post("/profissionais", formulario);

            setModalAberto(false);
            setMensagem("Profissional cadastrado com sucesso!");

            await buscarProfissionais();
        } catch (error) {
            console.error("Erro ao cadastrar profissional:", error);

            const detalhe = error.response?.data?.detail;

            setErroCadastro(
                typeof detalhe === "string"
                    ? detalhe
                    : Array.isArray(detalhe)
                        ? detalhe.map((item) => item.msg).join(", ")
                        : error.response?.data?.mensagem ||
                        "Não foi possível cadastrar o profissional."
            );
        } finally {
            setSalvando(false);
        }
    };

    // FORMATAR DATA
    const formatarData = (data) => {
        if (!data) return "-";

        const [ano, mes, dia] = data.split("T")[0].split("-");

        return `${dia}/${mes}/${ano}`;
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

    // ABRIR CONFIRMAÇÃO DE INATIVAÇÃO
    const abrirConfirmacaoInativacao = (profissional) => {
        setErroInativacao("");
        setProfissionalSelecionado(profissional);
    };

    // INATIVAR PROFISSIONAL
    const handleInativar = async () => {
        if (!profissionalSelecionado) return;

        try {
            setInativando(true);
            setErroInativacao("");

            const response = await api.delete(
                `/profissionais/${profissionalSelecionado.id_usuario}`
            );

            const dados = response.data;

            const resumoCancelamentos = Object.entries(
                dados.cancelamentos || {}
            )
                .filter(([, quantidade]) => Number(quantidade) > 0)
                .map(([tipo, quantidade]) => `${quantidade} ${tipo}`)
                .join(", ");

            setMensagem(
                resumoCancelamentos
                    ? `${dados.mensagem} Cancelamentos: ${resumoCancelamentos}.`
                    : dados.mensagem || "Profissional inativado com sucesso!"
            );

            setProfissionalSelecionado(null);

            await buscarProfissionais();
        } catch (error) {
            console.error("Erro ao inativar profissional:", error);

            const detalhe = error.response?.data?.detail;

            setErroInativacao(
                typeof detalhe === "string"
                    ? detalhe
                    : Array.isArray(detalhe)
                        ? detalhe.map((item) => item.msg).join(", ")
                        : error.response?.data?.mensagem ||
                        "Não foi possível inativar o profissional."
            );
        } finally {
            setInativando(false);
        }
    };

    return (
        <div className="lp-layout">
            <ClientSidebar
                menu={menuAcademia}
                name="Academia"
                plan="Gestão"
            />

            <main className="lp-main">
                <div className="lp-header">
                    <div>
                        <span className="lp-subtitle">GERENCIAMENTO</span>
                        <h1>Profissionais</h1>
                        <p>Gerencie os profissionais cadastrados na sua academia.</p>
                    </div>

                    <button
                        type="button"
                        className="lp-add-button"
                        onClick={abrirModal}
                    >
                        <Plus size={18} />
                        Novo profissional
                    </button>
                </div>

                {mensagem && (
                    <div className="lp-success-message">
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
                <section className="lp-stats">
                    <div className="lp-stat-card">
                        <div className="lp-stat-icon">
                            <Users size={21} />
                        </div>

                        <div>
                            <span>Total de profissionais</span>
                            <strong>{totalProfissionais}</strong>
                        </div>
                    </div>

                    <div className="lp-stat-card">
                        <div className="lp-stat-icon lp-active-icon">
                            <UserCheck size={21} />
                        </div>

                        <div>
                            <span>Profissionais ativos</span>
                            <strong>{profissionaisAtivos}</strong>
                        </div>
                    </div>

                    <div className="lp-stat-card">
                        <div className="lp-stat-icon lp-inactive-icon">
                            <UserX size={21} />
                        </div>

                        <div>
                            <span>Profissionais inativos</span>
                            <strong>{profissionaisInativos}</strong>
                        </div>
                    </div>
                </section>

                {/* LISTAGEM */}
                <section className="lp-content">
                    <div className="lp-list-header">
                        <div>
                            <h2>Todos os profissionais</h2>
                            <span>
                                {profissionaisFiltrados.length} profissional(is) encontrado(s)
                            </span>
                        </div>

                        <div className="lp-search">
                            <Search size={17} />

                            <input
                                type="text"
                                placeholder="Pesquisar profissional..."
                                value={pesquisa}
                                onChange={alterarPesquisa}
                            />
                        </div>
                    </div>

                    {/* FILTROS */}
                    <div className="lp-filters">
                        {["Todos", "Ativo", "Inativo"].map((status) => (
                            <button
                                key={status}
                                type="button"
                                className={
                                    filtroStatus === status ? "selected" : ""
                                }
                                onClick={() => alterarFiltro(status)}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="lp-state">
                            <LoaderCircle className="lp-spinner" size={28} />
                            <p>Carregando profissionais...</p>
                        </div>
                    ) : erro ? (
                        <div className="lp-state lp-error">
                            <p>{erro}</p>

                            <button
                                type="button"
                                onClick={buscarProfissionais}
                            >
                                Tentar novamente
                            </button>
                        </div>
                    ) : profissionaisExibidos.length === 0 ? (
                        <div className="lp-state">
                            <Users size={32} />
                            <p>Nenhum profissional encontrado.</p>
                        </div>
                    ) : (
                        <>
                            <div className="lp-table-container">
                                <table className="lp-table">
                                    <thead>
                                        <tr>
                                            <th>Profissional</th>
                                            <th>CPF</th>
                                            <th>Telefone</th>
                                            <th>Especialidade</th>
                                            <th>Registro profissional</th>
                                            <th>Status</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {profissionaisExibidos.map((profissional) => (
                                            <tr key={profissional.id_usuario}>
                                                <td>
                                                    <div className="lp-professional">
                                                        <div className="lp-avatar">
                                                            {profissional.nome
                                                                ?.charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <strong>{profissional.nome}</strong>
                                                            <span>{profissional.email}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>{profissional.cpf || "-"}</td>

                                                <td>{profissional.telefone || "-"}</td>

                                                <td>{profissional.especialidade || "-"}</td>

                                                <td>
                                                    {profissional.registro_profissional || "-"}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`lp-status ${
                                                            profissional.status?.toLowerCase() === "ativo"
                                                                ? "status-active"
                                                                : "status-inactive"
                                                        }`}
                                                    >
                                                        {profissional.status || "Não informado"}
                                                    </span>
                                                </td>

                                                <td>
                                                    {profissional.status?.toLowerCase() === "ativo" ? (
                                                        <button
                                                            type="button"
                                                            className="lp-deactivate-button"
                                                            onClick={() =>
                                                                abrirConfirmacaoInativacao(profissional)
                                                            }
                                                            title="Inativar profissional"
                                                        >
                                                            <UserX size={16} />
                                                            Inativar
                                                        </button>
                                                    ) : (
                                                        <span className="lp-inactive-label">
                                                            Inativo
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* PAGINAÇÃO */}
                            <div className="lp-pagination">
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

            {/* MODAL DE CADASTRO */}
            {modalAberto && (
                <div
                    className="lp-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !salvando) {
                            setModalAberto(false);
                        }
                    }}
                >
                    <div className="lp-modal">
                        <div className="lp-modal-header">
                            <div>
                                <h2>Cadastrar profissional</h2>
                                <p>Preencha os dados para adicionar um profissional.</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setModalAberto(false)}
                                aria-label="Fechar"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCadastrar}>
                            <div className="lp-form-grid">
                                <div className="lp-field lp-full">
                                    <label htmlFor="nome">Nome completo</label>
                                    <input
                                        id="nome"
                                        name="nome"
                                        value={formulario.nome}
                                        onChange={handleChange}
                                        placeholder="Digite o nome completo"
                                        required
                                    />
                                </div>

                                <div className="lp-field">
                                    <label htmlFor="cpf">CPF</label>
                                    <input
                                        id="cpf"
                                        name="cpf"
                                        value={formulario.cpf}
                                        onChange={handleChange}
                                        placeholder="Digite o CPF"
                                        required
                                    />
                                </div>

                                <div className="lp-field">
                                    <label htmlFor="telefone">Telefone</label>
                                    <input
                                        id="telefone"
                                        name="telefone"
                                        value={formulario.telefone}
                                        onChange={handleChange}
                                        placeholder="Digite o telefone"
                                        required
                                    />
                                </div>

                                <div className="lp-field lp-full">
                                    <label htmlFor="email">E-mail</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formulario.email}
                                        onChange={handleChange}
                                        placeholder="Digite o e-mail"
                                        required
                                    />
                                </div>

                                <div className="lp-field lp-full">
                                    <label htmlFor="senha">Senha</label>
                                    <input
                                        id="senha"
                                        name="senha"
                                        type="password"
                                        value={formulario.senha}
                                        onChange={handleChange}
                                        placeholder="Crie uma senha"
                                        minLength={8}
                                        required
                                    />
                                </div>

                                <div className="lp-field">
                                    <label htmlFor="data_nascimento">
                                        Data de nascimento
                                    </label>
                                    <input
                                        id="data_nascimento"
                                        name="data_nascimento"
                                        type="date"
                                        value={formulario.data_nascimento}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="lp-field">
                                    <label htmlFor="especialidade">Especialidade</label>
                                    <input
                                        id="especialidade"
                                        name="especialidade"
                                        value={formulario.especialidade}
                                        onChange={handleChange}
                                        placeholder="Ex.: Musculação"
                                        required
                                    />
                                </div>

                                <div className="lp-field lp-full">
                                    <label htmlFor="registro_profissional">
                                        Registro profissional
                                    </label>
                                    <input
                                        id="registro_profissional"
                                        name="registro_profissional"
                                        value={formulario.registro_profissional}
                                        onChange={handleChange}
                                        placeholder="Ex.: CREF 000000-G/SP"
                                        required
                                    />
                                </div>
                            </div>

                            {erroCadastro && (
                                <div className="lp-form-error">
                                    {erroCadastro}
                                </div>
                            )}

                            <div className="lp-modal-actions">
                                <button
                                    type="button"
                                    className="lp-cancel-button"
                                    onClick={() => setModalAberto(false)}
                                    disabled={salvando}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="lp-save-button"
                                    disabled={salvando}
                                >
                                    {salvando
                                        ? "Cadastrando..."
                                        : "Cadastrar profissional"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMAÇÃO DE INATIVAÇÃO */}
            {profissionalSelecionado && (
                <div
                    className="lp-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !inativando) {
                            setProfissionalSelecionado(null);
                            setErroInativacao("");
                        }
                    }}
                >
                    <div className="lp-confirm-modal">
                        <div className="lp-confirm-icon">
                            <UserX size={25} />
                        </div>

                        <h2>Inativar profissional?</h2>

                        <p>
                            Tem certeza de que deseja inativar{" "}
                            <strong>{profissionalSelecionado.nome}</strong>?
                        </p>

                        <p className="lp-confirm-warning">
                            O profissional não será excluído do banco de dados.
                            Entretanto, os compromissos futuros vinculados a ele
                            poderão ser cancelados.
                        </p>

                        {erroInativacao && (
                            <div className="lp-form-error">
                                {erroInativacao}
                            </div>
                        )}

                        <div className="lp-modal-actions">
                            <button
                                type="button"
                                className="lp-cancel-button"
                                onClick={() => {
                                    setProfissionalSelecionado(null);
                                    setErroInativacao("");
                                }}
                                disabled={inativando}
                            >
                                Voltar
                            </button>

                            <button
                                type="button"
                                className="lp-deactivate-confirm"
                                onClick={handleInativar}
                                disabled={inativando}
                            >
                                {inativando
                                    ? "Inativando..."
                                    : "Confirmar inativação"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ListarProfissionais;
