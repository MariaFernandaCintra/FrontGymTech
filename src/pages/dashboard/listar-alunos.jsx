
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

import "./listar-aluno.css";

function ListarAluno() {
    const [alunos, setAlunos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");

    const [pesquisa, setPesquisa] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("Todos");
    const [paginaAtual, setPaginaAtual] = useState(1);

    const [modalAberto, setModalAberto] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [erroCadastro, setErroCadastro] = useState("");

    const alunosPorPagina = 10;

    const [formulario, setFormulario] = useState({
        nome: "",
        cpf: "",
        email: "",
        senha: "",
        telefone: "",
        data_nascimento: "",
        objetivo: ""
    });

    // BUSCAR ALUNOS
    const buscarAlunos = async () => {
        try {
            setLoading(true);
            setErro("");

            const response = await api.get("/alunos", {
                params: {
                    limit: 500,
                    offset: 0
                }
            });

            setAlunos(response.data.itens || []);
        } catch (error) {
            console.error("Erro ao buscar alunos:", error);

            setErro(
                error.response?.data?.detail ||
                error.response?.data?.mensagem ||
                "Não foi possível carregar os alunos."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        buscarAlunos();
    }, []);

    // FILTRAR ALUNOS
    const alunosFiltrados = useMemo(() => {
        return alunos.filter((aluno) => {
            const termo = pesquisa.toLowerCase().trim();

            const correspondePesquisa =
                aluno.nome?.toLowerCase().includes(termo) ||
                aluno.email?.toLowerCase().includes(termo) ||
                aluno.cpf?.includes(termo);

            const correspondeStatus =
                filtroStatus === "Todos" ||
                aluno.status?.toLowerCase() === filtroStatus.toLowerCase();

            return correspondePesquisa && correspondeStatus;
        });
    }, [alunos, pesquisa, filtroStatus]);

    // PAGINAÇÃO
    const totalPaginas = Math.max(
        1,
        Math.ceil(alunosFiltrados.length / alunosPorPagina)
    );

    const alunosExibidos = alunosFiltrados.slice(
        (paginaAtual - 1) * alunosPorPagina,
        paginaAtual * alunosPorPagina
    );

    // CONTADORES
    const totalAlunos = alunos.length;

    const alunosAtivos = alunos.filter(
        (aluno) => aluno.status?.toLowerCase() === "ativo"
    ).length;

    const alunosInativos = alunos.filter(
        (aluno) => aluno.status?.toLowerCase() === "inativo"
    ).length;

    // ALTERAR FORMULÁRIO
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: value
        }));
    };

    // ABRIR MODAL
    const abrirModal = () => {
        setErroCadastro("");
        setFormulario({
            nome: "",
            cpf: "",
            email: "",
            senha: "",
            telefone: "",
            data_nascimento: "",
            objetivo: ""
        });

        setModalAberto(true);
    };

    // CADASTRAR ALUNO
    const handleCadastrar = async (event) => {
        event.preventDefault();

        try {
            setSalvando(true);
            setErroCadastro("");

            await api.post("/alunos", formulario);

            setModalAberto(false);
            setMensagem("Aluno cadastrado com sucesso!");

            await buscarAlunos();
        } catch (error) {
            console.error("Erro ao cadastrar aluno:", error);

            setErroCadastro(
                error.response?.data?.detail ||
                error.response?.data?.mensagem ||
                "Não foi possível cadastrar o aluno."
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

    return (
        <div className="la-layout">
            <ClientSidebar menu={menuAcademia} name="Academia" plan="Gestão" />

            <main className="la-main">
                <div className="la-header">
                    <div>
                        <span className="la-subtitle">GERENCIAMENTO</span>
                        <h1>Alunos</h1>
                        <p>Gerencie os alunos cadastrados na sua academia.</p>
                    </div>

                    <button
                        type="button"
                        className="la-add-button"
                        onClick={abrirModal}
                    >
                        <Plus size={18} />
                        Novo aluno
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
                            <Users size={21} />
                        </div>
                        <div>
                            <span>Total de alunos</span>
                            <strong>{totalAlunos}</strong>
                        </div>
                    </div>

                    <div className="la-stat-card">
                        <div className="la-stat-icon la-active-icon">
                            <UserCheck size={21} />
                        </div>
                        <div>
                            <span>Alunos ativos</span>
                            <strong>{alunosAtivos}</strong>
                        </div>
                    </div>

                    <div className="la-stat-card">
                        <div className="la-stat-icon la-inactive-icon">
                            <UserX size={21} />
                        </div>
                        <div>
                            <span>Alunos inativos</span>
                            <strong>{alunosInativos}</strong>
                        </div>
                    </div>
                </section>

                {/* LISTAGEM */}
                <section className="la-content">
                    <div className="la-list-header">
                        <div>
                            <h2>Todos os alunos</h2>
                            <span>
                                {alunosFiltrados.length} aluno(s) encontrado(s)
                            </span>
                        </div>

                        <div className="la-search">
                            <Search size={17} />
                            <input
                                type="text"
                                placeholder="Pesquisar aluno..."
                                value={pesquisa}
                                onChange={alterarPesquisa}
                            />
                        </div>
                    </div>

                    {/* FILTROS */}
                    <div className="la-filters">
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
                        <div className="la-state">
                            <LoaderCircle className="la-spinner" size={28} />
                            <p>Carregando alunos...</p>
                        </div>
                    ) : erro ? (
                        <div className="la-state la-error">
                            <p>{erro}</p>
                            <button type="button" onClick={buscarAlunos}>
                                Tentar novamente
                            </button>
                        </div>
                    ) : alunosExibidos.length === 0 ? (
                        <div className="la-state">
                            <Users size={32} />
                            <p>Nenhum aluno encontrado.</p>
                        </div>
                    ) : (
                        <>
                            <div className="la-table-container">
                                <table className="la-table">
                                    <thead>
                                        <tr>
                                            <th>Aluno</th>
                                            <th>CPF</th>
                                            <th>Telefone</th>
                                            <th>Data de nascimento</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {alunosExibidos.map((aluno) => (
                                            <tr key={aluno.id_usuario}>
                                                <td>
                                                    <div className="la-student">
                                                        <div className="la-avatar">
                                                            {aluno.nome
                                                                ?.charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <strong>{aluno.nome}</strong>
                                                            <span>{aluno.email}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>{aluno.cpf || "-"}</td>
                                                <td>{aluno.telefone || "-"}</td>
                                                <td>
                                                    {formatarData(aluno.data_nascimento)}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`la-status ${
                                                            aluno.status?.toLowerCase() === "ativo"
                                                                ? "status-active"
                                                                : "status-inactive"
                                                        }`}
                                                    >
                                                        {aluno.status || "Não informado"}
                                                    </span>
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

            {/* MODAL DE CADASTRO */}
            {modalAberto && (
                <div
                    className="la-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setModalAberto(false);
                        }
                    }}
                >
                    <div className="la-modal">
                        <div className="la-modal-header">
                            <div>
                                <h2>Cadastrar aluno</h2>
                                <p>Preencha os dados para adicionar um aluno.</p>
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
                            <div className="la-form-grid">
                                <div className="la-field la-full">
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

                                <div className="la-field">
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

                                <div className="la-field">
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

                                <div className="la-field la-full">
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

                                <div className="la-field la-full">
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

                                <div className="la-field">
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

                                <div className="la-field">
                                    <label htmlFor="objetivo">Objetivo</label>
                                    <input
                                        id="objetivo"
                                        name="objetivo"
                                        value={formulario.objetivo}
                                        onChange={handleChange}
                                        placeholder="Ex.: Hipertrofia"
                                        required
                                    />
                                </div>
                            </div>

                            {erroCadastro && (
                                <div className="la-form-error">
                                    {erroCadastro}
                                </div>
                            )}

                            <div className="la-modal-actions">
                                <button
                                    type="button"
                                    className="la-cancel-button"
                                    onClick={() => setModalAberto(false)}
                                    disabled={salvando}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="la-save-button"
                                    disabled={salvando}
                                >
                                    {salvando ? "Cadastrando..." : "Cadastrar aluno"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ListarAluno;
