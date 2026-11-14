
import { useEffect, useState } from "react";
import api from "../../services/api";
import ClientSidebar from "../../componets/client-sidebar/client-sidebar";
import { getUser } from "../../services/auth";

function HistoricoTreinos() {
    const user = getUser();

    const [treinos, setTreinos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const [treinoSelecionado, setTreinoSelecionado] = useState(null);
    const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);
    const [erroDetalhes, setErroDetalhes] = useState("");

    // Retorna a data de ontem no formato AAAA-MM-DD
    function obterDataOntem() {
        const ontem = new Date();
        ontem.setDate(ontem.getDate() - 1);

        const ano = ontem.getFullYear();
        const mes = String(ontem.getMonth() + 1).padStart(2, "0");
        const dia = String(ontem.getDate()).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
    }

    // Busca os treinos anteriores à data atual
    // Busca o histórico de treinos do aluno autenticado
    useEffect(() => {
        async function carregarHistorico() {
            try {
                setCarregando(true);
                setErro("");

                const response = await api.get("/alunos/me/treinos/historico");

                const listaTreinos = Array.isArray(response.data?.itens)
                    ? response.data.itens
                    : [];

                setTreinos(listaTreinos);

            } catch (error) {
                console.error("Erro ao buscar histórico de treinos:", error);

                const detalhe = error.response?.data?.detail;

                setErro(
                    typeof detalhe === "string"
                        ? detalhe
                        : "Não foi possível carregar seu histórico de treinos."
                );
            } finally {
                setCarregando(false);
            }
        }

        carregarHistorico();
    }, []);


    // Abre os detalhes do treino selecionado
    async function abrirDetalhes(idTreino) {
        setTreinoSelecionado(null);
        setErroDetalhes("");
        setCarregandoDetalhes(true);

        try {
            const response = await api.get(
                `/alunos/me/treinos/${idTreino}`
            );

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
        <div className="historico-layout">
            <style>{`
                /* PÁGINA */

                .historico-layout {
                    display: flex;
                    min-height: 100vh;
                    background: #080808;
                    color: #ffffff;
                }

                .historico-content {
                    flex: 1;
                    padding: 28px 32px 40px;
                    min-width: 0;
                }

                /* CABEÇALHO */

                .historico-header {
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #1d1d1d;
                }

                .historico-header h1 {
                    font-size: 30px;
                    color: #ffffff;
                    font-weight: 800;
                    letter-spacing: -1px;
                    margin-bottom: 8px;
                }

                .historico-header p {
                    color: #7d7d7d;
                    font-size: 11px;
                }

                /* LISTA */

                .historico-lista {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 20px;
                }

                /* CARDS */

                .historico-card {
                    position: relative;
                    overflow: hidden;
                    background: #0f0f0f;
                    border: 1px solid #1d1d1d;
                    border-radius: 18px;
                    padding: 24px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    cursor: pointer;
                    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
                }

                .historico-card::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: #c6ff00;
                    opacity: 0.8;
                }

                .historico-card:hover {
                    transform: translateY(-4px);
                    border-color: #3b4a13;
                    box-shadow: 0 8px 24px rgba(198, 255, 0, 0.07);
                }

                .historico-card:focus-visible {
                    outline: 2px solid #c6ff00;
                    outline-offset: 3px;
                }

                .historico-card-topo {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 12px;
                    margin-bottom: 22px;
                }

                .historico-card-topo h2 {
                    color: #ffffff;
                    font-size: 18px;
                    font-weight: 700;
                }

                /* STATUS */

                .historico-status {
                    background: #222a0a;
                    color: #c6ff00;
                    padding: 6px 11px;
                    border: 1px solid #39451a;
                    border-radius: 20px;
                    font-size: 10px;
                    font-weight: 800;
                    white-space: nowrap;
                    text-transform: uppercase;
                }

                .historico-status.cancelado {
                    background: #301717;
                    color: #ff7777;
                    border-color: #572828;
                }

                /* INFORMAÇÕES */

                .historico-card-info {
                    padding-top: 16px;
                    border-top: 1px solid #1f1f1f;
                }

                .historico-card-info p {
                    color: #777777;
                    font-size: 11px;
                    margin-top: 12px;
                    line-height: 1.6;
                }

                .historico-card-info strong {
                    color: #d5d5d5;
                    font-weight: 600;
                }

                .historico-ver-detalhes {
                    display: block;
                    margin-top: 20px;
                    color: #c6ff00;
                    font-size: 10px;
                    font-weight: 800;
                    transition: 0.2s;
                }

                .historico-card:hover .historico-ver-detalhes {
                    color: #d4ff38;
                }

                /* MENSAGENS */

                .historico-mensagem {
                    color: #777777;
                    padding: 20px 0;
                    font-size: 12px;
                }

                .historico-erro {
                    color: #ff5555;
                }

                .historico-vazio {
                    background: #0f0f0f;
                    border: 1px solid #1d1d1d;
                    border-radius: 18px;
                    padding: 40px 25px;
                    text-align: center;
                }

                .historico-vazio h2 {
                    font-size: 18px;
                    color: #c6ff00;
                    margin-bottom: 10px;
                }

                .historico-vazio p {
                    color: #777777;
                    font-size: 11px;
                }

                /* MODAL */

                .historico-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    z-index: 9999;
                    backdrop-filter: blur(5px);
                }

                .historico-modal {
                    position: relative;
                    background: #0f0f0f;
                    width: 100%;
                    max-width: 520px;
                    border: 1px solid #292929;
                    border-top: 3px solid #c6ff00;
                    border-radius: 18px;
                    padding: 35px;
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
                    animation: historicoModalEntrada 0.2s ease;
                }

                @keyframes historicoModalEntrada {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .historico-modal-fechar {
                    position: absolute;
                    top: 12px;
                    right: 18px;
                    border: none;
                    background: transparent;
                    font-size: 30px;
                    color: #777777;
                    cursor: pointer;
                    transition: color 0.2s ease;
                }

                .historico-modal-fechar:hover {
                    color: #c6ff00;
                }

                .historico-modal-header {
                    margin-bottom: 28px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #262626;
                }

                .historico-modal-header span {
                    color: #c6ff00;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 1px;
                }

                .historico-modal-header h2 {
                    color: #ffffff;
                    font-size: 24px;
                    margin-top: 10px;
                }

                .historico-modal-info {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }

                .historico-modal-info div {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #1f1f1f;
                }

                .historico-modal-info span {
                    color: #777777;
                    font-size: 10px;
                    font-weight: 600;
                }

                .historico-modal-info strong {
                    color: #e5e5e5;
                    font-size: 13px;
                }

                .historico-modal-status {
                    color: #c6ff00 !important;
                }

                .historico-modal-status.cancelado {
                    color: #ff7777 !important;
                }

                .historico-modal-botao {
                    width: 100%;
                    margin-top: 25px;
                    padding: 14px;
                    border: none;
                    border-radius: 10px;
                    background: #c6ff00;
                    color: #000000;
                    font-size: 11px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .historico-modal-botao:hover {
                    background: #d4ff38;
                    transform: translateY(-1px);
                }

                /* RESPONSIVIDADE */

                @media (max-width: 768px) {
                    .historico-content {
                        padding: 22px 18px 32px;
                    }

                    .historico-header h1 {
                        font-size: 25px;
                    }

                    .historico-lista {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 600px) {
                    .historico-modal {
                        padding: 28px 22px;
                    }

                    .historico-modal-header h2 {
                        font-size: 21px;
                    }

                    .historico-card-topo {
                        flex-wrap: wrap;
                    }
                }
            `}</style>

            <ClientSidebar
                name={user?.nome || "Aluno"}
                plan="Aluno"
            />

            <main className="historico-content">
                <div className="historico-header">
                    <h1>Histórico de Treinos</h1>
                    <p>
                        Confira seus treinos anteriores e acompanhe seu histórico.
                    </p>
                </div>

                {carregando && (
                    <p className="historico-mensagem">
                        Carregando seu histórico...
                    </p>
                )}

                {!carregando && erro && (
                    <p className="historico-mensagem historico-erro">
                        {erro}
                    </p>
                )}

                {!carregando && !erro && treinos.length === 0 && (
                    <div className="historico-vazio">
                        <h2>Nenhum treino no histórico</h2>
                        <p>
                            Quando você tiver treinos com datas anteriores
                            a hoje, eles aparecerão aqui.
                        </p>
                    </div>
                )}

                {!carregando && !erro && treinos.length > 0 && (
                    <div className="historico-lista">
                        {treinos.map((treino) => (
                            <article
                                className="historico-card"
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
                                <div className="historico-card-topo">
                                    <h2>{treino.titulo_treino}</h2>

                                    <span
                                        className={`historico-status ${treino.status?.toLowerCase() === "cancelado"
                                            ? "cancelado"
                                            : ""
                                            }`}
                                    >
                                        {treino.status}
                                    </span>
                                </div>

                                <div className="historico-card-info">
                                    <p>
                                        <strong>Profissional:</strong>{" "}
                                        {treino.nome_profissional}
                                    </p>

                                    <p>
                                        <strong>Data programada:</strong>{" "}
                                        {formatarData(treino.data_programada)}
                                    </p>
                                </div>

                                <span className="historico-ver-detalhes">
                                    Clique para ver detalhes
                                </span>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            {(carregandoDetalhes || treinoSelecionado || erroDetalhes) && (
                <div
                    className="historico-modal-overlay"
                    onClick={fecharModal}
                >
                    <div
                        className="historico-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="historico-modal-titulo"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="historico-modal-fechar"
                            onClick={fecharModal}
                            aria-label="Fechar modal"
                        >
                            ×
                        </button>

                        {carregandoDetalhes && (
                            <p className="historico-mensagem">
                                Carregando detalhes do treino...
                            </p>
                        )}

                        {erroDetalhes && (
                            <div>
                                <h2>Ops!</h2>
                                <p className="historico-erro">
                                    {erroDetalhes}
                                </p>

                                <button
                                    type="button"
                                    className="historico-modal-botao"
                                    onClick={fecharModal}
                                >
                                    Fechar
                                </button>
                            </div>
                        )}

                        {treinoSelecionado && (
                            <>
                                <div className="historico-modal-header">
                                    <span>DETALHES DO TREINO</span>

                                    <h2 id="historico-modal-titulo">
                                        {treinoSelecionado.titulo_treino}
                                    </h2>
                                </div>

                                <div className="historico-modal-info">
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
                                        <strong
                                            className={`historico-modal-status ${treinoSelecionado.status?.toLowerCase() === "cancelado"
                                                ? "cancelado"
                                                : ""
                                                }`}
                                        >
                                            {treinoSelecionado.status}
                                        </strong>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="historico-modal-botao"
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

export default HistoricoTreinos;
