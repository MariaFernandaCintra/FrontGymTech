
import { useEffect, useState } from "react";
import api from "../../services/api";
import ClientSidebar from "../../componets/client-sidebar/client-sidebar";
import { getUser } from "../../services/auth";
import "./meus-treinos.css";

function MeusTreinos() {
    const user = getUser();

    const [treinos, setTreinos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const [treinoSelecionado, setTreinoSelecionado] = useState(null);
    const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);
    const [erroDetalhes, setErroDetalhes] = useState("");

    function obterDataHoje() {
        const hoje = new Date();

        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, "0");
        const dia = String(hoje.getDate()).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
    }

    useEffect(() => {
        async function carregarTreinos() {
            try {
                setCarregando(true);
                setErro("");

                const response = await api.get("/alunos/me/treinos", {
                    params: {
                        status: "Ativo",
                        data_de: obterDataHoje(),
                        limit: 100,
                        offset: 0
                    }
                });

                setTreinos(response.data.itens || []);
            } catch (error) {
                console.error("Erro ao buscar treinos:", error);

                const detalhe = error.response?.data?.detail;

                setErro(
                    typeof detalhe === "string"
                        ? detalhe
                        : "Não foi possível carregar seus treinos."
                );
            } finally {
                setCarregando(false);
            }
        }

        carregarTreinos();
    }, []);

    async function abrirDetalhes(idTreino) {
        setTreinoSelecionado(null);
        setErroDetalhes("");
        setCarregandoDetalhes(true);

        try {
            const response = await api.get(`/alunos/me/treinos/${idTreino}`);

            setTreinoSelecionado(response.data);
        } catch (error) {
            console.error("Erro ao buscar detalhes do treino:", error);

            const detalhe = error.response?.data?.detail;

            setErroDetalhes(
                typeof detalhe === "string"
                    ? detalhe
                    : "Não foi possível carregar os detalhes deste treino."
            );
        } finally {
            setCarregandoDetalhes(false);
        }
    }

    function fecharModal() {
        setTreinoSelecionado(null);
        setErroDetalhes("");
    }

    function formatarData(data) {
        if (!data) return "Não definida";

        const [ano, mes, dia] = data.split("-");
        return `${dia}/${mes}/${ano}`;
    }

    return (
        <div className="meus-treinos-layout">
            <ClientSidebar
                name={user?.nome || "Aluno"}
                plan="Aluno"
            />

            <main className="meus-treinos-content">
                <div className="meus-treinos-header">
                    <h1>Meus Treinos</h1>
                    <p>
                        Confira seus próximos treinos e acompanhe sua programação.
                    </p>
                </div>

                {carregando && (
                    <p className="treinos-mensagem">
                        Carregando seus treinos...
                    </p>
                )}

                {!carregando && erro && (
                    <p className="treinos-mensagem treinos-erro">
                        {erro}
                    </p>
                )}

                {!carregando && !erro && treinos.length === 0 && (
                    <div className="treinos-vazio">
                        <h2>Nenhum treino futuro encontrado</h2>
                        <p>
                            Quando seus próximos treinos forem programados,
                            eles aparecerão aqui.
                        </p>
                    </div>
                )}

                {!carregando && !erro && treinos.length > 0 && (
                    <div className="treinos-lista">
                        {treinos.map((treino) => (
                            <article
                                className="treino-card"
                                key={treino.id_treino}
                                onClick={() => abrirDetalhes(treino.id_treino)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        abrirDetalhes(treino.id_treino);
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                                aria-label={`Ver detalhes de ${treino.titulo_treino}`}
                            >
                                <div className="treino-card-topo">
                                    <h2>{treino.titulo_treino}</h2>

                                    <span className="treino-status">
                                        {treino.status}
                                    </span>
                                </div>

                                <div className="treino-card-info">
                                    <p>
                                        <strong>Profissional:</strong>{" "}
                                        {treino.nome_profissional}
                                    </p>

                                    <p>
                                        <strong>Data programada:</strong>{" "}
                                        {formatarData(treino.data_programada)}
                                    </p>
                                </div>

                                <span className="treino-ver-detalhes">
                                    Clique para ver detalhes
                                </span>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            {(carregandoDetalhes || treinoSelecionado || erroDetalhes) && (
                <div
                    className="treino-modal-overlay"
                    onClick={fecharModal}
                >
                    <div
                        className="treino-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="treino-modal-titulo"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="treino-modal-fechar"
                            onClick={fecharModal}
                            aria-label="Fechar modal"
                        >
                            ×
                        </button>

                        {carregandoDetalhes && (
                            <p className="treinos-mensagem">
                                Carregando detalhes do treino...
                            </p>
                        )}

                        {erroDetalhes && (
                            <div>
                                <h2>Ops!</h2>
                                <p className="treinos-erro">
                                    {erroDetalhes}
                                </p>

                                <button
                                    type="button"
                                    className="treino-modal-botao"
                                    onClick={fecharModal}
                                >
                                    Fechar
                                </button>
                            </div>
                        )}

                        {treinoSelecionado && (
                            <>
                                <div className="treino-modal-header">
                                    <span>DETALHES DO TREINO</span>
                                    <h2 id="treino-modal-titulo">
                                        {treinoSelecionado.titulo_treino}
                                    </h2>
                                </div>

                                <div className="treino-modal-info">
                                    <div>
                                        <span>Aluno</span>
                                        <strong>
                                            {treinoSelecionado.nome_aluno}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Profissional responsável</span>
                                        <strong>
                                            {treinoSelecionado.nome_profissional}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Data de criação</span>
                                        <strong>
                                            {formatarData(treinoSelecionado.data_criacao)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Data programada</span>
                                        <strong>
                                            {formatarData(treinoSelecionado.data_programada)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Status</span>
                                        <strong className="treino-modal-status">
                                            {treinoSelecionado.status}
                                        </strong>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="treino-modal-botao"
                                    onClick={fecharModal}
                                >
                                    Fechar
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MeusTreinos;
